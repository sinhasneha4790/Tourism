import 'server-only';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * Razorpay integration (Orders API + Checkout + webhooks).
 *
 * Safety rails:
 * - Live keys (rzp_live_…) are refused unless PAYMENTS_LIVE_APPROVED=true, which only the
 *   owner should set, in the Vercel dashboard, after approving go-live.
 * - PAYMENTS_FAKE=1 swaps in a local fake gateway for development and CI. It is ignored on
 *   Vercel, and still goes through the same signature verification as real payments.
 */
const API = 'https://api.razorpay.com/v1';

export const fakePayments = process.env.PAYMENTS_FAKE === '1' && !process.env.VERCEL;
const FAKE_KEY_ID = 'rzp_test_fake';
const FAKE_SECRET = 'fake_secret_for_local_testing_only';

function keys() {
  if (fakePayments) return { keyId: FAKE_KEY_ID, secret: FAKE_SECRET };
  const keyId = process.env.RAZORPAY_KEY_ID ?? '';
  const secret = process.env.RAZORPAY_KEY_SECRET ?? '';
  if (!keyId || !secret) return null;
  if (keyId.startsWith('rzp_live_') && process.env.PAYMENTS_LIVE_APPROVED !== 'true') return null;
  return { keyId, secret };
}

export type PaymentsStatus = 'fake' | 'test' | 'live' | 'off' | 'live-blocked';

export function paymentsStatus(): PaymentsStatus {
  if (fakePayments) return 'fake';
  const keyId = process.env.RAZORPAY_KEY_ID ?? '';
  if (!keyId || !process.env.RAZORPAY_KEY_SECRET) return 'off';
  if (keyId.startsWith('rzp_live_')) return process.env.PAYMENTS_LIVE_APPROVED === 'true' ? 'live' : 'live-blocked';
  return 'test';
}

export function paymentsEnabled(): boolean {
  return keys() !== null;
}

export function publicKeyId(): string | null {
  return keys()?.keyId ?? null;
}

function auth(k: { keyId: string; secret: string }) {
  return `Basic ${Buffer.from(`${k.keyId}:${k.secret}`).toString('base64')}`;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: 'INR';
}

/** Creates an order for `amountInr` rupees (Razorpay takes paise). */
export async function createOrder(amountInr: number, receipt: string, notes: Record<string, string>): Promise<RazorpayOrder> {
  const k = keys();
  if (!k) throw new Error('Payments are not configured');
  const amount = Math.round(amountInr * 100);
  if (fakePayments) return { id: `order_fake_${randomBytes(8).toString('hex')}`, amount, currency: 'INR' };
  const res = await fetch(`${API}/orders`, {
    method: 'POST',
    headers: { Authorization: auth(k), 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, currency: 'INR', receipt: receipt.slice(0, 40), notes }),
  });
  if (!res.ok) throw new Error(`Razorpay order failed (${res.status})`);
  const order = (await res.json()) as RazorpayOrder;
  return { id: order.id, amount: order.amount, currency: 'INR' };
}

/** Refunds `amountInr` rupees of a captured payment. Returns the refund id. */
export async function refundPayment(paymentId: string, amountInr: number): Promise<string> {
  const k = keys();
  if (!k) throw new Error('Payments are not configured');
  if (fakePayments) return `rfnd_fake_${randomBytes(6).toString('hex')}`;
  const res = await fetch(`${API}/payments/${encodeURIComponent(paymentId)}/refund`, {
    method: 'POST',
    headers: { Authorization: auth(k), 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: Math.round(amountInr * 100), speed: 'normal' }),
  });
  if (!res.ok) throw new Error(`Razorpay refund failed (${res.status})`);
  return ((await res.json()) as { id: string }).id;
}

export function hmacHex(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Checkout success handler signature: HMAC_SHA256(order_id + "|" + payment_id, key_secret). */
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
  const k = keys();
  if (!k || !orderId || !paymentId || !signature) return false;
  return safeEqual(hmacHex(`${orderId}|${paymentId}`, k.secret), signature);
}

/** Webhook signature: HMAC_SHA256(raw request body, webhook secret). */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = fakePayments ? FAKE_SECRET : process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  return safeEqual(hmacHex(rawBody, secret), signature);
}

/** Fake gateway only: produce the signature Razorpay Checkout would return. */
export function fakeCheckoutResult(orderId: string) {
  if (!fakePayments) throw new Error('Fake payments are disabled');
  const paymentId = `pay_fake_${randomBytes(8).toString('hex')}`;
  return { orderId, paymentId, signature: hmacHex(`${orderId}|${paymentId}`, FAKE_SECRET) };
}
