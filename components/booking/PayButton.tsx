'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { completeFakePayment, verifyCheckout } from '@/app/booking-actions';

export interface CheckoutOrder {
  ref: string;
  token: string;
  orderId: string;
  amountPaise: number;
  keyId: string;
  fake: boolean;
  name: string;
  email: string;
  phone: string;
  description: string;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open: () => void; on: (e: string, cb: (r: unknown) => void) => void };
  }
}

function loadCheckout(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Could not load Razorpay'));
    document.body.appendChild(s);
  });
}

/** Opens Razorpay Checkout for an existing order, then verifies the signed result on the server. */
export function PayButton({ order, label }: { order: CheckoutOrder; label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const done = () => router.push(`/bookings/${order.ref}?t=${encodeURIComponent(order.token)}`);

  async function pay() {
    setBusy(true);
    setError('');
    try {
      if (order.fake) {
        const r = await completeFakePayment({ ref: order.ref, token: order.token, orderId: order.orderId });
        if (!r.ok) throw new Error(r.error);
        return done();
      }
      await loadCheckout();
      const rzp = new window.Razorpay!({
        key: order.keyId,
        amount: order.amountPaise,
        currency: 'INR',
        name: 'Mistrail',
        description: order.description,
        order_id: order.orderId,
        prefill: { name: order.name, email: order.email, contact: order.phone },
        notes: { booking: order.ref },
        theme: { color: '#2E4A50' },
        modal: { ondismiss: () => setBusy(false) },
        handler: async (resp: RazorpayResponse) => {
          const r = await verifyCheckout({
            ref: order.ref,
            token: order.token,
            orderId: resp.razorpay_order_id,
            paymentId: resp.razorpay_payment_id,
            signature: resp.razorpay_signature,
          });
          if (!r.ok) {
            setError(`${r.error} If money left your account, it will be confirmed automatically or refunded — contact us with booking ${order.ref}.`);
            setBusy(false);
            return;
          }
          done();
        },
      });
      rzp.on('payment.failed', () => {
        setError('The payment didn’t go through. You can try again — your dates are held for 30 minutes.');
        setBusy(false);
      });
      rzp.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Payment could not start.');
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button type="button" onClick={pay} disabled={busy} className="h-13 rounded-full bg-peach px-6 font-extrabold text-night disabled:opacity-60">
        {busy ? 'Opening payment…' : label}
      </button>
      {order.fake && <p className="text-xs font-bold text-amber-ink">Local test mode — no real payment is taken.</p>}
      {error && (
        <p role="alert" className="text-sm font-semibold text-terracotta">
          {error}
        </p>
      )}
    </div>
  );
}
