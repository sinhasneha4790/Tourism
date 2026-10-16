'use client';

import { useActionState } from 'react';
import { saveHostProfile } from '@/app/marketplace-actions';
import type { FormState } from '@/app/actions';
import { STATES } from '@/content/states';
import { Field, FormMessage, describedBy, inputCls, textareaCls } from '@/components/forms/fields';

const initial: FormState = { ok: false, message: '' };

export interface HostProfileDefaults {
  displayName?: string;
  phone?: string;
  state?: string;
  bio?: string;
}

export function HostProfileForm({ defaults = {} }: { defaults?: HostProfileDefaults }) {
  const [state, action, pending] = useActionState(saveHostProfile, initial);
  const e = state.errors ?? {};
  return (
    <form action={action} noValidate className="grid gap-4 sm:grid-cols-2">
      <Field id="hp-displayName" label="Host or business name (shown to guests)" error={e.displayName}>
        <input
          id="hp-displayName"
          name="displayName"
          defaultValue={defaults.displayName}
          required
          className={inputCls}
          aria-invalid={!!e.displayName}
          aria-describedby={describedBy('hp-displayName', e.displayName)}
        />
      </Field>
      <Field id="hp-phone" label="Phone / WhatsApp" hint="Only Mistrail sees this." error={e.phone}>
        <input
          id="hp-phone"
          name="phone"
          type="tel"
          defaultValue={defaults.phone}
          required
          autoComplete="tel"
          className={inputCls}
          aria-invalid={!!e.phone}
          aria-describedby={describedBy('hp-phone', e.phone, 'Only Mistrail sees this.')}
        />
      </Field>
      <Field id="hp-state" label="State" error={e.state}>
        <select id="hp-state" name="state" defaultValue={defaults.state ?? 'meghalaya'} className={inputCls}>
          {STATES.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
      </Field>
      <Field id="hp-bio" label="About you (optional)" error={e.bio} className="sm:col-span-2">
        <textarea id="hp-bio" name="bio" rows={4} defaultValue={defaults.bio} className={textareaCls} />
      </Field>
      <div className="flex flex-col gap-2 sm:col-span-2">
        <p className="text-xs text-ink-3">Payout details are collected securely by our payment provider when bookings open — we never store bank details.</p>
        <button type="submit" disabled={pending} className="h-12 w-fit rounded-full bg-teal px-7 font-extrabold text-white disabled:opacity-60">
          {pending ? 'Saving…' : 'Save host profile'}
        </button>
        <FormMessage ok={state.ok} message={state.message} />
      </div>
    </form>
  );
}
