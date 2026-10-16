import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { and, eq, gt, gte, lt, or, sql } from 'drizzle-orm';
import { requireHost } from '@/lib/dal';
import { requireDb } from '@/lib/db';
import { availability, bookings, listings } from '@/lib/db/schema';
import { canEditListing } from '@/lib/permissions';
import { addDays, eachNight, todayIst } from '@/lib/pricing';
import { setDate } from '@/app/booking-actions';
import { formatInr, MONTHS } from '@/lib/format';
import { inputCls } from '@/components/forms/fields';

export const metadata: Metadata = { title: 'Calendar & prices', robots: { index: false, follow: false } };

const DAYS = 90;
const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

async function Calendar({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireHost(`/host/listings/${id}/calendar`);
  const db = requireDb();
  const [listing] = await db.select().from(listings).where(eq(listings.id, id));
  if (!listing || !canEditListing(user, listing)) notFound();

  const from = todayIst();
  const to = addDays(from, DAYS);
  const [rows, held] = await Promise.all([
    db
      .select()
      .from(availability)
      .where(and(eq(availability.listingId, id), gte(availability.date, from), lt(availability.date, to))),
    db
      .select({ start: bookings.startDate, end: bookings.endDate, guests: bookings.guests })
      .from(bookings)
      .where(
        and(
          eq(bookings.listingId, id),
          or(eq(bookings.status, 'confirmed'), and(eq(bookings.status, 'pending_payment'), gt(bookings.expiresAt, sql`now()`))),
          lt(bookings.startDate, to),
          gt(bookings.endDate, from),
        ),
      ),
  ]);
  const byDate = new Map(rows.map((r) => [r.date, r]));
  const booked = new Map<string, number>();
  for (const h of held)
    for (const d of eachNight(h.start, Math.max(1, Math.round((Date.parse(h.end) - Date.parse(h.start)) / 86_400_000))))
      booked.set(d, (booked.get(d) ?? 0) + h.guests);

  const days = eachNight(from, DAYS);
  const lead = (new Date(`${from}T00:00:00Z`).getUTCDay() + 6) % 7; // Monday-first grid
  const months = new Map<string, string[]>();
  for (const d of days) {
    const key = d.slice(0, 7);
    months.set(key, [...(months.get(key) ?? []), d]);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-[clamp(30px,4.5vw,46px)] font-extrabold leading-tight tracking-[-0.03em]">
          Calendar <span className="accent">&amp; prices</span>
        </h1>
        <p className="text-ink-2">
          {listing.title} · base price {formatInr(listing.basePriceInr)} / {listing.priceUnit}. Tap a date to close or reopen it.
        </p>
      </div>

      <form action={setDate} className="grid gap-3 rounded-[24px] border border-line-soft bg-card p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <input type="hidden" name="listingId" value={listing.id} />
        <input type="hidden" name="available" value="true" />
        <label className="flex flex-col gap-1.5 text-sm font-bold text-ink-2">
          Date
          <input type="date" name="date" min={from} max={to} required className={inputCls} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-bold text-ink-2">
          Special price (₹, blank = base price)
          <input type="number" name="price" min={100} className={inputCls} />
        </label>
        <button type="submit" className="h-12 rounded-full bg-teal px-6 font-extrabold text-white">
          Set price
        </button>
      </form>

      <div className="flex flex-wrap gap-4 text-sm font-bold text-ink-2">
        <span className="flex items-center gap-1.5">
          <span className="h-4 w-4 rounded border border-line bg-card" aria-hidden="true" /> Open
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-4 w-4 rounded bg-line" aria-hidden="true" /> Closed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-4 w-4 rounded bg-forest" aria-hidden="true" /> Booked
        </span>
      </div>

      {[...months.entries()].map(([key, list], mi) => (
        <section key={key} aria-label={`${MONTHS[Number(key.slice(5)) - 1]} ${key.slice(0, 4)}`} className="flex flex-col gap-2">
          <h2 className="text-xl font-extrabold">
            {MONTHS[Number(key.slice(5)) - 1]} {key.slice(0, 4)}
          </h2>
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-bold text-ink-3">
            {WEEK.map((w) => (
              <span key={w}>{w}</span>
            ))}
            {Array.from({ length: mi === 0 ? lead : (new Date(`${list[0]}T00:00:00Z`).getUTCDay() + 6) % 7 }, (_, i) => (
              <span key={`pad-${i}`} />
            ))}
            {list.map((d) => {
              const r = byDate.get(d);
              const closed = r?.available === false;
              const guests = booked.get(d);
              const isBooked = guests !== undefined && (listing.type === 'stay' || guests >= listing.maxGuests);
              const day = Number(d.slice(8));
              if (isBooked) {
                return (
                  <span key={d} className="flex aspect-square flex-col items-center justify-center rounded-xl bg-forest text-white" title={`${d}: booked`}>
                    <span className="text-sm font-extrabold">{day}</span>
                    <span className="text-xs">{listing.type === 'stay' ? 'Booked' : `${guests} booked`}</span>
                  </span>
                );
              }
              return (
                <form key={d} action={setDate}>
                  <input type="hidden" name="listingId" value={listing.id} />
                  <input type="hidden" name="date" value={d} />
                  <input type="hidden" name="available" value={closed ? 'true' : 'false'} />
                  {r?.priceOverrideInr && <input type="hidden" name="price" value={r.priceOverrideInr} />}
                  <button
                    type="submit"
                    aria-label={`${d}: ${closed ? 'closed — reopen' : 'open — close this date'}${r?.priceOverrideInr ? `, special price ${formatInr(r.priceOverrideInr)}` : ''}`}
                    className={`flex aspect-square w-full flex-col items-center justify-center rounded-xl border text-ink ${closed ? 'border-line bg-line text-ink-3 line-through' : 'border-line bg-card hover:border-teal'}`}
                  >
                    <span className="text-sm font-extrabold">{day}</span>
                    {r?.priceOverrideInr && <span className="text-xs text-teal">{formatInr(r.priceOverrideInr)}</span>}
                  </button>
                </form>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

export default function CalendarPage({ params }: PageProps<'/host/listings/[id]/calendar'>) {
  return (
    <div className="container-site flex max-w-4xl flex-col gap-6 py-12 md:py-16">
      <Link href="/host/dashboard" className="text-sm font-bold text-teal">
        ← Host dashboard
      </Link>
      <Suspense fallback={<div className="h-96 rounded-[28px] border border-line-soft bg-card" />}>
        <Calendar params={params} />
      </Suspense>
    </div>
  );
}
