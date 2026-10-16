import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { Plus } from 'lucide-react';
import { requireHost } from '@/lib/dal';
import { requireDb } from '@/lib/db';
import { bookings, enquiries, listings } from '@/lib/db/schema';
import { BookingList } from '@/components/booking/BookingList';
import { HostReviews } from '@/components/marketplace/HostReviews';
import { stateName } from '@/content/states';
import { formatInr } from '@/lib/format';
import { StatusChip } from '@/components/marketplace/StatusChip';
import type { StateSlug } from '@/types/content';

export const metadata: Metadata = { title: 'Host dashboard', robots: { index: false, follow: false } };

async function Dashboard() {
  const user = await requireHost('/host/dashboard');
  const db = requireDb();
  const mine = await db.select().from(listings).where(eq(listings.hostId, user.id)).orderBy(desc(listings.updatedAt));
  const ids = mine.map((l) => l.id);
  const recent = ids.length ? await db.select().from(enquiries).where(inArray(enquiries.listingId, ids)).orderBy(desc(enquiries.createdAt)).limit(20) : [];
  const titleOf = new Map(mine.map((l) => [l.id, l.title]));
  const hostBookings = await db
    .select({
      ref: bookings.ref,
      status: bookings.status,
      startDate: bookings.startDate,
      endDate: bookings.endDate,
      guests: bookings.guests,
      amountInr: bookings.amountInr,
      hostPayoutInr: bookings.hostPayoutInr,
      guestName: bookings.guestName,
      title: listings.title,
      payoutId: bookings.payoutId,
    })
    .from(bookings)
    .leftJoin(listings, eq(listings.id, bookings.listingId))
    .where(and(eq(bookings.hostId, user.id), inArray(bookings.status, ['confirmed', 'cancelled', 'refunded'])))
    .orderBy(desc(bookings.startDate))
    .limit(50);
  const confirmed = hostBookings.filter((b) => b.status === 'confirmed');
  const owed = confirmed.filter((b) => !b.payoutId).reduce((n, b) => n + b.hostPayoutInr, 0);
  const paidOut = confirmed.filter((b) => b.payoutId).reduce((n, b) => n + b.hostPayoutInr, 0);

  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="my-listings" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="my-listings" className="text-2xl font-extrabold">
            Your listings
          </h2>
          <Link href="/host/listings/new" className="flex h-11 items-center gap-2 rounded-full bg-teal px-5 font-extrabold text-white">
            <Plus size={18} aria-hidden="true" /> New listing
          </Link>
        </div>
        {mine.length === 0 ? (
          <p className="rounded-[20px] border border-dashed border-line p-8 text-center text-ink-2">
            No listings yet. Create your first one — it stays a private draft until you submit it.
          </p>
        ) : (
          <ul className="grid gap-3">
            {mine.map((l) => (
              <li key={l.id}>
                <Link
                  href={`/host/listings/${l.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-line-soft bg-card p-5 hover:border-sage"
                >
                  <span className="flex flex-col gap-1">
                    <StatusChip status={l.status} />
                    <strong className="text-lg">{l.title}</strong>
                    <span className="text-sm text-ink-3">
                      {l.type === 'stay' ? 'Stay' : 'Experience'} · {l.location}, {stateName(l.state as StateSlug)} · {formatInr(l.basePriceInr)} /{' '}
                      {l.priceUnit}
                    </span>
                  </span>
                  <span className="flex flex-col items-end gap-1">
                    <span className="font-extrabold text-teal">Edit →</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="host-bookings" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="host-bookings" className="text-2xl font-extrabold">
            Bookings
          </h2>
          <p className="text-sm text-ink-3">
            Payouts owed: <strong className="text-ink">{formatInr(owed)}</strong> · paid out so far: <strong className="text-ink">{formatInr(paidOut)}</strong>
          </p>
        </div>
        <BookingList rows={hostBookings} view="host" empty="Paid bookings for your listings will appear here." />
      </section>

      <HostReviews listingTitles={titleOf} />

      <section aria-labelledby="enquiries" className="flex flex-col gap-4">
        <h2 id="enquiries" className="text-2xl font-extrabold">
          Recent enquiries
        </h2>
        {recent.length === 0 ? (
          <p className="text-ink-3">Enquiries from guests about your live listings will appear here.</p>
        ) : (
          <ul className="grid gap-3">
            {recent.map((q) => (
              <li key={q.id} className="rounded-[20px] border border-line-soft bg-card p-5">
                <p className="text-sm text-ink-3">
                  {titleOf.get(q.listingId ?? '')} · {q.createdAt.toISOString().slice(0, 10)}
                </p>
                <p className="font-bold">
                  {q.name} ·{' '}
                  <a href={`mailto:${q.email}`} className="text-teal underline">
                    {q.email}
                  </a>
                  {q.phone && ` · ${q.phone}`}
                </p>
                {typeof q.payload.message === 'string' && q.payload.message && <p className="mt-1 text-ink-2">{q.payload.message}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function HostDashboardPage() {
  return (
    <div className="container-site flex flex-col gap-8 py-12 md:py-16">
      <h1 className="text-[clamp(34px,5vw,52px)] font-extrabold leading-none tracking-[-0.03em]">
        Host <span className="accent">dashboard</span>
      </h1>
      <Suspense fallback={<div className="h-64 rounded-[28px] border border-line-soft bg-card" />}>
        <Dashboard />
      </Suspense>
    </div>
  );
}
