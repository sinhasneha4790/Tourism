import type { Festival } from '@/types/content';

/**
 * With a month: only that month's festivals.
 * Without: every festival, ordered from `fromMonth` onward and wrapping round the year.
 */
export function orderFestivals(festivals: Festival[], month: number | null, fromMonth: number): Festival[] {
  if (month) return festivals.filter((f) => f.month === month).sort(byDate);
  const rank = (m: number) => (m - fromMonth + 12) % 12;
  return [...festivals].sort((a, b) => rank(a.month) - rank(b.month) || byDate(a, b));
}

function byDate(a: Festival, b: Festival) {
  return (a.startDate ?? '9').slice(5).localeCompare((b.startDate ?? '9').slice(5));
}
