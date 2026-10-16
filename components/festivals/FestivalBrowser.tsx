'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FESTIVALS } from '@/content/festivals';
import { FestivalCard } from '@/components/cards';
import { MONTHS_SHORT, MONTHS } from '@/lib/format';
import { useNow } from '@/lib/use-now';
import { orderFestivals } from '@/lib/festival-filter';

const chip = (on: boolean) =>
  `h-11 min-w-14 rounded-full px-4 text-sm font-bold transition-colors ${on ? 'border-[1.5px] border-teal bg-teal-soft text-teal' : 'border border-line bg-card text-ink-2 hover:border-sage'}`;

export function FestivalBrowser() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const now = useNow();

  const raw = Number(params.get('month'));
  const month = Number.isInteger(raw) && raw >= 1 && raw <= 12 ? raw : null;
  // Default view: from the current month onward. Before hydration, start at January.
  const fromMonth = now === null ? 1 : new Date(now).getMonth() + 1;
  const list = orderFestivals(FESTIVALS, month, fromMonth);

  function pick(m: number | null) {
    router.replace(m ? `${pathname}?month=${m}` : pathname, { scroll: false });
  }

  return (
    <div className="flex flex-col gap-8">
      <div role="group" aria-label="Filter by month" className="flex flex-wrap gap-2">
        <button type="button" aria-pressed={month === null} onClick={() => pick(null)} className={chip(month === null)}>
          All
        </button>
        {MONTHS_SHORT.map((m, i) => (
          <button key={m} type="button" aria-pressed={month === i + 1} aria-label={MONTHS[i]} onClick={() => pick(i + 1)} className={chip(month === i + 1)}>
            {m}
          </button>
        ))}
      </div>
      <p role="status" className="text-sm font-bold text-ink-3">
        {month ? `${list.length} in ${MONTHS[month - 1]}` : `${list.length} festivals, from ${MONTHS[fromMonth - 1]} onward`}
      </p>
      {list.length ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {list.map((f) => (
            <FestivalCard key={f.slug} festival={f} headingLevel="h2" />
          ))}
        </div>
      ) : (
        <p className="rounded-[24px] border border-dashed border-line p-10 text-center font-bold">
          No festivals listed for {month ? MONTHS[month - 1] : 'this month'} yet.
        </p>
      )}
    </div>
  );
}
