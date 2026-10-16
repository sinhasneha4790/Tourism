import { describe, expect, it } from 'vitest';
import { calculateBudget, defaultRooms, isPeakMonth } from '@/lib/budget';

const base = { days: 6, travellers: 2, stay: 'homestay', ride: 'suv', safari: true, permits: true } as const;

describe('calculateBudget', () => {
  it('prices the default plan (6 days, 2 adults, homestay, SUV, safari + permits)', () => {
    const b = calculateBudget(base);
    // stays: 5 nights × ₹2,200 × 1 room; SUV: 6 × ₹3,500; food: 6 × 2 × ₹800; extras: 2 × (₹2,200 + ₹300)
    expect(b.nights).toBe(5);
    expect(b.rooms).toBe(1);
    expect(b.lines.map((l) => l.amount)).toEqual([11000, 21000, 9600, 5000]);
    expect(b.total).toBe(46600);
    expect(b.perPerson).toBe(23300);
  });

  it('per-person total follows the travellers count', () => {
    const b = calculateBudget({ ...base, travellers: 4 });
    expect(b.rooms).toBe(2);
    expect(b.perPerson).toBe(Math.round(b.total / 4));
  });

  it('derives rooms as ceil(travellers / 2) but lets the user override', () => {
    expect(defaultRooms(1)).toBe(1);
    expect(defaultRooms(3)).toBe(2);
    expect(calculateBudget({ ...base, travellers: 3 }).rooms).toBe(2);
    expect(calculateBudget({ ...base, travellers: 3, rooms: 3 }).rooms).toBe(3);
    // never more rooms than people
    expect(calculateBudget({ ...base, travellers: 2, rooms: 5 }).rooms).toBe(2);
  });

  it('charges shared transport per person and private transport per vehicle', () => {
    const shared = calculateBudget({ ...base, ride: 'shared', travellers: 3 });
    expect(shared.lines.find((l) => l.id === 'transport')?.amount).toBe(6 * 900 * 3);
    const suv = calculateBudget({ ...base, travellers: 3 });
    expect(suv.lines.find((l) => l.id === 'transport')?.amount).toBe(6 * 3500);
  });

  it('applies the peak multiplier to stays and transport only', () => {
    const off = calculateBudget({ ...base, startMonth: 2 });
    const peak = calculateBudget({ ...base, startMonth: 12 });
    expect(peak.peak).toBe(true);
    expect(peak.lines[0].amount).toBe(Math.round(off.lines[0].amount * 1.15));
    expect(peak.lines[1].amount).toBe(Math.round(off.lines[1].amount * 1.15));
    expect(peak.lines[2].amount).toBe(off.lines[2].amount);
    expect(peak.lines[3].amount).toBe(off.lines[3].amount);
  });

  it('peak months are October, November and December', () => {
    expect([1, 6, 9].map(isPeakMonth)).toEqual([false, false, false]);
    expect([10, 11, 12].map(isPeakMonth)).toEqual([true, true, true]);
    expect(isPeakMonth(undefined)).toBe(false);
  });

  it('clamps days and travellers to the planner limits', () => {
    expect(calculateBudget({ ...base, days: 1 }).days).toBe(3);
    expect(calculateBudget({ ...base, days: 40 }).days).toBe(15);
    expect(calculateBudget({ ...base, travellers: 0 }).travellers).toBe(1);
    expect(calculateBudget({ ...base, travellers: 99 }).travellers).toBe(10);
  });

  it('drops add-ons when toggled off', () => {
    const b = calculateBudget({ ...base, safari: false, permits: false });
    expect(b.lines.find((l) => l.id === 'extras')?.amount).toBe(0);
  });
});
