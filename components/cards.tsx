import Link from 'next/link';
import { CalendarDays, MapPin, Car, Route } from 'lucide-react';
import type { Festival, StateGuide, TourPackage } from '@/types/content';
import { stateName } from '@/content/states';
import { formatDateRange, formatInr, formatNumber } from '@/lib/format';
import { Picture } from '@/components/ui/Picture';
import { Chip } from '@/components/ui/Section';

const CARD = 'group flex flex-col overflow-hidden rounded-[20px] border border-line-soft bg-card shadow-sm transition-shadow duration-300 hover:shadow-xl';
const MEDIA = 'relative overflow-hidden';
const ZOOM = 'group-hover:scale-105';

export function StateCard({ state, headingLevel = 'h3' }: { state: StateGuide; headingLevel?: 'h2' | 'h3' }) {
  const H = headingLevel;
  return (
    <Link href={`/states/${state.slug}`} className={CARD}>
      <div className={`${MEDIA} aspect-[4/3]`}>
        <Picture image={state.cover} sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw" className={ZOOM} />
        <span className="absolute left-3 top-3">
          <Chip tone="light">Best: {state.bestTime}</Chip>
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <span className="text-xs font-extrabold uppercase tracking-wider text-terracotta">{state.tagline}</span>
        <H className="text-xl font-extrabold tracking-tight">{state.name}</H>
        <p className="line-clamp-2 text-sm leading-relaxed text-ink-2">{state.description}</p>
        <div className="mt-auto flex items-center justify-between pt-3 text-sm">
          <span className="text-ink-3">Capital: {state.capital}</span>
          <span className="font-extrabold text-teal">Explore →</span>
        </div>
      </div>
    </Link>
  );
}

export function PackageCard({ pkg, headingLevel = 'h3' }: { pkg: TourPackage; headingLevel?: 'h2' | 'h3' }) {
  const H = headingLevel;
  return (
    <Link href={`/packages/${pkg.slug}`} className={CARD}>
      <div className={`${MEDIA} aspect-[16/10]`}>
        <Picture image={pkg.image} sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className={ZOOM} />
        <span className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <Chip tone="light">
            {pkg.days} Days / {pkg.nights} Nights
          </Chip>
          {pkg.states.map((s) => (
            <Chip key={s} tone="terracotta">
              {stateName(s)}
            </Chip>
          ))}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <H className="text-lg font-extrabold leading-snug tracking-tight">{pkg.title}</H>
        <p className="line-clamp-2 text-sm leading-relaxed text-ink-2">{pkg.summary}</p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-ink-3">
          <li className="flex items-center gap-1">
            <MapPin size={14} aria-hidden="true" /> From {pkg.startHub}
          </li>
          <li className="flex items-center gap-1">
            <Car size={14} aria-hidden="true" /> {pkg.vehicle}
          </li>
          <li className="flex items-center gap-1">
            <Route size={14} aria-hidden="true" /> {formatNumber(pkg.distanceKm)} km
          </li>
        </ul>
        <div className="mt-auto flex items-end justify-between border-t border-line-soft pt-3">
          <span className="text-sm text-ink-3">
            from <strong className="text-xl text-ink">{formatInr(pkg.fromPriceInr)}</strong> pp
          </span>
          <span className="text-sm font-extrabold text-teal">View trip →</span>
        </div>
      </div>
    </Link>
  );
}

export function FestivalCard({ festival, headingLevel = 'h3' }: { festival: Festival; headingLevel?: 'h2' | 'h3' }) {
  const H = headingLevel;
  return (
    <article className="flex flex-col overflow-hidden rounded-[20px] border border-line-soft bg-card shadow-sm">
      <div className={`${MEDIA} aspect-[16/9]`}>
        <Picture image={festival.image} sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" />
        <span className="absolute left-3 top-3">
          <Chip tone="terracotta">{stateName(festival.state)}</Chip>
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="flex items-center gap-1.5 text-sm font-bold text-teal">
          <CalendarDays size={15} aria-hidden="true" />
          {festival.startDate ? formatDateRange(festival.startDate, festival.endDate) : 'Dates TBC'}
          {festival.startDate && !festival.dateConfirmed && <span className="font-semibold text-amber">· Dates TBC</span>}
        </p>
        <H className="text-lg font-extrabold tracking-tight">{festival.name}</H>
        <p className="text-sm leading-relaxed text-ink-2">{festival.description}</p>
        <p className="text-[13px] text-ink-3">Community: {festival.community}</p>
        <Link href={`/permits?state=${festival.state}`} className="mt-auto pt-2 text-sm font-extrabold text-teal hover:underline">
          Permit info for {stateName(festival.state)} →
        </Link>
      </div>
    </article>
  );
}
