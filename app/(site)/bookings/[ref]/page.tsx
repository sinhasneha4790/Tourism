import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { eq } from 'drizzle-orm';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { requireDb } from '@/lib/db';
import { bookings, listings } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/dal';
import { holdIsActive, refundPreview, tokenMatches } from '@/lib/bookings';
import { fakePayments, publicKeyId } from '@/lib/razorpay';
import { cancelMyBooking } from '@/app/booking-actions';
import { formatInr } from '@/lib/format';
import { POLICY_SUMMARY } from '@/content/policies';
import { PayButton } from '@/components/booking/PayButton';

export const metadata: Metadata = { title: 'Your booking', robots: { index: false, follow: false } };

const STATUS = {
  enquiry: { icon: Clock, label: 'Enquiry', cls: 'bg-line-soft text-ink-2' },
  pending_payment: { icon: Clock, label: 'Awaiting payment', cls: 'bg-amber-bg text-amber-ink' },
  confirmed: { icon: CheckCircle2, label: 'Confirmed', cls: 'bg-forest text-white' },
  cancelled: { icon: XCircle, label: 'Cancelled', cls: 'bg-terracotta text-white' },
  refunded: { icon: XCircle, label: 'Refunded', cls: 'bg-ink-2 text-white' },
} as const;

async function BookingView({
  params,
  searchParams,
}: {
  params: Promise<{ ref: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { ref } = await params;
  const sp = await searchParams;
  const token = typeof sp.t === 'string' ? sp.t : '';
  const db = requireDb();
  const [row] = await db
    .select({ b: bookings, title: listings.title, slug: listings.slug, type: listings.type, location: listings.location })
    .from(bookings)
    .leftJoin(listings, eq(listings.id, bookings.listingId))
    .where(eq(bookings.ref, ref));
  if (!row) notFound();
  const { b } = row;
  const user = await getCurrentUser();
  const allowed = tokenMatches(b.accessToken, token) || (user && (user.id === b.userId || user.id === b.hostId || user.isAdmin || user.email === b.guestEmail));
  if (!allowed) notFound();

  const s = STATUS[b.status];
  const holdActive = holdIsActive(b);
  const refund = refundPreview(b);
  const canCancel = (b.status === 'confirmed' || b.status === 'pending_payment') && refund.daysBefore >= 0;
  const isStay = row.type !== 'experience';
  const keyId = publicKeyId();

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <span className={`flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-sm font-extrabold ${s.cls}`}>
            <s.icon size={16} aria-hidden="true" /> {s.label}
          </span>
          <h1 className="text-[clamp(32px,5vw,52px)] font-extrabold leading-tight tracking-[-0.03em]">{row.title ?? 'Your booking'}</h1>
          <p className="text-ink-3">
            Booking reference <strong className="text-ink">{b.ref}</strong>
            {row.location && ` · ${row.location}`}
          </p>
        </div>

        <dl className="grid gap-3 sm:grid-cols-3">
          {[[isStay ? 'Check-in' : 'Date', b.startDate], ...(isStay ? [['Check-out', b.endDate]] : []), ['Guests', String(b.guests)]].map(([k, v]) => (
            <div key={k} className="rounded-[20px] border border-line-soft bg-card p-4">
              <dt className="text-xs font-extrabold uppercase tracking-wider text-ink-3">{k}</dt>
              <dd className="mt-1 text-lg font-bold">{v}</dd>
            </div>
          ))}
        </dl>

        {b.status === 'confirmed' && (
          <p className="rounded-[20px] bg-teal-soft p-5 font-semibold text-teal">
            You’re booked! Your host will be in touch before your trip. Keep this page’s link — it’s your booking record.
          </p>
        )}
        {b.cancelReason && (
          <p className="rounded-[20px] bg-amber-bg p-5 text-amber-ink">
            {b.cancelReason}
            {b.refundDueInr ? ` · Refund ${b.status === 'refunded' ? 'issued' : 'due'}: ${formatInr(b.refundDueInr)}` : ''}
          </p>
        )}

        <section aria-labelledby="policy" className="rounded-[20px] border border-line-soft bg-card p-5">
          <h2 id="policy" className="font-extrabold">
            Cancellation policy
          </h2>
          <p className="mt-1 text-sm text-ink-2">{POLICY_SUMMARY[b.cancellationPolicy]}</p>
          {canCancel && (
            <form action={cancelMyBooking} className="mt-4 flex flex-col gap-2">
              <input type="hidden" name="ref" value={b.ref} />
              <input type="hidden" name="t" value={token} />
              <p className="text-sm text-ink-3">
                {b.status === 'confirmed'
                  ? `If you cancel today you’ll get ${formatInr(refund.amount)} back (${Math.round(refund.share * 100)}%).`
                  : 'You haven’t paid yet — cancelling releases the dates.'}
              </p>
              <button
                type="submit"
                className="h-11 w-fit rounded-full border border-terracotta px-5 font-bold text-terracotta hover:bg-terracotta hover:text-white"
              >
                Cancel booking
              </button>
            </form>
          )}
        </section>

        {row.slug && (
          <Link href={`/${isStay ? 'stays' : 'experiences'}/${row.slug}`} className="font-bold text-teal underline">
            View the listing →
          </Link>
        )}
      </div>

      <aside className="flex flex-col gap-3 rounded-[28px] bg-night p-7 text-white">
        <span className="eyebrow text-peach">Price breakdown</span>
        <dl className="flex flex-col gap-2 text-[15px]">
          <div className="flex justify-between">
            <dt className="text-night-soft">{isStay ? `${b.nights} ${b.nights === 1 ? 'night' : 'nights'}` : 'Experience'}</dt>
            <dd className="font-bold">{formatInr(b.subtotalInr)}</dd>
          </div>
          {b.serviceFeeInr > 0 && (
            <div className="flex justify-between">
              <dt className="text-night-soft">Service fee</dt>
              <dd className="font-bold">{formatInr(b.serviceFeeInr)}</dd>
            </div>
          )}
          {b.taxInr > 0 && (
            <div className="flex justify-between">
              <dt className="text-night-soft">Taxes</dt>
              <dd className="font-bold">{formatInr(b.taxInr)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-night-line pt-2 text-lg">
            <dt className="font-extrabold">Total</dt>
            <dd className="font-extrabold">{formatInr(b.amountInr)}</dd>
          </div>
        </dl>
        {holdActive && b.razorpayOrderId && keyId && (
          <PayButton
            label={`Pay ${formatInr(b.amountInr)}`}
            order={{
              ref: b.ref,
              token: b.accessToken,
              orderId: b.razorpayOrderId,
              amountPaise: b.amountInr * 100,
              keyId,
              fake: fakePayments,
              name: b.guestName,
              email: b.guestEmail,
              phone: b.guestPhone ?? '',
              description: row.title ?? 'Mistrail booking',
            }}
          />
        )}
        {b.status === 'pending_payment' && !holdActive && <p className="text-sm text-peach-soft">This hold has expired. Book again from the listing page.</p>}
      </aside>
    </div>
  );
}

export default function BookingPage({ params, searchParams }: PageProps<'/bookings/[ref]'>) {
  return (
    <div className="container-site py-12 md:py-16">
      <Suspense fallback={<div className="h-96 rounded-[28px] border border-line-soft bg-card" />}>
        <BookingView params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
