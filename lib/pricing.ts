import { MAX_NIGHTS, REFUND_RULES, type CancellationPolicy } from '@/content/policies';

/** All dates are calendar dates in yyyy-mm-dd, treated as UTC days (no time-zone drift). */
const DAY = 86_400_000;
const ISO = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(v: string): boolean {
  return ISO.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`)) && new Date(`${v}T00:00:00Z`).toISOString().startsWith(v);
}

export function addDays(iso: string, n: number): string {
  return new Date(Date.parse(`${iso}T00:00:00Z`) + n * DAY).toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY);
}

/** The nights of a stay: start date up to (not including) the end date. */
export function eachNight(start: string, nights: number): string[] {
  return Array.from({ length: nights }, (_, i) => addDays(start, i));
}

/** Today's date in India, as yyyy-mm-dd. */
export function todayIst(now = Date.now()): string {
  return new Date(now + 5.5 * 3_600_000).toISOString().slice(0, 10);
}

export interface PricingSettings {
  commissionPct: { stay: number; experience: number };
  serviceFeePct: number;
  taxPct: number;
}

export interface QuoteInput {
  type: 'stay' | 'experience';
  priceUnit: 'night' | 'person' | 'group';
  basePriceInr: number;
  maxGuests: number;
  start: string;
  /** Check-out date for stays; ignored for experiences (single day). */
  end?: string;
  guests: number;
  /** yyyy-mm-dd → nightly/daily price override. */
  overrides?: Record<string, number>;
}

export interface Quote {
  start: string;
  end: string;
  nights: number;
  guests: number;
  lines: { label: string; amount: number }[];
  subtotal: number;
  serviceFee: number;
  tax: number;
  total: number;
  commissionPct: number;
  commission: number;
  hostPayout: number;
}

export type QuoteResult = { ok: true; quote: Quote } | { ok: false; error: string };

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

/** Prices a stay or experience. Pure: availability is checked separately on the server. */
export function quoteBooking(input: QuoteInput, s: PricingSettings, today: string = todayIst()): QuoteResult {
  const { type, priceUnit, basePriceInr, guests, start } = input;
  if (!isIsoDate(start)) return { ok: false, error: 'Choose a start date.' };
  if (start < today) return { ok: false, error: 'That date has already passed.' };
  if (!Number.isInteger(guests) || guests < 1) return { ok: false, error: 'Add at least one guest.' };
  if (guests > input.maxGuests) return { ok: false, error: `This ${type === 'stay' ? 'stay' : 'experience'} takes up to ${input.maxGuests} guests.` };

  let end = addDays(start, 1);
  let nights = 1;
  if (type === 'stay') {
    if (!input.end || !isIsoDate(input.end)) return { ok: false, error: 'Choose a check-out date.' };
    nights = daysBetween(start, input.end);
    if (nights < 1) return { ok: false, error: 'Check-out must be after check-in.' };
    if (nights > MAX_NIGHTS) return { ok: false, error: `Stays can be booked for up to ${MAX_NIGHTS} nights.` };
    end = input.end;
  }

  const perUnit = priceUnit === 'person' ? guests : 1;
  const days = eachNight(start, nights);
  const dayPrices = days.map((d) => input.overrides?.[d] ?? basePriceInr);
  const subtotal = dayPrices.reduce((a, b) => a + b, 0) * perUnit;

  const lines: Quote['lines'] = [];
  const uniform = dayPrices.every((p) => p === dayPrices[0]);
  const unitLabel = priceUnit === 'person' ? ` × ${guests} guests` : '';
  if (type === 'stay') {
    lines.push({
      label: uniform ? `${inr(dayPrices[0])} × ${nights} ${nights === 1 ? 'night' : 'nights'}${unitLabel}` : `${nights} nights (seasonal prices)${unitLabel}`,
      amount: subtotal,
    });
  } else {
    lines.push({ label: `${inr(dayPrices[0])}${priceUnit === 'group' ? ' per group' : unitLabel}`, amount: subtotal });
  }

  const serviceFee = Math.round((subtotal * s.serviceFeePct) / 100);
  const tax = Math.round((subtotal * s.taxPct) / 100);
  if (serviceFee) lines.push({ label: `Service fee (${s.serviceFeePct}%)`, amount: serviceFee });
  if (tax) lines.push({ label: `Taxes (${s.taxPct}%)`, amount: tax });

  const commissionPct = s.commissionPct[type];
  const commission = Math.round((subtotal * commissionPct) / 100);
  return {
    ok: true,
    quote: {
      start,
      end,
      nights,
      guests,
      lines,
      subtotal,
      serviceFee,
      tax,
      total: subtotal + serviceFee + tax,
      commissionPct,
      commission,
      hostPayout: subtotal - commission,
    },
  };
}

/** Refund owed when a traveller cancels `daysBefore` days ahead of the start date. */
export function refundFor(policy: CancellationPolicy, daysBefore: number, amountPaid: number): { share: number; amount: number } {
  const rule = REFUND_RULES[policy].find((r) => daysBefore >= r.minDaysBefore);
  const share = rule?.refund ?? 0;
  return { share, amount: Math.round(amountPaid * share) };
}

/** True when two half-open date ranges [aStart, aEnd) and [bStart, bEnd) overlap. */
export function rangesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return aStart < bEnd && bStart < aEnd;
}
