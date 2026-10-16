import { afterEach, describe, expect, it, vi } from 'vitest';
import { addDays, daysBetween, eachNight, isIsoDate, quoteBooking, rangesOverlap, refundFor, todayIst, type PricingSettings } from '@/lib/pricing';

const S: PricingSettings = { commissionPct: { stay: 12, experience: 15 }, serviceFeePct: 5, taxPct: 12 };
const TODAY = '2026-11-01';
const stay = { type: 'stay' as const, priceUnit: 'night' as const, basePriceInr: 2000, maxGuests: 4 };

describe('dates', () => {
  it('handles calendar dates without time-zone drift', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(daysBetween('2026-11-01', '2026-11-04')).toBe(3);
    expect(eachNight('2026-11-30', 2)).toEqual(['2026-11-30', '2026-12-01']);
    expect(isIsoDate('2026-02-30')).toBe(false);
    expect(isIsoDate('2026-02-28')).toBe(true);
    expect(todayIst(Date.parse('2026-10-16T20:00:00Z'))).toBe('2026-10-17');
  });

  it('detects overlapping stays (check-out day is free for the next guest)', () => {
    expect(rangesOverlap('2026-11-01', '2026-11-04', '2026-11-03', '2026-11-05')).toBe(true);
    expect(rangesOverlap('2026-11-01', '2026-11-04', '2026-11-04', '2026-11-06')).toBe(false);
  });
});

describe('quoteBooking', () => {
  it('prices nights, service fee, tax and commission', () => {
    const r = quoteBooking({ ...stay, start: '2026-11-10', end: '2026-11-13', guests: 2 }, S, TODAY);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.quote.nights).toBe(3);
    expect(r.quote.subtotal).toBe(6000);
    expect(r.quote.serviceFee).toBe(300);
    expect(r.quote.tax).toBe(720);
    expect(r.quote.total).toBe(7020);
    expect(r.quote.commission).toBe(720);
    expect(r.quote.hostPayout).toBe(5280);
  });

  it('uses per-date price overrides', () => {
    const r = quoteBooking({ ...stay, start: '2026-12-30', end: '2027-01-01', guests: 2, overrides: { '2026-12-31': 5000 } }, S, TODAY);
    expect(r.ok && r.quote.subtotal).toBe(7000);
  });

  it('charges per person for per-person experiences and uses experience commission', () => {
    const r = quoteBooking({ type: 'experience', priceUnit: 'person', basePriceInr: 1500, maxGuests: 8, start: '2026-11-20', guests: 3 }, S, TODAY);
    expect(r.ok && r.quote.subtotal).toBe(4500);
    expect(r.ok && r.quote.end).toBe('2026-11-21');
    expect(r.ok && r.quote.commission).toBe(675);
  });

  it('rejects past dates, reversed ranges, too many guests and overly long stays', () => {
    expect(quoteBooking({ ...stay, start: '2026-10-01', end: '2026-10-03', guests: 1 }, S, TODAY).ok).toBe(false);
    expect(quoteBooking({ ...stay, start: '2026-11-10', end: '2026-11-10', guests: 1 }, S, TODAY).ok).toBe(false);
    expect(quoteBooking({ ...stay, start: '2026-11-10', end: '2026-11-12', guests: 5 }, S, TODAY).ok).toBe(false);
    expect(quoteBooking({ ...stay, start: '2026-11-10', end: '2026-12-31', guests: 1 }, S, TODAY).ok).toBe(false);
  });
});

describe('refundFor', () => {
  it('follows each cancellation policy', () => {
    expect(refundFor('flexible', 5, 10000)).toEqual({ share: 1, amount: 10000 });
    expect(refundFor('flexible', 1, 10000)).toEqual({ share: 0.5, amount: 5000 });
    expect(refundFor('moderate', 6, 10000).amount).toBe(5000);
    expect(refundFor('moderate', 2, 10000).amount).toBe(0);
    expect(refundFor('strict', 20, 9999).amount).toBe(5000);
    expect(refundFor('strict', 13, 10000).amount).toBe(0);
  });
});

describe('Razorpay signatures', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('verifies checkout and webhook signatures with the configured secrets', async () => {
    vi.stubEnv('RAZORPAY_KEY_ID', 'rzp_test_abc');
    vi.stubEnv('RAZORPAY_KEY_SECRET', 'secret123');
    vi.stubEnv('RAZORPAY_WEBHOOK_SECRET', 'whsec');
    vi.stubEnv('PAYMENTS_FAKE', '');
    const rp = await import('@/lib/razorpay');
    const sig = rp.hmacHex('order_1|pay_1', 'secret123');
    expect(rp.verifyPaymentSignature('order_1', 'pay_1', sig)).toBe(true);
    expect(rp.verifyPaymentSignature('order_1', 'pay_2', sig)).toBe(false);
    const body = '{"event":"payment.captured"}';
    expect(rp.verifyWebhookSignature(body, rp.hmacHex(body, 'whsec'))).toBe(true);
    expect(rp.verifyWebhookSignature(body, rp.hmacHex(body, 'wrong'))).toBe(false);
    expect(rp.verifyWebhookSignature(body, null)).toBe(false);
    expect(rp.paymentsStatus()).toBe('test');
  });

  it('refuses live keys until the owner approves going live', async () => {
    vi.stubEnv('RAZORPAY_KEY_ID', 'rzp_live_abc');
    vi.stubEnv('RAZORPAY_KEY_SECRET', 'secret123');
    vi.stubEnv('PAYMENTS_FAKE', '');
    vi.stubEnv('PAYMENTS_LIVE_APPROVED', '');
    const rp = await import('@/lib/razorpay');
    expect(rp.paymentsEnabled()).toBe(false);
    expect(rp.paymentsStatus()).toBe('live-blocked');
  });

  it('never enables the fake gateway on Vercel', async () => {
    vi.stubEnv('PAYMENTS_FAKE', '1');
    vi.stubEnv('VERCEL', '1');
    vi.stubEnv('RAZORPAY_KEY_ID', '');
    const rp = await import('@/lib/razorpay');
    expect(rp.fakePayments).toBe(false);
    expect(rp.paymentsEnabled()).toBe(false);
  });
});
