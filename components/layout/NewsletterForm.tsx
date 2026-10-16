'use client';

import { useActionState } from 'react';
import { subscribeNewsletter, type FormState } from '@/app/actions';

const initial: FormState = { ok: false, message: '' };

export function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribeNewsletter, initial);
  return (
    <form action={action} className="flex w-full max-w-md flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@email.com"
          className="h-13 min-w-0 flex-1 rounded-full border border-night-line-2 bg-night-2 px-5 text-[15px] text-white placeholder:text-night-muted"
        />
        <button type="submit" disabled={pending} className="h-13 rounded-full bg-peach px-6 text-[15px] font-extrabold text-night disabled:opacity-60">
          {pending ? 'Sending…' : 'Subscribe'}
        </button>
      </div>
      <p role="status" aria-live="polite" className={`min-h-5 text-sm ${state.ok ? 'text-mint' : 'text-peach-soft'}`}>
        {state.message}
      </p>
    </form>
  );
}
