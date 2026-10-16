'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { PublicListing } from '@/lib/listings';
import { STATES } from '@/content/states';
import { filterListings, parseListingFilters } from '@/lib/listing-filters';
import { ListingCard } from './ListingCard';

const PRICES = [1500, 3000, 5000, 10000];
const select = 'h-12 rounded-xl border border-line bg-card px-3 font-semibold';
const label = 'text-xs font-extrabold uppercase tracking-[0.12em] text-ink-3';

export function ListingGrid({ items, headingLevel = 'h2' }: { items: PublicListing[]; headingLevel?: 'h2' | 'h3' }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((l) => (
        <ListingCard key={l.id} listing={l} headingLevel={headingLevel} />
      ))}
    </div>
  );
}

/** State / price / guests filters kept in the URL so filtered views are shareable. */
export function ListingBrowser({ items, unit }: { items: PublicListing[]; unit: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const f = parseListingFilters(params);
  const results = filterListings(items, f);

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 rounded-[24px] border border-line-soft bg-card p-5 sm:grid-cols-3">
        <label className="flex flex-col gap-1.5">
          <span className={label}>State</span>
          <select value={f.state ?? ''} onChange={(e) => update('state', e.target.value)} className={select}>
            <option value="">All states</option>
            {STATES.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={label}>Max price per {unit}</span>
          <select value={f.maxPrice ?? ''} onChange={(e) => update('maxPrice', e.target.value)} className={select}>
            <option value="">Any price</option>
            {PRICES.map((p) => (
              <option key={p} value={p}>
                Up to ₹{p.toLocaleString('en-IN')}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={label}>Guests</span>
          <select value={f.guests ?? ''} onChange={(e) => update('guests', e.target.value)} className={select}>
            <option value="">Any</option>
            {[1, 2, 3, 4, 6, 8].map((g) => (
              <option key={g} value={g}>
                {g}+ guests
              </option>
            ))}
          </select>
        </label>
      </div>
      <p role="status" className="text-sm font-bold text-ink-3">
        {results.length} {results.length === 1 ? 'listing' : 'listings'} found
      </p>
      {results.length ? (
        <ListingGrid items={results} />
      ) : (
        <p className="rounded-[24px] border border-dashed border-line p-10 text-center font-bold">No listings match those filters yet.</p>
      )}
    </div>
  );
}
