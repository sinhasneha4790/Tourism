import type { Interest, StateSlug, TourPackage } from '@/types/content';
import { durationBand, type DurationBand } from '@/content/packages';
import { STATE_SLUGS } from '@/content/states';

export interface PackageFilters {
  duration: DurationBand | 'all';
  state?: StateSlug;
  interest?: Interest;
}

const INTERESTS: Interest[] = ['wildlife', 'culture', 'spiritual', 'trekking', 'tea'];
const BANDS: DurationBand[] = ['short', 'medium', 'long'];

/** Reads filters from a query string, ignoring unknown values. */
export function parsePackageFilters(params: { get(key: string): string | null }): PackageFilters {
  const d = params.get('duration');
  const s = params.get('state');
  const i = params.get('interest');
  return {
    duration: BANDS.includes(d as DurationBand) ? (d as DurationBand) : 'all',
    state: STATE_SLUGS.includes(s as StateSlug) ? (s as StateSlug) : undefined,
    interest: INTERESTS.includes(i as Interest) ? (i as Interest) : undefined,
  };
}

export function filterPackages(packages: TourPackage[], f: PackageFilters): TourPackage[] {
  return packages.filter(
    (p) =>
      (f.duration === 'all' || durationBand(p.days) === f.duration) &&
      (!f.state || p.states.includes(f.state)) &&
      (!f.interest || p.interests.includes(f.interest)),
  );
}
