import type { Festival } from '@/types/content';

const IST = '+05:30';

/** Start of the festival's first day, in IST. */
export function festivalStart(iso: string): number {
  return new Date(`${iso}T00:00:00${IST}`).getTime();
}

/** End of the festival's last day, in IST. */
export function festivalEnd(iso: string): number {
  return new Date(`${iso}T23:59:59${IST}`).getTime();
}

function shiftYear(iso: string, years: number): string {
  const [y, m, d] = iso.split('-');
  return `${Number(y) + years}-${m}-${d}`;
}

export interface Occurrence {
  festival: Festival;
  start: string;
  end: string;
}

/**
 * The next (or current) occurrence of a dated festival at `now`.
 * Recurring festivals roll forward a year at a time once they have ended.
 */
export function nextOccurrence(f: Festival, now: number): Occurrence | null {
  if (!f.startDate) return null;
  let start = f.startDate;
  let end = f.endDate ?? f.startDate;
  if (f.recurring) {
    let guard = 0;
    while (festivalEnd(end) < now && guard++ < 50) {
      start = shiftYear(start, 1);
      end = shiftYear(end, 1);
    }
  }
  if (festivalEnd(end) < now) return null;
  return { festival: f, start, end };
}

/** The festival that is on now, or the soonest upcoming one. */
export function nextFestival(festivals: Festival[], now: number): Occurrence | null {
  return (
    festivals
      .map((f) => nextOccurrence(f, now))
      .filter((o): o is Occurrence => o !== null)
      .sort((a, b) => festivalStart(a.start) - festivalStart(b.start))[0] ?? null
  );
}

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  live: boolean;
}

export function countdown(targetStart: string, targetEnd: string, now: number): Countdown {
  const diff = festivalStart(targetStart) - now;
  if (diff <= 0)
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      live: now <= festivalEnd(targetEnd),
    };
  const s = Math.floor(diff / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    live: false,
  };
}
