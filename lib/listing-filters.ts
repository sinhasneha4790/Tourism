import { STATE_SLUGS } from '@/content/states';
import type { StateSlug } from '@/types/content';

export interface ListingFilters {
  state?: StateSlug;
  maxPrice?: number;
  guests?: number;
}

export function parseListingFilters(params: { get(key: string): string | null }): ListingFilters {
  const s = params.get('state');
  const price = Number(params.get('maxPrice'));
  const guests = Number(params.get('guests'));
  return {
    state: STATE_SLUGS.includes(s as StateSlug) ? (s as StateSlug) : undefined,
    maxPrice: Number.isFinite(price) && price > 0 ? price : undefined,
    guests: Number.isInteger(guests) && guests > 0 ? guests : undefined,
  };
}

export function filterListings<T extends { state: string; basePriceInr: number; maxGuests: number }>(items: T[], f: ListingFilters): T[] {
  return items.filter((l) => (!f.state || l.state === f.state) && (!f.maxPrice || l.basePriceInr <= f.maxPrice) && (!f.guests || l.maxGuests >= f.guests));
}
