'use client';

import { useEffect, useState, useTransition } from 'react';
import { getQuote, startBooking } from '@/app/booking-actions';
import type { Quote } from '@/lib/pricing';
import { addDays, todayIst } from '@/lib/pricing';
import { useNow } from '@/lib/use-now';
import { formatInr } from '@/lib/format';
import { Field, inputCls } from '@/components/forms/fields';
import { PayButton, type CheckoutOrder } from './PayButton';

interface Props {
  listingId: string;
  title: string;
  type: 'stay' | 'experience';
  priceUnit: 'night' | 'person' | 'group';
  basePriceInr: number;
  maxGuests: number;
  policy: string;
}

const dark = 'h-12 w-full rounded-xl border border-night-line-2 bg-night-2 px-3 text-white [color-scheme:dark]';

/** Date + guests → live quote → guest details → Razorpay order → payment. */
export function BookingWidget({ listingId, title, type, priceUnit, basePriceInr, maxGuests, policy }: Props) {
  const now = useNow();
  const today = now ? todayIst(now) : '';
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [guests, setGuests] = useState(Math.min(2, maxGuests));
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  const [details, setDetails] = useState({ guestName: '', guestEmail: '', guestPhone: '' });
  const [order, setOrder] = useState<CheckoutOrder | null>(null);

  const ready = Boolean(start && (type === 'experience' || end));

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    startTransition(async () => {
      const r = await getQuote({ listingId, start, end: type === 'stay' ? end : undefined, guests });
      if (cancelled) return;
      setQuote(r.ok ? r.quote : null);
      setError(r.ok ? '' : r.error);
      setOrder(null);
    });
    return () => {
      cancelled = true;
    };
  }, [ready, listingId, start, end, guests, type]);

  function book(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    startTransition(async () => {
      const r = await startBooking({ listingId, start, end: type === 'stay' ? end : undefined, guests, ...details });
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setOrder({ ...r, description: title });
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-extrabold tracking-tight">{formatInr(basePriceInr)}</span>
        <span className="text-night-muted">/ {priceUnit}</span>
      </div>

      <div className={`grid gap-3 ${type === 'stay' ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-night-muted">
          {type === 'stay' ? 'Check-in' : 'Date'}
          <input
            type="date"
            min={today}
            value={start}
            onChange={(e) => {
              setStart(e.target.value);
              if (type === 'stay' && (!end || end <= e.target.value)) setEnd(e.target.value ? addDays(e.target.value, 1) : '');
            }}
            className={dark}
          />
        </label>
        {type === 'stay' && (
          <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-night-muted">
            Check-out
            <input type="date" min={start ? addDays(start, 1) : today} value={end} onChange={(e) => setEnd(e.target.value)} className={dark} />
          </label>
        )}
      </div>
      <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-night-muted">
        Guests
        <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className={dark}>
          {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? 'guest' : 'guests'}
            </option>
          ))}
        </select>
      </label>

      <div aria-live="polite" className="flex flex-col gap-2">
        {pending && !quote && <p className="text-sm text-night-muted">Checking dates…</p>}
        {error && (
          <p role="alert" className="rounded-xl bg-amber-bg p-3 text-sm font-semibold text-amber-ink">
            {error}
          </p>
        )}
        {quote && !error && (
          <dl className="flex flex-col gap-2 border-t border-night-line pt-3 text-[15px]" data-testid="quote">
            {quote.lines.map((l) => (
              <div key={l.label} className="flex justify-between gap-3">
                <dt className="text-night-soft">{l.label}</dt>
                <dd className="font-bold">{formatInr(l.amount)}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-3 border-t border-night-line pt-2 text-lg">
              <dt className="font-extrabold">Total</dt>
              <dd className="font-extrabold" data-testid="quote-total">
                {formatInr(quote.total)}
              </dd>
            </div>
          </dl>
        )}
      </div>

      {quote && !error && !order && (
        <form onSubmit={book} className="flex flex-col gap-3 rounded-2xl bg-white p-4 text-ink">
          <Field id="bk-name" label="Your name">
            <input
              id="bk-name"
              required
              value={details.guestName}
              onChange={(e) => setDetails({ ...details, guestName: e.target.value })}
              autoComplete="name"
              className={inputCls}
            />
          </Field>
          <Field id="bk-email" label="Email">
            <input
              id="bk-email"
              type="email"
              required
              value={details.guestEmail}
              onChange={(e) => setDetails({ ...details, guestEmail: e.target.value })}
              autoComplete="email"
              className={inputCls}
            />
          </Field>
          <Field id="bk-phone" label="Phone (optional)">
            <input
              id="bk-phone"
              type="tel"
              value={details.guestPhone}
              onChange={(e) => setDetails({ ...details, guestPhone: e.target.value })}
              autoComplete="tel"
              className={inputCls}
            />
          </Field>
          <p className="text-xs text-ink-3">{policy}</p>
          <button type="submit" disabled={pending} className="h-12 rounded-full bg-teal font-extrabold text-white disabled:opacity-60">
            {pending ? 'Holding your dates…' : 'Continue to payment'}
          </button>
        </form>
      )}

      {order && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-night-soft">
            Booking <strong className="text-white">{order.ref}</strong> — your dates are held for 30 minutes.
          </p>
          <PayButton order={order} label={`Pay ${formatInr(order.amountPaise / 100)}`} />
        </div>
      )}
    </div>
  );
}
