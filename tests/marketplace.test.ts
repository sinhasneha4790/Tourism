import { describe, expect, it } from 'vitest';
import { canEditListing, canSubmitForReview, effectiveRole, isAdminEmail, statusAfterHostEdit } from '@/lib/permissions';
import { filterListings, parseListingFilters } from '@/lib/listing-filters';
import { listingSchema, slugify } from '@/lib/validators';
import { safeNext } from '@/lib/safe-next';

describe('roles and permissions', () => {
  it('treats ADMIN_EMAILS as admins, case-insensitively', () => {
    expect(isAdminEmail('Owner@Mistrail.in', 'owner@mistrail.in, ops@mistrail.in')).toBe(true);
    expect(isAdminEmail('host@x.in', 'owner@mistrail.in')).toBe(false);
    expect(isAdminEmail('a@b.in', undefined)).toBe(false);
    expect(effectiveRole('traveller', 'ops@mistrail.in', 'owner@mistrail.in,ops@mistrail.in')).toBe('admin');
    expect(effectiveRole('host', 'h@x.in', '')).toBe('host');
  });

  it('only lets hosts edit their own listings (admins can edit any)', () => {
    expect(canEditListing({ id: 'u1', isAdmin: false }, { hostId: 'u1' })).toBe(true);
    expect(canEditListing({ id: 'u2', isAdmin: false }, { hostId: 'u1' })).toBe(false);
    expect(canEditListing({ id: 'admin', isAdmin: true }, { hostId: 'u1' })).toBe(true);
  });

  it('sends edited live listings back for review', () => {
    expect(statusAfterHostEdit('approved')).toBe('pending');
    expect(statusAfterHostEdit('pending')).toBe('pending');
    expect(statusAfterHostEdit('draft')).toBe('draft');
    expect(statusAfterHostEdit('rejected')).toBe('draft');
    expect(['draft', 'rejected'].every((s) => canSubmitForReview(s as 'draft'))).toBe(true);
    expect(canSubmitForReview('approved')).toBe(false);
  });
});

describe('listing input', () => {
  const valid = {
    type: 'stay',
    title: 'Riverside homestay',
    state: 'meghalaya',
    location: 'Nongriat',
    description: 'A quiet wooden house above the river, two minutes from the root bridge trail.',
    amenities: 'Hot water,  Meals ,\nWi-Fi',
    basePriceInr: '2500',
    priceUnit: 'night',
    maxGuests: '4',
    cancellationPolicy: 'moderate',
    lat: '',
    lng: '91.8',
  };

  it('parses form strings and cleans amenities', () => {
    const r = listingSchema.parse(valid);
    expect(r.basePriceInr).toBe(2500);
    expect(r.amenities).toEqual(['Hot water', 'Meals', 'Wi-Fi']);
    expect(r.lat).toBeNull();
    expect(r.lng).toBe(91.8);
  });

  it('rejects short descriptions, bad states and out-of-region coordinates', () => {
    expect(listingSchema.safeParse({ ...valid, description: 'too short' }).success).toBe(false);
    expect(listingSchema.safeParse({ ...valid, state: 'goa' }).success).toBe(false);
    expect(listingSchema.safeParse({ ...valid, lng: '72.8' }).success).toBe(false);
  });

  it('slugifies titles', () => {
    expect(slugify('Riverside Homestay — Ziro (Apatani)')).toBe('riverside-homestay-ziro-apatani');
    expect(slugify('!!!')).toBe('listing');
  });
});

describe('listing filters', () => {
  const items = [
    { state: 'sikkim', basePriceInr: 2000, maxGuests: 2 },
    { state: 'sikkim', basePriceInr: 6000, maxGuests: 6 },
    { state: 'assam', basePriceInr: 1200, maxGuests: 4 },
  ];
  it('filters by state, max price and guests from the query string', () => {
    const q = (s: string) => filterListings(items, parseListingFilters(new URLSearchParams(s)));
    expect(q('').length).toBe(3);
    expect(q('state=sikkim').length).toBe(2);
    expect(q('maxPrice=3000').length).toBe(2);
    expect(q('guests=4').length).toBe(2);
    expect(q('state=sikkim&guests=4&maxPrice=3000').length).toBe(0);
    expect(q('state=goa').length).toBe(3);
  });
});

describe('sign-in redirects', () => {
  it('only allows same-site paths', () => {
    expect(safeNext('/host/dashboard')).toBe('/host/dashboard');
    expect(safeNext('https://evil.example')).toBe('/account');
    expect(safeNext('//evil.example')).toBe('/account');
    expect(safeNext('/\\evil.example')).toBe('/account');
    expect(safeNext(null)).toBe('/account');
  });
});

describe('reviews', async () => {
  const { averageRating, canReview, publicName } = await import('@/lib/review-rules');

  it('opens reviews after a confirmed stay ends, for 60 days', () => {
    expect(canReview({ status: 'confirmed', endDate: '2026-11-05' }, '2026-11-04')).toBe(false);
    expect(canReview({ status: 'confirmed', endDate: '2026-11-05' }, '2026-11-05')).toBe(true);
    expect(canReview({ status: 'confirmed', endDate: '2026-11-05' }, '2027-01-04')).toBe(true);
    expect(canReview({ status: 'confirmed', endDate: '2026-11-05' }, '2027-01-05')).toBe(false);
    expect(canReview({ status: 'cancelled', endDate: '2026-11-05' }, '2026-11-10')).toBe(false);
  });

  it('averages ratings and shortens author names', () => {
    expect(averageRating([5, 4, 4])).toBe(4.3);
    expect(averageRating([])).toBeNull();
    expect(publicName('Asha  Devi Traveller')).toBe('Asha T.');
    expect(publicName('Asha')).toBe('Asha');
  });
});
