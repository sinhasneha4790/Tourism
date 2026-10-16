'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { X } from 'lucide-react';
import { SITE } from '@/content/site';

const KEY = `mistrail:alert-dismissed:${SITE.alert.text.length}`;
const listeners = new Set<() => void>();

function readDismissed(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Dismissible travel note. Dismissal is remembered in localStorage. */
export function AnnouncementBar() {
  // Server and first client render show the bar; it hides after hydration if dismissed.
  const dismissed = useSyncExternalStore(subscribe, readDismissed, () => false);
  if (dismissed) return null;

  function dismiss() {
    try {
      localStorage.setItem(KEY, '1');
    } catch {
      /* storage blocked — hide for this view only */
    }
    listeners.forEach((l) => l());
  }

  return (
    <div role="region" aria-label="Travel note" className="no-print border-b border-amber-line bg-amber-bg">
      <div className="container-site flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5 text-sm text-amber-ink">
        <strong className="rounded-full bg-amber px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide text-white">{SITE.alert.label}</strong>
        <span className="min-w-0 flex-[1_1_16rem]">{SITE.alert.text}</span>
        <Link href={SITE.alert.href} className="font-extrabold underline-offset-2 hover:underline">
          {SITE.alert.linkText}
        </Link>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss travel note"
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-amber-line"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
