'use client';

import { useActionState } from 'react';
import { saveListing } from '@/app/marketplace-actions';
import type { FormState } from '@/app/actions';
import { STATES } from '@/content/states';
import { Field, FormMessage, describedBy, inputCls, textareaCls } from '@/components/forms/fields';

const initial: FormState = { ok: false, message: '' };

export interface ListingDefaults {
  id?: string;
  type?: 'stay' | 'experience';
  title?: string;
  state?: string;
  location?: string;
  description?: string;
  amenities?: string[];
  basePriceInr?: number;
  priceUnit?: 'night' | 'person' | 'group';
  maxGuests?: number;
  cancellationPolicy?: 'flexible' | 'moderate' | 'strict';
  lat?: number | null;
  lng?: number | null;
}

export function ListingForm({ defaults = {} }: { defaults?: ListingDefaults }) {
  const [state, action, pending] = useActionState(saveListing, initial);
  const e = state.errors ?? {};
  const f = (name: string, label: string, control: React.ReactNode, opts: { hint?: string; wide?: boolean } = {}) => (
    <Field id={`ls-${name}`} label={label} hint={opts.hint} error={e[name]} className={opts.wide ? 'sm:col-span-2' : ''}>
      {control}
    </Field>
  );
  const a = (name: string, hint?: string) => ({
    id: `ls-${name}`,
    name,
    'aria-invalid': !!e[name],
    'aria-describedby': describedBy(`ls-${name}`, e[name], hint),
  });

  return (
    <form action={action} noValidate className="grid gap-4 sm:grid-cols-2">
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}
      {f(
        'type',
        'What are you listing?',
        <select {...a('type')} defaultValue={defaults.type ?? 'stay'} className={inputCls}>
          <option value="stay">A stay (homestay, guesthouse, camp)</option>
          <option value="experience">An experience or local tour</option>
        </select>,
      )}
      {f(
        'title',
        'Title',
        <input {...a('title')} defaultValue={defaults.title} required className={inputCls} placeholder="e.g. Riverside bamboo homestay in Ziro" />,
      )}
      {f(
        'state',
        'State',
        <select {...a('state')} defaultValue={defaults.state ?? 'meghalaya'} className={inputCls}>
          {STATES.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>,
      )}
      {f('location', 'Village / town, district', <input {...a('location')} defaultValue={defaults.location} required className={inputCls} />)}
      {f(
        'description',
        'Description',
        <textarea {...a('description', 'At least 40 characters.')} defaultValue={defaults.description} rows={6} required className={textareaCls} />,
        { wide: true, hint: 'At least 40 characters.' },
      )}
      {f(
        'amenities',
        'Amenities / what’s included',
        <input
          {...a('amenities', 'Separate with commas.')}
          defaultValue={defaults.amenities?.join(', ')}
          className={inputCls}
          placeholder="Hot water, Home-cooked meals, Wi-Fi"
        />,
        { wide: true, hint: 'Separate with commas.' },
      )}
      <div className="grid grid-cols-2 gap-3">
        {f(
          'basePriceInr',
          'Price (₹)',
          <input {...a('basePriceInr')} type="number" min={100} defaultValue={defaults.basePriceInr} required className={inputCls} />,
        )}
        {f(
          'priceUnit',
          'Per',
          <select {...a('priceUnit')} defaultValue={defaults.priceUnit ?? 'night'} className={inputCls}>
            <option value="night">night</option>
            <option value="person">person</option>
            <option value="group">group</option>
          </select>,
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {f('maxGuests', 'Max guests', <input {...a('maxGuests')} type="number" min={1} max={50} defaultValue={defaults.maxGuests ?? 2} className={inputCls} />)}
        {f(
          'cancellationPolicy',
          'Cancellation',
          <select {...a('cancellationPolicy')} defaultValue={defaults.cancellationPolicy ?? 'moderate'} className={inputCls}>
            <option value="flexible">Flexible</option>
            <option value="moderate">Moderate</option>
            <option value="strict">Strict</option>
          </select>,
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:col-span-2 sm:max-w-md">
        {f(
          'lat',
          'Latitude (optional)',
          <input {...a('lat')} inputMode="decimal" defaultValue={defaults.lat ?? ''} className={inputCls} placeholder="25.57" />,
        )}
        {f(
          'lng',
          'Longitude (optional)',
          <input {...a('lng')} inputMode="decimal" defaultValue={defaults.lng ?? ''} className={inputCls} placeholder="91.88" />,
        )}
      </div>
      <div className="flex flex-col gap-2 sm:col-span-2">
        <button type="submit" disabled={pending} className="h-12 w-fit rounded-full bg-teal px-7 font-extrabold text-white disabled:opacity-60">
          {pending ? 'Saving…' : defaults.id ? 'Save changes' : 'Create draft'}
        </button>
        <FormMessage ok={state.ok} message={state.message} />
      </div>
    </form>
  );
}
