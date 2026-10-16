'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { STATES } from '@/content/states';
import { INTERESTS } from '@/content/interests';

/** State → state guide; interest → filtered packages; both → filtered packages. */
export function heroFilterHref(state: string, interest: string): string {
  if (state && interest) return `/packages?state=${state}&interest=${interest}`;
  if (state) return `/states/${state}`;
  if (interest) return `/packages?interest=${interest}`;
  return '/packages';
}

export function HeroFilter() {
  const router = useRouter();
  const [state, setState] = useState('');
  const [interest, setInterest] = useState('');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(heroFilterHref(state, interest));
      }}
      className="grid w-full max-w-3xl gap-2 rounded-[24px] border border-white/30 bg-white/85 p-2 text-ink shadow-xl backdrop-blur-md sm:grid-cols-[1fr_1fr_auto]"
    >
      <label className="flex flex-col rounded-2xl px-4 py-2 hover:bg-white">
        <span className="text-xs font-extrabold uppercase tracking-wider text-ink-3">State</span>
        <select value={state} onChange={(e) => setState(e.target.value)} className="bg-transparent py-1 font-bold outline-none">
          <option value="">All eight states</option>
          {STATES.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col rounded-2xl px-4 py-2 hover:bg-white">
        <span className="text-xs font-extrabold uppercase tracking-wider text-ink-3">Interest</span>
        <select value={interest} onChange={(e) => setInterest(e.target.value)} className="bg-transparent py-1 font-bold outline-none">
          <option value="">Anything</option>
          {INTERESTS.map((i) => (
            <option key={i.id} value={i.id}>
              {i.label}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-teal px-7 font-extrabold text-white hover:brightness-125">
        <Search size={18} aria-hidden="true" />
        Explore
      </button>
    </form>
  );
}
