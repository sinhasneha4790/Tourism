const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});
const num = new Intl.NumberFormat('en-IN');

export function formatInr(amount: number): string {
  return inr.format(amount);
}

export function formatNumber(n: number): string {
  return num.format(n);
}

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3));

/** Formats an ISO yyyy-mm-dd date for display in Asia/Kolkata. */
export function formatDate(
  iso: string,
  opts: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  },
): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    ...opts,
  }).format(new Date(`${iso}T00:00:00+05:30`));
}

export function formatDateRange(start?: string, end?: string): string {
  if (!start) return 'Dates TBC';
  if (!end || end === start) return formatDate(start);
  return `${formatDate(start, { day: 'numeric', month: 'short' })} – ${formatDate(end)}`;
}
