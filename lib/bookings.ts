import 'server-only';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { and, eq, gt, gte, inArray, lt, or, sql } from 'drizzle-orm';
import { requireDb, type Db } from '@/lib/db';
import { availability, bookings, hostProfiles, listings, users, type Booking, type Listing } from '@/lib/db/schema';
import { getPricingSettings } from '@/lib/settings';
import { addDays, daysBetween, eachNight, quoteBooking, refundFor, todayIst, type QuoteResult } from '@/lib/pricing';
import { createOrder, publicKeyId } from '@/lib/razorpay';
import { canEmailTravellers, sendEmail } from '@/lib/email';
import { PAYMENT_HOLD_MINUTES } from '@/content/policies';
import { SITE } from '@/content/site';
import { formatInr } from '@/lib/format';

type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];

const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function newRef() {
  const bytes = randomBytes(6);
  return `MT-${Array.from(bytes, (b) => REF_ALPHABET[b % REF_ALPHABET.length]).join('')}`;
}

export function bookingUrl(b: Pick<Booking, 'ref' | 'accessToken'>) {
  return `${SITE.url}/bookings/${b.ref}?t=${b.accessToken}`;
}

export function tokenMatches(expected: string, given: string | null | undefined): boolean {
  if (!given) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(given);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** A booking holds its dates while confirmed, or while an unpaid hold is still valid. */
const holdsDates = () => or(eq(bookings.status, 'confirmed'), and(eq(bookings.status, 'pending_payment'), gt(bookings.expiresAt, sql`now()`)));

async function approvedListing(q: Db | Tx, listingId: string): Promise<Listing | null> {
  const [l] = await q
    .select()
    .from(listings)
    .where(and(eq(listings.id, listingId), eq(listings.status, 'approved')));
  return l ?? null;
}

async function dateOverrides(q: Db | Tx, listingId: string, from: string, to: string) {
  const rows = await q
    .select()
    .from(availability)
    .where(and(eq(availability.listingId, listingId), gte(availability.date, from), lt(availability.date, to)));
  const prices: Record<string, number> = {};
  const blocked = new Set<string>();
  for (const r of rows) {
    if (!r.available) blocked.add(r.date);
    if (r.priceOverrideInr) prices[r.date] = r.priceOverrideInr;
  }
  return { prices, blocked };
}

/** Returns an error message when the dates can't be booked, otherwise null. */
async function availabilityError(q: Db | Tx, listing: Listing, start: string, end: string, guests: number, excludeId?: string): Promise<string | null> {
  const { blocked } = await dateOverrides(q, listing.id, start, end);
  const nights = listing.type === 'stay' ? eachNight(start, daysBetween(start, end)) : [start];
  if (nights.some((d) => blocked.has(d))) return 'The host isn’t available on some of those dates.';

  const clash = await q
    .select({ id: bookings.id, guests: bookings.guests })
    .from(bookings)
    .where(and(eq(bookings.listingId, listing.id), holdsDates(), lt(bookings.startDate, end), gt(bookings.endDate, start)));
  const others = clash.filter((c) => c.id !== excludeId);
  if (listing.type === 'stay') return others.length ? 'Those dates are already booked.' : null;
  const taken = others.reduce((n, c) => n + c.guests, 0);
  const left = listing.maxGuests - taken;
  return guests > left ? (left > 0 ? `Only ${left} ${left === 1 ? 'place' : 'places'} left on that date.` : 'That date is fully booked.') : null;
}

export interface QuoteRequest {
  listingId: string;
  start: string;
  end?: string;
  guests: number;
}

/** Price + availability for the booking widget. */
export async function quoteForListing(req: QuoteRequest): Promise<QuoteResult & { available?: boolean }> {
  const db = requireDb();
  const listing = await approvedListing(db, req.listingId);
  if (!listing) return { ok: false, error: 'This listing is no longer available.' };
  const end = listing.type === 'stay' ? req.end : addDays(req.start, 1);
  const { prices } = end ? await dateOverrides(db, listing.id, req.start, end) : { prices: {} };
  const result = quoteBooking({ ...listing, start: req.start, end, guests: req.guests, overrides: prices }, await getPricingSettings());
  if (!result.ok) return result;
  const error = await availabilityError(db, listing, result.quote.start, result.quote.end, req.guests);
  return error ? { ok: false, error } : result;
}

export interface NewBooking extends QuoteRequest {
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  userId?: string | null;
}

export type CreateResult = { ok: true; booking: Booking; order: { id: string; amountPaise: number; keyId: string } } | { ok: false; error: string };

/**
 * Creates a pending booking and its Razorpay order. Availability is re-checked inside a
 * transaction holding a per-listing advisory lock, so two travellers can't take the same dates.
 */
export async function createBooking(input: NewBooking): Promise<CreateResult> {
  const db = requireDb();
  const settings = await getPricingSettings();

  const created = await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${input.listingId}))`);
    const listing = await approvedListing(tx, input.listingId);
    if (!listing) return { ok: false as const, error: 'This listing is no longer available.' };
    const end = listing.type === 'stay' ? input.end : addDays(input.start, 1);
    const { prices } = end ? await dateOverrides(tx, listing.id, input.start, end) : { prices: {} };
    const q = quoteBooking({ ...listing, start: input.start, end, guests: input.guests, overrides: prices }, settings);
    if (!q.ok) return q;
    const error = await availabilityError(tx, listing, q.quote.start, q.quote.end, input.guests);
    if (error) return { ok: false as const, error };

    const [booking] = await tx
      .insert(bookings)
      .values({
        ref: newRef(),
        accessToken: randomBytes(24).toString('base64url'),
        listingId: listing.id,
        hostId: listing.hostId,
        userId: input.userId ?? null,
        guestName: input.guestName,
        guestEmail: input.guestEmail.toLowerCase(),
        guestPhone: input.guestPhone || null,
        startDate: q.quote.start,
        endDate: q.quote.end,
        guests: input.guests,
        nights: q.quote.nights,
        subtotalInr: q.quote.subtotal,
        serviceFeeInr: q.quote.serviceFee,
        taxInr: q.quote.tax,
        amountInr: q.quote.total,
        commissionPct: q.quote.commissionPct,
        commissionInr: q.quote.commission,
        hostPayoutInr: q.quote.hostPayout,
        cancellationPolicy: listing.cancellationPolicy,
        status: 'pending_payment',
        expiresAt: new Date(Date.now() + PAYMENT_HOLD_MINUTES * 60_000),
      })
      .returning();
    return { ok: true as const, booking, title: listing.title };
  });
  if (!created.ok) return created;

  try {
    const order = await createOrder(created.booking.amountInr, created.booking.ref, { booking: created.booking.ref, listing: created.title });
    const [booking] = await db.update(bookings).set({ razorpayOrderId: order.id }).where(eq(bookings.id, created.booking.id)).returning();
    return { ok: true, booking, order: { id: order.id, amountPaise: order.amount, keyId: publicKeyId()! } };
  } catch (err) {
    console.error('[booking] order creation failed', err);
    await db
      .update(bookings)
      .set({ status: 'cancelled', cancelReason: 'Payment could not be started', cancelledAt: new Date() })
      .where(eq(bookings.id, created.booking.id));
    return { ok: false, error: 'We couldn’t start the payment. Please try again in a minute.' };
  }
}

/**
 * Marks a booking paid. Idempotent — called from the Checkout handler and from the webhook.
 * If an expired hold is paid after someone else took the dates, the booking is cancelled
 * with a full refund due instead of double-booking the listing.
 */
export async function confirmPaidBooking(orderId: string, paymentId: string): Promise<Booking | null> {
  const db = requireDb();
  const result = await db.transaction(async (tx) => {
    const [b] = await tx.select().from(bookings).where(eq(bookings.razorpayOrderId, orderId));
    if (!b) return null;
    if (b.status !== 'pending_payment') return { booking: b, changed: false };
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${b.listingId ?? b.id}))`);
    const listing = b.listingId ? (await tx.select().from(listings).where(eq(listings.id, b.listingId)))[0] : null;
    const clash = listing ? await availabilityError(tx, listing, b.startDate, b.endDate, b.guests, b.id) : null;
    const [updated] = await tx
      .update(bookings)
      .set(
        clash
          ? {
              status: 'cancelled',
              razorpayPaymentId: paymentId,
              cancelledAt: new Date(),
              refundDueInr: b.amountInr,
              cancelReason: 'Paid after the hold expired and the dates were taken — full refund due',
            }
          : { status: 'confirmed', razorpayPaymentId: paymentId, confirmedAt: new Date(), expiresAt: null },
      )
      .where(and(eq(bookings.id, b.id), eq(bookings.status, 'pending_payment')))
      .returning();
    return { booking: updated ?? b, changed: Boolean(updated) };
  });
  if (!result) return null;
  if (result.changed) await notifyBooking(result.booking);
  return result.booking;
}

export async function markRefunded(paymentId: string, refundId: string): Promise<void> {
  await requireDb()
    .update(bookings)
    .set({ status: 'refunded', razorpayRefundId: refundId, refundedAt: new Date() })
    .where(and(eq(bookings.razorpayPaymentId, paymentId), inArray(bookings.status, ['cancelled', 'confirmed'])));
}

/** True while an unpaid booking still holds its dates and can be paid. */
export function holdIsActive(b: Pick<Booking, 'status' | 'expiresAt'>, now = Date.now()): boolean {
  return b.status === 'pending_payment' && Boolean(b.expiresAt && b.expiresAt.getTime() > now);
}

export function refundPreview(b: Pick<Booking, 'cancellationPolicy' | 'startDate' | 'amountInr' | 'status'>, today = todayIst()) {
  const daysBefore = daysBetween(today, b.startDate);
  return { daysBefore, ...refundFor(b.cancellationPolicy, daysBefore, b.status === 'confirmed' ? b.amountInr : 0) };
}

/** Traveller cancellation. Unpaid holds are simply released; paid bookings get a refund due. */
export async function cancelBooking(b: Booking, reason: string): Promise<Booking> {
  const db = requireDb();
  const preview = refundPreview(b);
  const [updated] = await db
    .update(bookings)
    .set({ status: 'cancelled', cancelledAt: new Date(), cancelReason: reason, refundDueInr: b.status === 'confirmed' ? preview.amount : 0 })
    .where(and(eq(bookings.id, b.id), inArray(bookings.status, ['pending_payment', 'confirmed'])))
    .returning();
  if (updated && b.status === 'confirmed') await notifyCancellation(updated);
  return updated ?? b;
}

/* ---------------------------------- Email --------------------------------- */

async function bookingContext(b: Booking) {
  const db = requireDb();
  const [row] = b.listingId
    ? await db
        .select({ title: listings.title, location: listings.location, hostEmail: users.email, hostName: hostProfiles.displayName })
        .from(listings)
        .innerJoin(users, eq(users.id, listings.hostId))
        .leftJoin(hostProfiles, eq(hostProfiles.userId, listings.hostId))
        .where(eq(listings.id, b.listingId))
    : [];
  return row ?? { title: 'your trip', location: '', hostEmail: null, hostName: null };
}

function summary(b: Booking, title: string) {
  return [
    `Booking ${b.ref} — ${title}`,
    `Dates: ${b.startDate}${b.nights > 1 || b.endDate !== addDays(b.startDate, 1) ? ` to ${b.endDate} (${b.nights} nights)` : ''}`,
    `Guests: ${b.guests}`,
    `Total paid: ${formatInr(b.amountInr)}`,
  ].join('\n');
}

async function notifyBooking(b: Booking) {
  const ctx = await bookingContext(b);
  const text = summary(b, ctx.title);
  if (b.status === 'confirmed') {
    await sendEmail({ subject: `New booking ${b.ref} — ${ctx.title}`, text: `${text}\nGuest: ${b.guestName} <${b.guestEmail}> ${b.guestPhone ?? ''}` });
    if (canEmailTravellers()) {
      await sendEmail({
        to: b.guestEmail,
        subject: `Booking confirmed — ${ctx.title}`,
        text: `Hi ${b.guestName.split(' ')[0]},\n\nYou’re booked!\n\n${text}\n\nView or cancel: ${bookingUrl(b)}\n\n— Mistrail`,
      });
      if (ctx.hostEmail)
        await sendEmail({
          to: ctx.hostEmail,
          subject: `New booking ${b.ref}`,
          text: `${text}\nGuest: ${b.guestName}\nYour payout: ${formatInr(b.hostPayoutInr)}`,
        });
    }
  } else {
    await sendEmail({ subject: `Refund due — ${b.ref}`, text: `${text}\n${b.cancelReason}` });
  }
}

async function notifyCancellation(b: Booking) {
  const ctx = await bookingContext(b);
  const text = `${summary(b, ctx.title)}\nRefund due: ${formatInr(b.refundDueInr ?? 0)}`;
  await sendEmail({ subject: `Booking cancelled — ${b.ref}`, text });
  if (canEmailTravellers()) {
    await sendEmail({
      to: b.guestEmail,
      subject: `Booking cancelled — ${ctx.title}`,
      text: `${text}\n\nRefunds go back to your original payment method within 7–10 working days.`,
    });
    if (ctx.hostEmail) await sendEmail({ to: ctx.hostEmail, subject: `Booking ${b.ref} was cancelled`, text: summary(b, ctx.title) });
  }
}
