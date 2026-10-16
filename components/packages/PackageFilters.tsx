'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PACKAGES, DURATION_LABELS, type DurationBand } from '@/content/packages';
import { STATES } from '@/content/states';
import { INTERESTS } from '@/content/interests';
import { PackageCard } from '@/components/cards';
import { filterPackages, parsePackageFilters } from '@/lib/package-filters';

const BANDS: (DurationBand | 'all')[] = ['all', 'short', 'medium', 'long'];

const chip = (on: boolean) =>
  `h-11 rounded-full px-4 text-sm font-bold transition-colors ${on ? 'border-[1.5px] border-teal bg-teal-soft text-teal' : 'border border-line bg-card text-ink-2 hover:border-sage'}`;

export function PackageFilters() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const filters = parsePackageFilters(params);
  const results = filterPackages(PACKAGES, filters);

  function update(key: 'duration' | 'state' | 'interest', value: string) {
    const next = new URLSearchParams(params.toString());
    if (!value || value === 'all') next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5 rounded-[24px] border border-line-soft bg-card p-5 md:p-6">
        <fieldset className="flex flex-col gap-2.5">
          <legend className="mb-2.5 text-xs font-extrabold uppercase tracking-[0.12em] text-ink-3">Trip length</legend>
          <div className="flex flex-wrap gap-2">
            {BANDS.map((b) => (
              <button
                key={b}
                type="button"
                aria-pressed={filters.duration === b}
                onClick={() => update('duration', b)}
                className={chip(filters.duration === b)}
              >
                {b === 'all' ? 'All' : DURATION_LABELS[b]}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink-3">State</span>
            <select
              value={filters.state ?? ''}
              onChange={(e) => update('state', e.target.value)}
              className="h-12 rounded-xl border border-line bg-card px-3 font-semibold"
            >
              <option value="">All states</option>
              {STATES.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink-3">Interest</span>
            <select
              value={filters.interest ?? ''}
              onChange={(e) => update('interest', e.target.value)}
              className="h-12 rounded-xl border border-line bg-card px-3 font-semibold"
            >
              <option value="">Any interest</option>
              {INTERESTS.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <p role="status" className="text-sm font-bold text-ink-3">
        {results.length} {results.length === 1 ? 'trip' : 'trips'} found
      </p>

      {results.length ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {results.map((p) => (
            <PackageCard key={p.slug} pkg={p} headingLevel="h2" />
          ))}
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-line p-10 text-center">
          <p className="text-lg font-bold">No packages match those filters yet.</p>
          <button type="button" onClick={() => router.replace(pathname, { scroll: false })} className="mt-3 font-extrabold text-teal underline">
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

/** Static fallback rendered into the prerendered HTML before search params are known. */
export function PackageListFallback() {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {PACKAGES.map((p) => (
        <PackageCard key={p.slug} pkg={p} headingLevel="h2" />
      ))}
    </div>
  );
}
