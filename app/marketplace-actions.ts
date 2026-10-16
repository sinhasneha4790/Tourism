'use server';

import { and, eq, ne } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { updateTag } from 'next/cache';
import { del, put } from '@vercel/blob';
import { requireDb } from '@/lib/db';
import { hostProfiles, listings, users, type ListingPhoto } from '@/lib/db/schema';
import { getCurrentUser, type CurrentUser } from '@/lib/dal';
import { LISTINGS_TAG } from '@/lib/listings';
import { canEditListing, canSubmitForReview, statusAfterHostEdit } from '@/lib/permissions';
import { hostProfileSchema, listingSchema, PHOTO_MAX_BYTES, PHOTO_MAX_COUNT, PHOTO_TYPES, slugify } from '@/lib/validators';
import { sendEmail } from '@/lib/email';
import type { FormState } from '@/app/actions';

function fieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const out: Record<string, string> = {};
  for (const i of issues) out[String(i.path[0] ?? 'form')] ??= i.message;
  return out;
}

async function signedIn(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect('/signin');
  return user;
}

async function ownListing(user: CurrentUser, id: string) {
  const db = requireDb();
  const [listing] = await db.select().from(listings).where(eq(listings.id, id));
  if (!listing || !canEditListing(user, listing)) throw new Error('Listing not found');
  return listing;
}

/* --------------------------------- Hosts --------------------------------- */

export async function saveHostProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await signedIn();
  const parsed = hostProfileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: 'Please fix the highlighted fields.', errors: fieldErrors(parsed.error.issues) };
  const db = requireDb();
  const values = { ...parsed.data, bio: parsed.data.bio ?? '' };
  await db
    .insert(hostProfiles)
    .values({ userId: user.id, ...values })
    .onConflictDoUpdate({ target: hostProfiles.userId, set: values });
  if (user.role === 'traveller') await db.update(users).set({ role: 'host', phone: values.phone }).where(eq(users.id, user.id));
  updateTag(LISTINGS_TAG); // host display names appear on public listings
  redirect('/host/dashboard');
}

export async function saveListing(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await signedIn();
  if (!user.hasHostProfile && !user.isAdmin) redirect('/host');
  const parsed = listingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: 'Please fix the highlighted fields.', errors: fieldErrors(parsed.error.issues) };
  const db = requireDb();
  const data = parsed.data;
  const id = String(formData.get('id') ?? '');

  if (id) {
    const existing = await ownListing(user, id);
    await db
      .update(listings)
      .set({ ...data, status: statusAfterHostEdit(existing.status), updatedAt: new Date() })
      .where(eq(listings.id, id));
    updateTag(LISTINGS_TAG);
    return { ok: true, message: existing.status === 'approved' ? 'Saved. Your changes go live after a quick review.' : 'Saved.' };
  }

  const newId = crypto.randomUUID();
  await db.insert(listings).values({ ...data, id: newId, hostId: user.id, slug: `${slugify(data.title)}-${newId.slice(0, 6)}`, status: 'draft' });
  redirect(`/host/listings/${newId}?created=1`);
}

export async function submitListing(formData: FormData): Promise<void> {
  const user = await signedIn();
  const listing = await ownListing(user, String(formData.get('id')));
  if (!canSubmitForReview(listing.status)) return;
  const db = requireDb();
  await db.update(listings).set({ status: 'pending', submittedAt: new Date(), rejectionReason: null }).where(eq(listings.id, listing.id));
  await sendEmail({
    subject: `Listing awaiting review — ${listing.title}`,
    text: `A host submitted “${listing.title}” for review.\nOpen /admin to approve or reject it.`,
  });
  updateTag(LISTINGS_TAG);
  redirect(`/host/listings/${listing.id}?submitted=1`);
}

export async function uploadListingPhoto(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await signedIn();
  const listing = await ownListing(user, String(formData.get('id')));
  if (!process.env.BLOB_READ_WRITE_TOKEN) return { ok: false, message: 'Photo uploads aren’t switched on yet (BLOB_READ_WRITE_TOKEN is not set).' };

  const file = formData.get('photo');
  const alt = String(formData.get('alt') ?? '').trim();
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: 'Choose a photo to upload.' };
  if (!PHOTO_TYPES.includes(file.type as (typeof PHOTO_TYPES)[number])) return { ok: false, message: 'Use a JPEG, PNG or WebP image.' };
  if (file.size > PHOTO_MAX_BYTES) return { ok: false, message: 'Photos must be 4 MB or smaller.' };
  if (listing.photos.length >= PHOTO_MAX_COUNT) return { ok: false, message: `You can add up to ${PHOTO_MAX_COUNT} photos.` };
  if (alt.length < 3) return { ok: false, message: 'Describe the photo in a few words (for screen readers).' };

  const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
  const blob = await put(`listings/${listing.id}/${crypto.randomUUID()}.${ext}`, file, { access: 'public', contentType: file.type });
  const photos: ListingPhoto[] = [...listing.photos, { url: blob.url, alt: alt.slice(0, 140) }];
  await requireDb()
    .update(listings)
    .set({ photos, status: statusAfterHostEdit(listing.status), updatedAt: new Date() })
    .where(eq(listings.id, listing.id));
  updateTag(LISTINGS_TAG);
  return { ok: true, message: 'Photo added.' };
}

export async function removeListingPhoto(formData: FormData): Promise<void> {
  const user = await signedIn();
  const listing = await ownListing(user, String(formData.get('id')));
  const url = String(formData.get('url'));
  if (!listing.photos.some((p) => p.url === url)) return;
  await requireDb()
    .update(listings)
    .set({ photos: listing.photos.filter((p) => p.url !== url), updatedAt: new Date() })
    .where(eq(listings.id, listing.id));
  if (process.env.BLOB_READ_WRITE_TOKEN) await del(url).catch(() => undefined);
  updateTag(LISTINGS_TAG);
}

/* --------------------------------- Admin --------------------------------- */

async function admin(): Promise<CurrentUser> {
  const user = await signedIn();
  if (!user.isAdmin) throw new Error('Not allowed');
  return user;
}

export async function approveListing(formData: FormData): Promise<void> {
  await admin();
  const db = requireDb();
  const id = String(formData.get('id'));
  const [row] = await db
    .update(listings)
    .set({ status: 'approved', approvedAt: new Date(), rejectionReason: null })
    .where(and(eq(listings.id, id), ne(listings.status, 'draft')))
    .returning({ title: listings.title, hostId: listings.hostId, slug: listings.slug, type: listings.type });
  updateTag(LISTINGS_TAG);
  if (row)
    await notifyHost(
      row.hostId,
      `“${row.title}” is live on Mistrail`,
      `Good news — your listing is approved and now public at /${row.type === 'stay' ? 'stays' : 'experiences'}/${row.slug}.`,
    );
}

export async function rejectListing(_prev: FormState, formData: FormData): Promise<FormState> {
  await admin();
  const reason = String(formData.get('reason') ?? '').trim();
  if (reason.length < 5) return { ok: false, message: 'Tell the host what to change (at least a few words).' };
  const db = requireDb();
  const [row] = await db
    .update(listings)
    .set({ status: 'rejected', rejectionReason: reason.slice(0, 1000) })
    .where(eq(listings.id, String(formData.get('id'))))
    .returning({ title: listings.title, hostId: listings.hostId });
  updateTag(LISTINGS_TAG);
  if (row)
    await notifyHost(
      row.hostId,
      `Changes needed for “${row.title}”`,
      `Your listing needs a few changes before it can go live:\n\n${reason}\n\nEdit it from your host dashboard and resubmit.`,
    );
  return { ok: true, message: 'Listing sent back to the host.' };
}

async function notifyHost(hostId: string, subject: string, text: string) {
  if (!process.env.CONTACT_FROM_EMAIL) return; // needs a verified sender to email people other than the owner
  const [host] = await requireDb().select({ email: users.email }).from(users).where(eq(users.id, hostId));
  if (host?.email) await sendEmail({ to: host.email, subject, text });
}
