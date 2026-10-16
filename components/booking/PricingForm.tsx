'use client';

import { useActionState } from 'react';
import { savePricing } from '@/app/booking-actions';
import type { PricingSettings } from '@/lib/pricing';
import { FormMessage, inputCls } from '@/components/forms/fields';

export function PricingForm({ current }: { current: PricingSettings }) {
  const [state, action, pending] = useActionState(savePricing, { ok: false, message: '' });
  const field = (name: string, label: string, value: number, hint: string) => (
    <label className="flex flex-col gap-1.5 text-sm font-bold text-ink-2">
      {label}
      <span className="flex items-center gap-2">
        <input name={name} type="number" min={0} max={50} step={0.5} defaultValue={value} className={`${inputCls} max-w-28`} />
        <span>%</span>
      </span>
      <span className="text-xs font-normal text-ink-3">{hint}</span>
    </label>
  );
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {field('commissionStay', 'Commission — stays', current.commissionPct.stay, 'Kept by Mistrail from the host’s price.')}
      {field('commissionExperience', 'Commission — experiences', current.commissionPct.experience, 'Kept by Mistrail from the host’s price.')}
      {field('serviceFeePct', 'Guest service fee', current.serviceFeePct, 'Added to the guest’s total.')}
      {field('taxPct', 'Taxes (GST)', current.taxPct, 'Confirm the rate with your accountant.')}
      <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-4">
        <button type="submit" disabled={pending} className="h-11 w-fit rounded-full bg-teal px-6 font-extrabold text-white disabled:opacity-60">
          {pending ? 'Saving…' : 'Save rates'}
        </button>
        <FormMessage ok={state.ok} message={state.message} />
      </div>
    </form>
  );
}
