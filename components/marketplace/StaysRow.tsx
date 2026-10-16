import Link from 'next/link';
import { getApprovedListings } from '@/lib/listings';
import { ListingGrid } from './ListingBrowser';

/** Up to four approved homestays, optionally for one state. Renders nothing when there are none. */
export async function StaysRow({ state, title, emptyHint = false }: { state?: string; title: React.ReactNode; emptyHint?: boolean }) {
  const all = await getApprovedListings('stay');
  const items = (state ? all.filter((l) => l.state === state) : all).slice(0, 4);
  if (!items.length) {
    if (!emptyHint) return null;
    return (
      <section aria-label="Stays" className="rounded-[24px] border border-dashed border-line p-7 text-ink-2">
        <h2 className="text-xl font-extrabold text-ink">{title}</h2>
        <p className="mt-1">
          No homestays listed here yet.{' '}
          <Link href="/host" className="font-bold text-teal underline">
            Are you a host here?
          </Link>
        </p>
      </section>
    );
  }
  return (
    <section aria-label="Homestays" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-[clamp(28px,4vw,40px)] font-extrabold tracking-tight">{title}</h2>
        <Link href={state ? `/stays?state=${state}` : '/stays'} className="font-extrabold text-teal underline-offset-4 hover:underline">
          All homestays →
        </Link>
      </div>
      <ListingGrid items={items} headingLevel="h3" />
    </section>
  );
}
