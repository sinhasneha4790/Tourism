'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { Printer, Send } from 'lucide-react';
import { calculateBudget, defaultRooms, type BudgetInput } from '@/lib/budget';
import {
  LIMITS,
  PEAK_MULTIPLIER,
  RATES_LAST_REVIEWED,
  RIDE_RATES,
  STAY_RATES,
  PERMIT_FEE_PER_PERSON,
  SAFARI_PER_PERSON,
  type RideType,
  type StayType,
} from '@/content/rates';
import { getPackage } from '@/content/packages';
import { formatInr, MONTHS } from '@/lib/format';
import { EnquiryForm } from '@/components/forms/EnquiryForm';

const DEFAULTS: BudgetInput = {
  days: 6,
  travellers: 2,
  stay: 'homestay',
  ride: 'suv',
  safari: true,
  permits: true,
};

const card = (on: boolean) =>
  `min-h-16 rounded-2xl px-4 py-3.5 text-left text-ink transition-colors ${on ? 'border-2 border-teal bg-teal-soft' : 'border border-line bg-card hover:border-sage'}`;
const pill = (on: boolean) => `h-11.5 rounded-full px-[18px] text-sm font-bold ${on ? 'bg-teal text-white' : 'border border-line bg-card text-ink-2'}`;
const label = 'text-[13px] font-extrabold tracking-[0.12em] text-ink-3';

/** Reads ?days= and ?package= so package pages can pre-fill the planner. */
export function BudgetPlannerFromUrl() {
  const params = useSearchParams();
  const days = Number(params.get('days'));
  const pkg = getPackage(params.get('package') ?? '');
  const initial: BudgetInput = {
    ...DEFAULTS,
    days: Number.isFinite(days) && days >= LIMITS.days.min ? Math.min(days, LIMITS.days.max) : DEFAULTS.days,
  };
  if (pkg) initial.safari = pkg.interests.includes('wildlife');
  if (pkg) initial.permits = pkg.permitsNeeded.length > 0;
  return <BudgetPlanner key={params.toString()} initial={initial} packageTitle={pkg?.title} packageSlug={pkg?.slug} />;
}

export function BudgetPlanner({ initial = DEFAULTS, packageTitle, packageSlug }: { initial?: BudgetInput; packageTitle?: string; packageSlug?: string }) {
  const [input, setInput] = useState<BudgetInput>(initial);
  const [roomsEdited, setRoomsEdited] = useState(false);
  const [sending, setSending] = useState(false);
  const b = calculateBudget(input);

  const set = (patch: Partial<BudgetInput>) => setInput((prev) => ({ ...prev, ...patch }));
  const step = (key: 'days' | 'travellers' | 'rooms', delta: number) => {
    const lim = LIMITS[key];
    const current = key === 'rooms' ? b.rooms : input[key];
    const value = Math.max(lim.min, Math.min(lim.max, current + delta));
    if (key === 'rooms') {
      setRoomsEdited(true);
      set({ rooms: Math.min(value, b.travellers) });
    } else if (key === 'travellers') {
      set({
        travellers: value,
        rooms: roomsEdited ? Math.min(input.rooms ?? defaultRooms(value), value) : undefined,
      });
    } else {
      set({ days: value });
    }
  };

  const summary = [
    packageTitle ? `Package: ${packageTitle}` : null,
    `${b.days} days, ${b.travellers} travellers, ${b.rooms} rooms`,
    `Stay: ${STAY_RATES[input.stay].label}; transport: ${RIDE_RATES[input.ride].label}`,
    input.startMonth ? `Start month: ${MONTHS[input.startMonth - 1]}` : null,
    ...b.lines.map((l) => `${l.label}: ${formatInr(l.amount)}`),
    `Estimated total: ${formatInr(b.total)} (${formatInr(b.perPerson)} per person)`,
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-stretch gap-5">
        <div className="no-print flex min-w-0 flex-[999_1_520px] flex-col gap-7 rounded-[28px] border border-line-soft bg-card p-6 md:p-8">
          {packageTitle && (
            <p className="rounded-2xl bg-teal-soft px-4 py-3 text-sm font-bold text-teal">
              Pre-filled from{' '}
              <Link href={`/packages/${packageSlug}`} className="underline">
                {packageTitle}
              </Link>
            </p>
          )}
          <div className="flex flex-wrap gap-6">
            <Stepper label="TRIP LENGTH" value={`${b.days} days`} onDown={() => step('days', -1)} onUp={() => step('days', 1)} what="days" />
            <Stepper
              label="TRAVELLERS"
              value={`${b.travellers} ${b.travellers === 1 ? 'adult' : 'adults'}`}
              onDown={() => step('travellers', -1)}
              onUp={() => step('travellers', 1)}
              what="travellers"
            />
            <Stepper
              label="ROOMS"
              value={`${b.rooms} ${b.rooms === 1 ? 'room' : 'rooms'}`}
              onDown={() => step('rooms', -1)}
              onUp={() => step('rooms', 1)}
              what="rooms"
            />
          </div>

          <fieldset className="flex flex-col gap-2.5">
            <legend className={`${label} mb-2.5`}>WHERE YOU STAY</legend>
            <div className="grid gap-2.5 sm:grid-cols-3">
              {(Object.keys(STAY_RATES) as StayType[]).map((id) => (
                <button key={id} type="button" aria-pressed={input.stay === id} onClick={() => set({ stay: id })} className={card(input.stay === id)}>
                  <strong className="block text-base">{STAY_RATES[id].label}</strong>
                  <span className="text-[13px] text-ink-3">~{formatInr(STAY_RATES[id].perRoomNight)} / room night</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-2.5">
            <legend className={`${label} mb-2.5`}>GETTING AROUND</legend>
            <div className="grid gap-2.5 sm:grid-cols-3">
              {(Object.keys(RIDE_RATES) as RideType[]).map((id) => (
                <button key={id} type="button" aria-pressed={input.ride === id} onClick={() => set({ ride: id })} className={card(input.ride === id)}>
                  <strong className="block text-base">{RIDE_RATES[id].label}</strong>
                  <span className="text-[13px] text-ink-3">
                    {RIDE_RATES[id].note} · {formatInr(RIDE_RATES[id].perDay)} / {RIDE_RATES[id].perPerson ? 'person / day' : 'day'}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-wrap items-end gap-4">
            <label className="flex flex-col gap-2">
              <span className={label}>START MONTH</span>
              <select
                value={input.startMonth ?? ''}
                onChange={(e) =>
                  set({
                    startMonth: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="h-11.5 rounded-xl border border-line bg-card px-3 font-semibold"
              >
                <option value="">Not sure yet</option>
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" aria-pressed={input.safari} onClick={() => set({ safari: !input.safari })} className={pill(input.safari)}>
              Kaziranga jeep safari · {formatInr(SAFARI_PER_PERSON)} pp
            </button>
            <button type="button" aria-pressed={input.permits} onClick={() => set({ permits: !input.permits })} className={pill(input.permits)}>
              Permit (ILP) fees · {formatInr(PERMIT_FEE_PER_PERSON)} pp
            </button>
          </div>
        </div>

        <div className="print-plain flex flex-[1_1_340px] flex-col gap-[18px] rounded-[28px] bg-night p-6 text-white md:p-8">
          <span className="eyebrow text-peach">Estimated total</span>
          <p className="text-[clamp(44px,6vw,56px)] font-extrabold leading-none tracking-[-0.03em]" aria-live="polite" data-testid="budget-total">
            {formatInr(b.total)}
          </p>
          <p className="text-[15px] text-night-muted" data-testid="budget-per-person">
            about {formatInr(b.perPerson)} per person
          </p>
          <dl className="flex flex-col gap-2.5 border-t border-night-line pt-4 text-[15px]">
            {b.lines.map((l) => (
              <div key={l.id} className="flex justify-between gap-4">
                <dt className="text-night-soft">{l.label}</dt>
                <dd className="font-bold">{formatInr(l.amount)}</dd>
              </div>
            ))}
          </dl>
          {b.peak && (
            <p className="text-sm text-peach-soft">
              Peak-season rates applied (+
              {Math.round((PEAK_MULTIPLIER - 1) * 100)}% on stays and transport).
            </p>
          )}
          <div className="no-print mt-auto flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => setSending((s) => !s)}
              aria-expanded={sending}
              className="flex h-13 items-center justify-center gap-2 rounded-full bg-peach font-extrabold text-night"
            >
              <Send size={18} aria-hidden="true" /> Send me this plan
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex h-13 items-center justify-center gap-2 rounded-full border border-night-line-2 font-bold hover:bg-night-2"
            >
              <Printer size={18} aria-hidden="true" /> Print / Save PDF
            </button>
          </div>
          <p className="text-xs text-night-muted">Indicative rates excluding flights, last reviewed {RATES_LAST_REVIEWED}. Your final quote may differ.</p>
        </div>
      </div>

      {sending && (
        <section aria-label="Send me this plan" className="no-print rounded-[28px] border border-line-soft bg-card p-6 md:p-8">
          <h2 className="mb-1 text-2xl font-extrabold">Send me this plan</h2>
          <p className="mb-5 text-ink-2">We’ll email you this estimate and suggest a route that fits it.</p>
          <EnquiryForm key={summary} kind="plan" refLabel={packageTitle ?? 'Trip budget planner'} defaultTravellers={b.travellers} defaultMessage={summary} />
        </section>
      )}
    </div>
  );
}

function Stepper({ label: text, value, onDown, onUp, what }: { label: string; value: string; onDown: () => void; onUp: () => void; what: string }) {
  const btn = 'h-12 w-12 rounded-full border border-line bg-paper text-[22px] font-extrabold hover:border-sage';
  return (
    <div className="flex flex-[1_1_180px] flex-col gap-2.5">
      <span className={label}>{text}</span>
      <div className="flex items-center gap-3">
        <button type="button" onClick={onDown} aria-label={`Fewer ${what}`} className={btn}>
          −
        </button>
        <strong className="min-w-24 text-center text-2xl" aria-live="polite">
          {value}
        </strong>
        <button type="button" onClick={onUp} aria-label={`More ${what}`} className={btn}>
          +
        </button>
      </div>
    </div>
  );
}
