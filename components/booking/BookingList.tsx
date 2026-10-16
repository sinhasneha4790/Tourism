import Link from 'next/link';
import { formatInr } from '@/lib/format';

export interface BookingRow {
  ref: string;
  status: 'enquiry' | 'pending_payment' | 'confirmed' | 'cancelled' | 'refunded';
  startDate: string;
  endDate: string;
  guests: number;
  amountInr: number;
  title: string | null;
  guestName?: string;
  hostPayoutInr?: number;
}

const LABEL: Record<BookingRow['status'], [string, string]> = {
  enquiry: ['Enquiry', 'bg-line-soft text-ink-2'],
  pending_payment: ['Awaiting payment', 'bg-amber-bg text-amber-ink'],
  confirmed: ['Confirmed', 'bg-forest text-white'],
  cancelled: ['Cancelled', 'bg-terracotta text-white'],
  refunded: ['Refunded', 'bg-ink-2 text-white'],
};

export function BookingStatus({ status }: { status: BookingRow['status'] }) {
  const [label, cls] = LABEL[status];
  return <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-extrabold ${cls}`}>{label}</span>;
}

/** Bookings for a traveller (amount paid) or a host (guest name and payout). */
export function BookingList({ rows, view, empty }: { rows: BookingRow[]; view: 'traveller' | 'host'; empty: string }) {
  if (!rows.length) return <p className="text-ink-3">{empty}</p>;
  return (
    <ul className="grid gap-3">
      {rows.map((b) => (
        <li key={b.ref}>
          <Link
            href={`/bookings/${b.ref}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-line-soft bg-card p-5 hover:border-sage"
          >
            <span className="flex flex-col gap-1">
              <BookingStatus status={b.status} />
              <strong className="text-lg">{b.title ?? 'Booking'}</strong>
              <span className="text-sm text-ink-3">
                {b.ref} · {b.startDate}
                {b.endDate > b.startDate ? ` → ${b.endDate}` : ''} · {b.guests} {b.guests === 1 ? 'guest' : 'guests'}
                {view === 'host' && b.guestName ? ` · ${b.guestName}` : ''}
              </span>
            </span>
            <span className="text-right">
              <span className="block font-extrabold">{formatInr(view === 'host' ? (b.hostPayoutInr ?? 0) : b.amountInr)}</span>
              <span className="text-xs text-ink-3">{view === 'host' ? 'your payout' : 'total'}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
