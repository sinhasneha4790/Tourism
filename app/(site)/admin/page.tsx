import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { count, desc, eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/dal';
import { requireDb } from '@/lib/db';
import { enquiries, hostProfiles, listings, users } from '@/lib/db/schema';
import { approveListing } from '@/app/marketplace-actions';
import { RejectForm } from '@/components/marketplace/RejectForm';
import { AdminBookings } from '@/components/booking/AdminBookings';
import { AdminReviews } from '@/components/marketplace/AdminReviews';
import { StatusChip } from '@/components/marketplace/StatusChip';
import { stateName } from '@/content/states';
import { formatInr } from '@/lib/format';
import type { StateSlug } from '@/types/content';

export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } };

async function AdminPanel() {
  await requireAdmin();
  const db = requireDb();
  const [queue, counts, recentEnquiries] = await Promise.all([
    db
      .select({ listing: listings, host: hostProfiles.displayName, hostEmail: users.email })
      .from(listings)
      .innerJoin(users, eq(users.id, listings.hostId))
      .leftJoin(hostProfiles, eq(hostProfiles.userId, listings.hostId))
      .where(eq(listings.status, 'pending'))
      .orderBy(listings.submittedAt),
    db.select({ status: listings.status, n: count() }).from(listings).groupBy(listings.status),
    db.select().from(enquiries).orderBy(desc(enquiries.createdAt)).limit(25),
  ]);
  const n = (s: string) => counts.find((c) => c.status === s)?.n ?? 0;

  return (
    <div className="flex flex-col gap-10">
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {(['pending', 'approved', 'rejected', 'draft'] as const).map((s) => (
          <div key={s} className="flex flex-col-reverse gap-1 rounded-[20px] border border-line-soft bg-card p-5">
            <dt>
              <StatusChip status={s} />
            </dt>
            <dd className="text-3xl font-extrabold">{n(s)}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="queue" className="flex flex-col gap-4">
        <h2 id="queue" className="text-2xl font-extrabold">
          Approval queue
        </h2>
        {queue.length === 0 ? (
          <p className="rounded-[20px] border border-dashed border-line p-8 text-center text-ink-2">Nothing waiting for review.</p>
        ) : (
          <ul className="grid gap-4">
            {queue.map(({ listing: l, host, hostEmail }) => (
              <li key={l.id} className="flex flex-col gap-3 rounded-[24px] border border-line-soft bg-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-terracotta">
                      {l.type === 'stay' ? 'Stay' : 'Experience'} · {stateName(l.state as StateSlug)}
                    </span>
                    <h3 className="text-xl font-extrabold">{l.title}</h3>
                    <p className="text-sm text-ink-3">
                      {l.location} · {formatInr(l.basePriceInr)} / {l.priceUnit} · up to {l.maxGuests} guests · {l.photos.length} photos
                    </p>
                    <p className="text-sm text-ink-3">
                      Host: {host ?? '—'} ({hostEmail})
                    </p>
                  </div>
                  <form action={approveListing}>
                    <input type="hidden" name="id" value={l.id} />
                    <button type="submit" className="h-11 rounded-full bg-forest px-6 font-extrabold text-white">
                      Approve “{l.title}”
                    </button>
                  </form>
                </div>
                <p className="whitespace-pre-line text-ink-2">{l.description}</p>
                {l.amenities.length > 0 && <p className="text-sm text-ink-3">Amenities: {l.amenities.join(', ')}</p>}
                <RejectForm id={l.id} title={l.title} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <AdminBookings />

      <AdminReviews />

      <section aria-labelledby="enq" className="flex flex-col gap-4">
        <h2 id="enq" className="text-2xl font-extrabold">
          Latest enquiries
        </h2>
        {recentEnquiries.length === 0 ? (
          <p className="text-ink-3">No enquiries stored yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-[20px] border border-line-soft bg-card">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-teal-soft">
                <tr>
                  {['Date', 'Kind', 'Name', 'Email', 'About', 'Emailed'].map((h) => (
                    <th key={h} scope="col" className="px-4 py-3 font-extrabold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentEnquiries.map((q) => (
                  <tr key={q.id} className="border-t border-line-soft">
                    <td className="px-4 py-3">{q.createdAt.toISOString().slice(0, 10)}</td>
                    <td className="px-4 py-3 capitalize">{q.kind}</td>
                    <td className="px-4 py-3">{q.name}</td>
                    <td className="px-4 py-3">
                      <a href={`mailto:${q.email}`} className="text-teal underline">
                        {q.email}
                      </a>
                    </td>
                    <td className="px-4 py-3">{typeof q.payload.ref === 'string' ? q.payload.ref : '—'}</td>
                    <td className="px-4 py-3">{q.emailed ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <Link href="/stays" className="font-extrabold text-teal underline">
        View public stays →
      </Link>
    </div>
  );
}

export default function AdminPage() {
  return (
    <div className="container-site flex flex-col gap-8 py-12 md:py-16">
      <h1 className="text-[clamp(34px,5vw,52px)] font-extrabold leading-none tracking-[-0.03em]">
        Mistrail <span className="accent">admin</span>
      </h1>
      <Suspense fallback={<div className="h-64 rounded-[28px] border border-line-soft bg-card" />}>
        <AdminPanel />
      </Suspense>
    </div>
  );
}
