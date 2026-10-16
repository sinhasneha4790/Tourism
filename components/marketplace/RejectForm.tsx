'use client';

import { useActionState } from 'react';
import { rejectListing } from '@/app/marketplace-actions';
import type { FormState } from '@/app/actions';
import { FormMessage, textareaCls } from '@/components/forms/fields';

const initial: FormState = { ok: false, message: '' };

export function RejectForm({ id, title }: { id: string; title: string }) {
  const [state, action, pending] = useActionState(rejectListing, initial);
  return (
    <details className="rounded-2xl border border-line-soft p-3">
      <summary className="cursor-pointer text-sm font-bold text-terracotta">Send back with changes</summary>
      <form action={action} className="mt-3 flex flex-col gap-2">
        <input type="hidden" name="id" value={id} />
        <label htmlFor={`reason-${id}`} className="text-sm font-bold text-ink-2">
          What should the host change in “{title}”?
        </label>
        <textarea id={`reason-${id}`} name="reason" rows={3} required className={textareaCls} />
        <button type="submit" disabled={pending} className="h-10 w-fit rounded-full bg-terracotta px-5 text-sm font-extrabold text-white disabled:opacity-60">
          Send back
        </button>
        <FormMessage ok={state.ok} message={state.message} />
      </form>
    </details>
  );
}
