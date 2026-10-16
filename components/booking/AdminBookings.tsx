import Link from 'next/link';
import { and, desc, eq, gt, isNull, lte, sql } from 'drizzle-orm';
import { requireDb } from '@/lib/db';
import { bookings, hostProfiles, listings } from '@/lib/db/schema';
import { getPricingSettings } from '@/lib/settings';
import { paymentsStatus } from '@/lib/razorpay';
import { refundBooking, recordPayout } from '@/app/booking-actions';
import { formatInr } from '@/lib/format';
import { todayIst } from '@/lib/pricing';
import { PricingForm } from './PricingForm';
import { BookingStatus } from './BookingList';

const MODE = {
  fake: ['Local test gateway', 'bg-amber-bg text-amber-ink', 'Development only — no real money moves.'],
  test: ['Razorpay TEST mode', 'bg-amber-bg text-amber-ink', 'Payments use Razorpay test keys. Use Razorpay’s test cards; no real money moves.'],
  live: ['Razorpay LIVE', 'bg-forest text-white', 'Real payments are being taken.'],
  'live-blocked': ['Live keys blocked', 'bg-terracotta text-white', 'Live keys are set but PAYMENTS_LIVE_APPROVED is not — online payment is switched off.'],
  off: ['Payments off', 'bg-line-soft text-ink-2', 'Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET (test keys) to open online booking.'],
} as const;

/** Admin: payment mode, pricing settings, refunds due, commission report and recent bookings. */
export async function AdminBookings() {
  const db = requireDb();
  const today = todayIst();
  const [settings, refunds, recent, report, owedByHost] = await Promise.all([
    getPricingSettings(),
    db
      .select({ b: bookings, title: listings.title })
      .from(bookings)
      .leftJoin(listings, eq(listings.id, bookings.listingId))
      .where(and(eq(bookings.status, 'cancelled'), gt(bookings.refundDueInr, 0)))
      .orderBy(desc(bookings.cancelledAt)),
    db
      .select({ b: bookings, title: listings.title })
      .from(bookings)
      .leftJoin(listings, eq(listings.id, bookings.listingId))
      .orderBy(desc(bookings.createdAt))
      .limit(25),
    db
      .select({
        month: sql<string>`to_char(${bookings.startDate}, 'YYYY-MM')`,
        n: sql<number>`count(*)::int`,
        gross: sql<number>`coalesce(sum(${bookings.amountInr}), 0)::int`,
        commission: sql<number>`coalesce(sum(${bookings.commissionInr}), 0)::int`,
        payouts: sql<number>`coalesce(sum(${bookings.hostPayoutInr}), 0)::int`,
      })
      .from(bookings)
      .where(eq(bookings.status, 'confirmed'))
      .groupBy(sql`1`)
      .orderBy(sql`1 desc`)
      .limit(12),
    db
      .select({
        hostId: bookings.hostId,
        host: hostProfiles.displayName,
        n: sql<number>`count(*)::int`,
        owed: sql<number>`coalesce(sum(${bookings.hostPayoutInr}), 0)::int`,
      })
      .from(bookings)
      .leftJoin(hostProfiles, eq(hostProfiles.userId, bookings.hostId))
      .where(and(eq(bookings.status, 'confirmed'), isNull(bookings.payoutId), lte(bookings.endDate, today)))
      .groupBy(bookings.hostId, hostProfiles.displayName),
  ]);
  const [label, cls, note] = MODE[paymentsStatus()];

  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="payments" className="flex flex-col gap-4 rounded-[24px] border border-line-soft bg-card p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="payments" className="text-2xl font-extrabold">
            Payments &amp; rates
          </h2>
          <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${cls}`}>{label}</span>
        </div>
        <p className="text-sm text-ink-3">{note}</p>
        <PricingForm current={settings} />
      </section>

      <section aria-labelledby="refunds" className="flex flex-col gap-4">
        <h2 id="refunds" className="text-2xl font-extrabold">
          Refunds due
        </h2>
        {refunds.length === 0 ? (
          <p className="text-ink-3">No refunds waiting.</p>
        ) : (
          <ul className="grid gap-3">
            {refunds.map(({ b, title }) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-line-soft bg-card p-5">
                <span className="flex flex-col gap-1">
                  <strong>
                    {b.ref} · {title}
                  </strong>
                  <span className="text-sm text-ink-3">
                    {b.guestName} · paid {formatInr(b.amountInr)} · {b.cancelReason}
                  </span>
                </span>
                <form action={refundBooking}>
                  <input type="hidden" name="id" value={b.id} />
                  <button type="submit" className="h-11 rounded-full bg-terracotta px-5 font-extrabold text-white" disabled={!b.razorpayPaymentId}>
                    Refund {formatInr(b.refundDueInr ?? 0)}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="commission" className="flex flex-col gap-4">
        <h2 id="commission" className="text-2xl font-extrabold">
          Commission report
        </h2>
        {report.length === 0 ? (
          <p className="text-ink-3">No confirmed bookings yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-[20px] border border-line-soft bg-card">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-teal-soft">
                <tr>
                  {['Month (stay start)', 'Bookings', 'Guests paid', 'Mistrail commission', 'Host payouts'].map((h) => (
                    <th key={h} scope="col" className="px-4 py-3 font-extrabold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.map((r) => (
                  <tr key={r.month} className="border-t border-line-soft">
                    <td className="px-4 py-3 font-bold">{r.month}</td>
                    <td className="px-4 py-3">{r.n}</td>
                    <td className="px-4 py-3">{formatInr(r.gross)}</td>
                    <td className="px-4 py-3">{formatInr(r.commission)}</td>
                    <td className="px-4 py-3">{formatInr(r.payouts)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <h3 className="text-lg font-extrabold">Payouts owed (completed stays)</h3>
        {owedByHost.length === 0 ? (
          <p className="text-ink-3">Nothing owed right now.</p>
        ) : (
          <ul className="grid gap-3">
            {owedByHost.map((h) => (
              <li key={h.hostId ?? 'none'} className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-line-soft bg-card p-5">
                <span>
                  <strong>{h.host ?? 'Host'}</strong> · {h.n} {h.n === 1 ? 'booking' : 'bookings'} · {formatInr(h.owed)}
                </span>
                {h.hostId && (
                  <form action={recordPayout}>
                    <input type="hidden" name="hostId" value={h.hostId} />
                    <button type="submit" className="h-11 rounded-full bg-forest px-5 font-extrabold text-white">
                      Record payout of {formatInr(h.owed)}
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-ink-3">
          Recording a payout marks those bookings as paid out; transfer the money to the host from your bank or Razorpay Route.
        </p>
      </section>

      <section aria-labelledby="bookings" className="flex flex-col gap-4">
        <h2 id="bookings" className="text-2xl font-extrabold">
          Latest bookings
        </h2>
        {recent.length === 0 ? (
          <p className="text-ink-3">No bookings yet.</p>
        ) : (
          <ul className="grid gap-2">
            {recent.map(({ b, title }) => (
              <li key={b.id}>
                <Link
                  href={`/bookings/${b.ref}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line-soft bg-card px-4 py-3 hover:border-sage"
                >
                  <span className="flex flex-wrap items-center gap-3">
                    <BookingStatus status={b.status} />
                    <strong>{b.ref}</strong>
                    <span className="text-sm text-ink-3">
                      {title} · {b.startDate} · {b.guestName}
                    </span>
                  </span>
                  <span className="font-bold">{formatInr(b.amountInr)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
