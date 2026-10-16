'use server';

import { and, eq, inArray, isNull, lte } from 'drizzle-orm';
import { headers } from 'next/headers';
import { revalidatePath, updateTag } from 'next/cache';
import { z } from 'zod';
import { requireDb } from '@/lib/db';
import { availability, bookings, listings, payouts } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/dal';
import { cancelBooking, confirmPaidBooking, createBooking, quoteForListing, tokenMatches } from '@/lib/bookings';
import { fakeCheckoutResult, fakePayments, paymentsEnabled, refundPayment, verifyPaymentSignature } from '@/lib/razorpay';
import { savePricingSettings } from '@/lib/settings';
import { canEditListing } from '@/lib/permissions';
import { isIsoDate, todayIst } from '@/lib/pricing';
import { rateLimit } from '@/lib/rate-limit';
import { LISTINGS_TAG } from '@/lib/listings';

const isoDate = z.string().refine(isIsoDate, 'Choose a date');

/* ------------------------------ Traveller side ----------------------------- */

const quoteInput = z.object({
  listingId: z.string().min(1).max(64),
  start: isoDate,
  end: isoDate.optional(),
  guests: z.coerce.number().int().min(1).max(50),
});

export async function getQuote(input: z.input<typeof quoteInput>) {
  const parsed = quoteInput.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: 'Choose your dates and guests.' };
  return quoteForListing(parsed.data);
}

const bookingInput = quoteInput.extend({
  guestName: z.string().trim().min(2, 'Please tell us your name').max(80),
  guestEmail: z.email('Please enter a valid email'),
  guestPhone: z
    .string()
    .trim()
    .max(20)
    .regex(/^[+\d\s()-]*$/, 'Digits, spaces and + only')
    .optional()
    .or(z.literal('')),
});

export type StartBookingResult =
  | { ok: true; ref: string; token: string; orderId: string; amountPaise: number; keyId: string; fake: boolean; name: string; email: string; phone: string }
  | { ok: false; error: string };

export async function startBooking(input: z.input<typeof bookingInput>): Promise<StartBookingResult> {
  if (!paymentsEnabled()) return { ok: false, error: 'Online booking isn’t open yet — please send an enquiry instead.' };
  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!rateLimit(`booking:${ip}`, 10, 60_000)) return { ok: false, error: 'Too many attempts. Please wait a minute.' };

  const parsed = bookingInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Please check your details.' };
  const user = await getCurrentUser();
  const result = await createBooking({ ...parsed.data, guestPhone: parsed.data.guestPhone || undefined, userId: user?.id ?? null });
  if (!result.ok) return result;
  const b = result.booking;
  return {
    ok: true,
    ref: b.ref,
    token: b.accessToken,
    orderId: result.order.id,
    amountPaise: result.order.amountPaise,
    keyId: result.order.keyId,
    fake: fakePayments,
    name: b.guestName,
    email: b.guestEmail,
    phone: b.guestPhone ?? '',
  };
}

/** Called by the Razorpay Checkout success handler. The signature proves the payment is genuine. */
export async function verifyCheckout(input: { ref: string; token: string; orderId: string; paymentId: string; signature: string }) {
  if (!verifyPaymentSignature(input.orderId, input.paymentId, input.signature)) return { ok: false as const, error: 'We couldn’t verify that payment.' };
  const [b] = await requireDb().select().from(bookings).where(eq(bookings.ref, input.ref));
  if (!b || b.razorpayOrderId !== input.orderId || !tokenMatches(b.accessToken, input.token)) return { ok: false as const, error: 'Booking not found.' };
  const confirmed = await confirmPaidBooking(input.orderId, input.paymentId);
  return { ok: true as const, status: confirmed?.status ?? b.status };
}

/** Local/CI only: simulates Razorpay Checkout, then runs the real verification path. */
export async function completeFakePayment(input: { ref: string; token: string; orderId: string }) {
  if (!fakePayments) return { ok: false as const, error: 'Not available' };
  const r = fakeCheckoutResult(input.orderId);
  return verifyCheckout({ ref: input.ref, token: input.token, ...r });
}

export async function cancelMyBooking(formData: FormData): Promise<void> {
  const ref = String(formData.get('ref'));
  const token = String(formData.get('t') ?? '');
  const [b] = await requireDb().select().from(bookings).where(eq(bookings.ref, ref));
  if (!b) return;
  const user = await getCurrentUser();
  const allowed = tokenMatches(b.accessToken, token) || (user && (user.id === b.userId || user.email === b.guestEmail || user.isAdmin));
  if (!allowed) return;
  await cancelBooking(b, user?.isAdmin && user.id !== b.userId && user.email !== b.guestEmail ? 'Cancelled by Mistrail' : 'Cancelled by traveller');
  revalidatePath(`/bookings/${b.ref}`);
}

/* -------------------------------- Host side -------------------------------- */

async function ownListing(listingId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Sign in required');
  const [l] = await requireDb().select().from(listings).where(eq(listings.id, listingId));
  if (!l || !canEditListing(user, l)) throw new Error('Listing not found');
  return l;
}

/** Toggle a date open/closed and optionally set a special price. */
export async function setDate(formData: FormData): Promise<void> {
  const listing = await ownListing(String(formData.get('listingId')));
  const date = String(formData.get('date'));
  if (!isIsoDate(date)) return;
  const available = formData.get('available') === 'true';
  const priceRaw = String(formData.get('price') ?? '').trim();
  const price = priceRaw ? Math.round(Number(priceRaw)) : null;
  const priceOverrideInr = price && price >= 100 && price <= 500000 ? price : null;
  const db = requireDb();
  if (available && !priceOverrideInr) {
    await db.delete(availability).where(and(eq(availability.listingId, listing.id), eq(availability.date, date)));
  } else {
    await db
      .insert(availability)
      .values({ listingId: listing.id, date, available, priceOverrideInr })
      .onConflictDoUpdate({ target: [availability.listingId, availability.date], set: { available, priceOverrideInr } });
  }
  updateTag(LISTINGS_TAG);
}

/* -------------------------------- Admin side ------------------------------- */

async function admin() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) throw new Error('Not allowed');
  return user;
}

const pct = z.coerce.number().min(0).max(50);
const settingsInput = z.object({ commissionStay: pct, commissionExperience: pct, serviceFeePct: pct, taxPct: pct });

export async function savePricing(_prev: { ok: boolean; message: string }, formData: FormData) {
  await admin();
  const p = settingsInput.safeParse(Object.fromEntries(formData));
  if (!p.success) return { ok: false, message: 'Percentages must be between 0 and 50.' };
  await savePricingSettings({
    commissionPct: { stay: p.data.commissionStay, experience: p.data.commissionExperience },
    serviceFeePct: p.data.serviceFeePct,
    taxPct: p.data.taxPct,
  });
  revalidatePath('/admin');
  return { ok: true, message: 'Saved. New bookings use these rates; existing bookings keep theirs.' };
}

/** Issues the refund that is due on a cancelled booking (Razorpay test mode until go-live). */
export async function refundBooking(formData: FormData): Promise<void> {
  await admin();
  const db = requireDb();
  const [b] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, String(formData.get('id'))));
  if (!b || b.status !== 'cancelled' || !b.refundDueInr || !b.razorpayPaymentId) return;
  const refundId = await refundPayment(b.razorpayPaymentId, b.refundDueInr);
  await db.update(bookings).set({ status: 'refunded', razorpayRefundId: refundId, refundedAt: new Date() }).where(eq(bookings.id, b.id));
  revalidatePath('/admin');
}

/** Records a payout for a host's completed, confirmed bookings that haven't been paid out yet. */
export async function recordPayout(formData: FormData): Promise<void> {
  await admin();
  const db = requireDb();
  const hostId = String(formData.get('hostId'));
  const due = await db
    .select({ id: bookings.id, payout: bookings.hostPayoutInr })
    .from(bookings)
    .where(and(eq(bookings.hostId, hostId), eq(bookings.status, 'confirmed'), isNull(bookings.payoutId), lte(bookings.endDate, todayIst())));
  if (!due.length) return;
  await db.transaction(async (tx) => {
    const [p] = await tx
      .insert(payouts)
      .values({
        hostId,
        amountInr: due.reduce((n, d) => n + d.payout, 0),
        bookingIds: due.map((d) => d.id),
        status: 'paid',
        paidAt: new Date(),
        note: 'Recorded from admin',
      })
      .returning();
    await tx
      .update(bookings)
      .set({ payoutId: p.id })
      .where(
        inArray(
          bookings.id,
          due.map((d) => d.id),
        ),
      );
  });
  revalidatePath('/admin');
}
