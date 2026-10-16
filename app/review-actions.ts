'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath, updateTag } from 'next/cache';
import { z } from 'zod';
import { requireDb } from '@/lib/db';
import { bookings, listings, reviews } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/dal';
import { tokenMatches } from '@/lib/bookings';
import { todayIst } from '@/lib/pricing';
import { averageRating, canReview, publicName, REVIEW_MAX_CHARS, REVIEW_MIN_CHARS } from '@/lib/review-rules';
import { canEditListing } from '@/lib/permissions';
import { LISTINGS_TAG } from '@/lib/listings';

export interface ReviewFormState {
  ok: boolean;
  message: string;
}

const reviewInput = z.object({
  ref: z.string().min(1).max(20),
  t: z.string().max(100).optional(),
  rating: z.coerce.number({ error: 'Choose a star rating' }).int().min(1, 'Choose a star rating').max(5),
  text: z.string().trim().min(REVIEW_MIN_CHARS, `Tell other travellers a little more (at least ${REVIEW_MIN_CHARS} characters).`).max(REVIEW_MAX_CHARS),
});

/** Recomputes a listing's published average rating and count. */
async function refreshListingRating(listingId: string) {
  const db = requireDb();
  const rows = await db
    .select({ rating: reviews.rating })
    .from(reviews)
    .where(and(eq(reviews.listingId, listingId), eq(reviews.published, true)));
  await db
    .update(listings)
    .set({ rating: averageRating(rows.map((r) => r.rating)), reviewCount: rows.length })
    .where(eq(listings.id, listingId));
  updateTag(LISTINGS_TAG);
}

export async function submitReview(_prev: ReviewFormState, formData: FormData): Promise<ReviewFormState> {
  const parsed = reviewInput.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? 'Please check your review.' };
  const { ref, t, rating, text } = parsed.data;
  const db = requireDb();
  const [b] = await db.select().from(bookings).where(eq(bookings.ref, ref));
  if (!b?.listingId) return { ok: false, message: 'Booking not found.' };
  const user = await getCurrentUser();
  const allowed = tokenMatches(b.accessToken, t) || (user && (user.id === b.userId || user.email === b.guestEmail));
  if (!allowed) return { ok: false, message: 'Booking not found.' };
  if (!canReview(b, todayIst())) return { ok: false, message: 'Reviews open once your stay is over.' };

  const inserted = await db
    .insert(reviews)
    .values({ bookingId: b.id, listingId: b.listingId, authorName: publicName(b.guestName), rating, text })
    .onConflictDoNothing({ target: reviews.bookingId })
    .returning({ id: reviews.id });
  if (!inserted.length) return { ok: false, message: 'You’ve already reviewed this booking.' };
  await refreshListingRating(b.listingId);
  revalidatePath(`/bookings/${ref}`);
  return { ok: true, message: 'Thank you — your review is live.' };
}

export async function replyToReview(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  const db = requireDb();
  const [row] = await db
    .select({ review: reviews, hostId: listings.hostId })
    .from(reviews)
    .innerJoin(listings, eq(listings.id, reviews.listingId))
    .where(eq(reviews.id, String(formData.get('id'))));
  if (!row || !canEditListing(user, { hostId: row.hostId })) return;
  const reply = String(formData.get('reply') ?? '')
    .trim()
    .slice(0, 1000);
  await db
    .update(reviews)
    .set({ hostReply: reply || null })
    .where(eq(reviews.id, row.review.id));
  updateTag(LISTINGS_TAG);
  revalidatePath('/host/dashboard');
}

export async function setReviewPublished(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return;
  const db = requireDb();
  const [r] = await db
    .update(reviews)
    .set({ published: formData.get('published') === 'true' })
    .where(eq(reviews.id, String(formData.get('id'))))
    .returning({ listingId: reviews.listingId });
  if (r) await refreshListingRating(r.listingId);
  revalidatePath('/admin');
}
