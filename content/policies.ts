/**
 * Cancellation rules for marketplace bookings. PLACEHOLDER values — the owner must
 * confirm them (and the legal text in content/legal.ts) before taking real payments.
 */
export type CancellationPolicy = 'flexible' | 'moderate' | 'strict';

export interface RefundRule {
  /** Applies when cancelling at least this many days before the start date. */
  minDaysBefore: number;
  /** Share of the amount paid that is refunded (0–1). */
  refund: number;
}

/** Rules are checked in order; the first match wins. No match = no refund. */
export const REFUND_RULES: Record<CancellationPolicy, RefundRule[]> = {
  flexible: [
    { minDaysBefore: 3, refund: 1 },
    { minDaysBefore: 1, refund: 0.5 },
  ],
  moderate: [
    { minDaysBefore: 7, refund: 1 },
    { minDaysBefore: 3, refund: 0.5 },
  ],
  strict: [{ minDaysBefore: 14, refund: 0.5 }],
};

export const POLICY_SUMMARY: Record<CancellationPolicy, string> = {
  flexible: 'Flexible — full refund up to 3 days before arrival, 50% up to 1 day before.',
  moderate: 'Moderate — full refund up to 7 days before arrival, 50% up to 3 days before.',
  strict: 'Strict — 50% refund up to 14 days before arrival; no refund after that.',
};

/** Unpaid bookings hold their dates for this long. */
export const PAYMENT_HOLD_MINUTES = 30;
export const MAX_NIGHTS = 30;
