import { Star } from 'lucide-react';

/** Read-only star rating. Announced to screen readers as "4.5 out of 5 stars". */
export function Stars({ value, size = 16, className = '' }: { value: number; size?: number; className?: string }) {
  return (
    <span role="img" aria-label={`${value} out of 5 stars`} className={`inline-flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} aria-hidden="true" className={i <= Math.round(value) ? 'fill-amber text-amber' : 'text-line'} />
      ))}
    </span>
  );
}

export function RatingSummary({ rating, count, className = '' }: { rating: number | null; count: number; className?: string }) {
  if (!rating || !count) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-bold ${className}`}>
      <Stars value={rating} size={14} />
      {rating.toFixed(1)} · {count} {count === 1 ? 'review' : 'reviews'}
    </span>
  );
}
