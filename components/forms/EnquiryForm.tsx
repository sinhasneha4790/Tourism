'use client';

import { useActionState } from 'react';
import { submitEnquiry, type FormState } from '@/app/actions';

const initial: FormState = { ok: false, message: '' };

const input = 'h-12 w-full rounded-xl border border-line bg-card px-3.5 text-[15px] aria-[invalid=true]:border-terracotta';
const labelCls = 'flex flex-col gap-1.5 text-sm font-bold text-ink-2';

export function EnquiryForm({
  kind,
  refLabel,
  defaultTravellers = 2,
  defaultMessage = '',
}: {
  kind: 'package' | 'contact' | 'plan';
  refLabel?: string;
  defaultTravellers?: number;
  defaultMessage?: string;
}) {
  const [state, action, pending] = useActionState(submitEnquiry, initial);
  const err = state.errors ?? {};

  if (state.ok) {
    return (
      <div role="status" className="rounded-[20px] bg-teal-soft p-6 font-bold text-teal">
        {state.message}
      </div>
    );
  }

  return (
    <form action={action} noValidate className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="kind" value={kind} />
      {refLabel && <input type="hidden" name="ref" value={refLabel} />}
      {/* Honeypot */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <Field label="Your name" name="name" error={err.name}>
        <input
          id="enq-name"
          name="name"
          required
          autoComplete="name"
          className={input}
          aria-invalid={!!err.name}
          aria-describedby={err.name ? 'enq-name-err' : undefined}
        />
      </Field>
      <Field label="Email" name="email" error={err.email}>
        <input
          id="enq-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={input}
          aria-invalid={!!err.email}
          aria-describedby={err.email ? 'enq-email-err' : undefined}
        />
      </Field>
      <Field label="Phone / WhatsApp (optional)" name="phone" error={err.phone}>
        <input
          id="enq-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          className={input}
          aria-invalid={!!err.phone}
          aria-describedby={err.phone ? 'enq-phone-err' : undefined}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Start date" name="startDate" error={err.startDate}>
          <input id="enq-startDate" name="startDate" type="date" className={input} aria-invalid={!!err.startDate} />
        </Field>
        <Field label="Travellers" name="travellers" error={err.travellers}>
          <input
            id="enq-travellers"
            name="travellers"
            type="number"
            min={1}
            max={30}
            defaultValue={defaultTravellers}
            className={input}
            aria-invalid={!!err.travellers}
          />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Anything we should know?" name="message" error={err.message}>
          <textarea id="enq-message" name="message" rows={4} defaultValue={defaultMessage} className={`${input} h-auto py-3`} />
        </Field>
      </div>
      <div className="flex flex-col gap-2 sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="h-13 rounded-full bg-teal px-7 font-extrabold text-white hover:brightness-125 disabled:opacity-60 sm:w-fit"
        >
          {pending ? 'Sending…' : 'Send enquiry'}
        </button>
        <p role="status" aria-live="polite" className="min-h-5 text-sm font-semibold text-terracotta">
          {state.message}
        </p>
      </div>
    </form>
  );
}

function Field({ label, name, error, children }: { label: string; name: string; error?: string; children: React.ReactNode }) {
  return (
    <div className={labelCls}>
      <label htmlFor={`enq-${name}`}>{label}</label>
      {children}
      {error && (
        <span id={`enq-${name}-err`} className="text-sm font-semibold text-terracotta">
          {error}
        </span>
      )}
    </div>
  );
}
