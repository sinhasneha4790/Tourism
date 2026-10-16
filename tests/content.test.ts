import { describe, expect, it } from 'vitest';
import { FESTIVALS } from '@/content/festivals';
import { PACKAGES } from '@/content/packages';
import { PERMITS, headlinePermit, permitsFor } from '@/content/permits';
import { STATE_SLUGS } from '@/content/states';
import { countdown, nextFestival, nextOccurrence } from '@/lib/dates';
import { filterPackages, parsePackageFilters } from '@/lib/package-filters';
import { orderFestivals } from '@/lib/festival-filter';
import { search } from '@/lib/search-index';
import { heroFilterHref } from '@/components/home/HeroFilter';
import type { Nationality } from '@/types/content';

const at = (iso: string) => new Date(`${iso}T12:00:00+05:30`).getTime();

describe('permit checker data', () => {
  it('has a headline record for every state × nationality', () => {
    for (const s of STATE_SLUGS) {
      for (const n of ['indian', 'foreign', 'oci'] as Nationality[]) {
        expect(headlinePermit(s, n), `${s}/${n}`).toBeDefined();
      }
    }
  });

  it('points each required permit at that state’s own portal', () => {
    for (const p of PERMITS.filter((r) => r.required)) {
      expect(p.applyUrl, `${p.state}/${p.nationality}`).toBeDefined();
      if (p.state !== 'arunachal-pradesh') expect(p.applyUrl, `${p.state} links to Arunachal`).not.toContain('arunachal');
    }
    expect(permitsFor('nagaland', 'indian')[0].applyUrl).toContain('nagaland');
  });

  it('models Sikkim protected areas as sub-areas for Indian citizens', () => {
    const sikkim = permitsFor('sikkim', 'indian');
    expect(sikkim.find((p) => !p.area)?.required).toBe(false);
    expect(sikkim.filter((p) => p.area).length).toBeGreaterThanOrEqual(2);
  });

  it('keeps every record flagged unverified until the owner checks it', () => {
    expect(PERMITS.every((p) => p.verified === false)).toBe(true);
  });
});

describe('festival spotlight', () => {
  it('picks the soonest upcoming festival', () => {
    expect(nextFestival(FESTIVALS, at('2026-10-16'))?.festival.slug).toBe('wangala');
  });

  it('keeps a festival in focus while it is on', () => {
    expect(nextFestival(FESTIVALS, at('2026-12-05'))?.festival.slug).toBe('hornbill-festival');
  });

  it('rolls a recurring festival to next year once it ends', () => {
    const hornbill = FESTIVALS.find((f) => f.slug === 'hornbill-festival')!;
    expect(nextOccurrence(hornbill, at('2026-12-11'))?.start).toBe('2027-12-01');
  });

  it('counts down to the start date', () => {
    const cd = countdown('2026-12-01', '2026-12-10', new Date('2026-11-30T00:00:00+05:30').getTime());
    expect(cd).toMatchObject({ days: 1, hours: 0, minutes: 0, seconds: 0, live: false });
    expect(countdown('2026-12-01', '2026-12-10', at('2026-12-03')).live).toBe(true);
  });
});

describe('filters', () => {
  it('filters packages by duration band, state and interest', () => {
    const q = (s: string) => filterPackages(PACKAGES, parsePackageFilters(new URLSearchParams(s)));
    expect(q('').length).toBe(PACKAGES.length);
    expect(q('duration=short').every((p) => p.days <= 5)).toBe(true);
    expect(q('duration=long').every((p) => p.days >= 9)).toBe(true);
    expect(q('state=sikkim').every((p) => p.states.includes('sikkim'))).toBe(true);
    expect(q('interest=wildlife').every((p) => p.interests.includes('wildlife'))).toBe(true);
    expect(q('interest=bogus').length).toBe(PACKAGES.length);
  });

  it('orders festivals from the current month and filters by month', () => {
    expect(orderFestivals(FESTIVALS, null, 10)[0].month).toBeGreaterThanOrEqual(10);
    expect(orderFestivals(FESTIVALS, 4, 1).every((f) => f.month === 4)).toBe(true);
  });

  it('routes the hero filter as specified', () => {
    expect(heroFilterHref('assam', '')).toBe('/states/assam');
    expect(heroFilterHref('', 'tea')).toBe('/packages?interest=tea');
    expect(heroFilterHref('assam', 'tea')).toBe('/packages?state=assam&interest=tea');
  });
});

describe('search', () => {
  it('finds states, attractions, packages and festivals', () => {
    expect(search('tawang').map((r) => r.kind)).toEqual(expect.arrayContaining(['Attraction', 'Package']));
    expect(search('hornbill').some((r) => r.kind === 'Festival')).toBe(true);
    expect(search('meghalaya').some((r) => r.kind === 'State')).toBe(true);
  });

  it('returns plain data for hostile input (rendered as text, never HTML)', () => {
    expect(search('<img src=x onerror=alert(1)>')).toEqual([]);
  });
});
