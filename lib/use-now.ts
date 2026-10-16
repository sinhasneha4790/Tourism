'use client';

import { useSyncExternalStore } from 'react';

function subscribe(cb: () => void) {
  const id = setInterval(cb, 1000);
  return () => clearInterval(id);
}

const getSnapshot = () => Math.floor(Date.now() / 1000) * 1000;
const getServerSnapshot = () => null;

/**
 * Current time, ticking once a second. Returns null during server rendering and
 * hydration so time-dependent UI renders a stable placeholder first.
 */
export function useNow(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
