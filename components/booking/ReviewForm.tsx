'use client';

import { useActionState, useState } from 'react';
import { Star } from 'lucide-react';
import { submitReview, type ReviewFormState } from '@/app/review-actions';
import { FormMessage, textareaCls } from '@/components/forms/fields';

const LABELS = ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

export function ReviewForm({ bookingRef, token }: { bookingRef: string; token: string }) {
  const [state, action, pending] = useActionState<ReviewFormState, FormData>(submitReview, { ok: false, message: '' });
  const [rating, setRating] = useState(0);
  if (state.ok) return <FormMessage ok message={state.message} />;
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="ref" value={bookingRef} />
      <input type="hidden" name="t" value={token} />
      <fieldset>
        <legend className="mb-2 text-sm font-bold text-ink-2">Your rating</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer">
              <input type="radio" name="rating" value={n} className="peer sr-only" checked={rating === n} onChange={() => setRating(n)} />
              <span className="sr-only">
                {n} {n === 1 ? 'star' : 'stars'} — {LABELS[n - 1]}
              </span>
              <Star
                size={32}
                aria-hidden="true"
                className={`rounded peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-terracotta ${n <= rating ? 'fill-amber text-amber' : 'text-line'}`}
              />
            </label>
          ))}
        </div>
        {rating > 0 && <p className="mt-1 text-sm font-bold text-amber-ink">{LABELS[rating - 1]}</p>}
      </fieldset>
      <label htmlFor="review-text" className="text-sm font-bold text-ink-2">
        What was it like?
      </label>
      <textarea id="review-text" name="text" rows={5} required minLength={20} maxLength={2000} className={textareaCls} />
      <p className="text-xs text-ink-3">Your review shows your first name and initial only.</p>
      <button type="submit" disabled={pending} className="h-11 w-fit rounded-full bg-teal px-6 font-extrabold text-white disabled:opacity-60">
        {pending ? 'Posting…' : 'Post review'}
      </button>
      <FormMessage ok={state.ok} message={state.message} />
    </form>
  );
}
