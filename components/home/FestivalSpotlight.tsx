'use client';

import Link from 'next/link';
import { FESTIVALS } from '@/content/festivals';
import { stateName } from '@/content/states';
import { countdown, nextFestival, type Occurrence } from '@/lib/dates';
import { formatDateRange } from '@/lib/format';
import { useNow } from '@/lib/use-now';
import { Scene } from '@/components/ui/Scene';

/**
 * Next upcoming festival with a live countdown. `initial` is computed at build
 * time so the server HTML is stable; the client recomputes from the real clock
 * after hydration and rolls to the following festival once one ends.
 */
export function FestivalSpotlight({ initial }: { initial: Occurrence | null }) {
  const now = useNow();
  const occ = now === null ? initial : nextFestival(FESTIVALS, now);
  if (!occ) return null;

  const f = occ.festival;
  const cd = now === null ? null : countdown(occ.start, occ.end, now);
  const units: [string, number | undefined][] = [
    ['Days', cd?.days],
    ['Hours', cd?.hours],
    ['Minutes', cd?.minutes],
    ['Seconds', cd?.seconds],
  ];

  return (
    <section aria-labelledby="spotlight-title" className="relative overflow-hidden rounded-[28px] bg-night text-white">
      <div className="absolute inset-0 opacity-35">
        <Scene image={f.image} label={false} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-night via-night/90 to-night/40" />
      <div className="relative grid gap-8 p-7 md:p-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div className="flex flex-col gap-4">
          <span className="eyebrow text-peach">Festival spotlight · {stateName(f.state)}</span>
          <h2 id="spotlight-title" className="text-[clamp(32px,5vw,52px)] font-extrabold leading-none tracking-[-0.03em]">
            {f.name}
          </h2>
          <p className="max-w-xl text-[17px] leading-relaxed text-night-soft">{f.description}</p>
          <p className="font-bold text-peach-soft">
            {formatDateRange(occ.start, occ.end)}
            {!f.dateConfirmed && ' · dates to be confirmed'}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={`/festivals?month=${f.month}`} className="flex h-12 items-center rounded-full bg-peach px-6 font-extrabold text-night">
              See the festival calendar
            </Link>
            <Link
              href={`/permits?state=${f.state}`}
              className="flex h-12 items-center rounded-full border border-night-line-2 px-6 font-bold text-white hover:bg-night-2"
            >
              Permits for {stateName(f.state)}
            </Link>
          </div>
        </div>
        <div aria-live="off">
          {cd?.live ? (
            <p className="rounded-3xl bg-white/10 p-6 text-2xl font-extrabold">Happening now 🎉</p>
          ) : (
            <dl className="grid grid-cols-4 gap-2 sm:gap-3">
              {units.map(([label, value]) => (
                <div key={label} className="flex flex-col-reverse items-center rounded-2xl bg-white/10 px-2 py-4 backdrop-blur">
                  <dt className="mt-2 text-xs font-bold uppercase tracking-wider text-night-muted">{label}</dt>
                  <dd className="text-[clamp(28px,5vw,44px)] font-extrabold tabular-nums leading-none">
                    {value === undefined ? '––' : String(value).padStart(2, '0')}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </section>
  );
}
