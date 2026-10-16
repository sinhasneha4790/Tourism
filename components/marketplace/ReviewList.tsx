import type { PublicReview } from '@/lib/listings';
import { Stars } from '@/components/ui/Stars';

const month = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });

/** Published guest reviews with optional host replies. Renders nothing until there are reviews. */
export function ReviewList({ reviews, hostName }: { reviews: PublicReview[]; hostName: string }) {
  if (!reviews.length) return null;
  return (
    <section aria-labelledby="reviews" className="flex flex-col gap-4">
      <h2 id="reviews" className="text-2xl font-extrabold">
        Guest reviews
      </h2>
      <ul className="flex flex-col gap-3">
        {reviews.map((r) => (
          <li key={r.id} className="flex flex-col gap-2 rounded-[20px] border border-line-soft bg-card p-5">
            <div className="flex flex-wrap items-center gap-3">
              <Stars value={r.rating} />
              <strong>{r.authorName}</strong>
              <span className="text-sm text-ink-3">{month.format(r.createdAt)}</span>
            </div>
            <p className="whitespace-pre-line leading-relaxed text-ink-2">{r.text}</p>
            {r.hostReply && (
              <p className="rounded-2xl bg-teal-soft p-4 text-sm text-ink-2">
                <strong className="text-teal">Reply from {hostName}:</strong> {r.hostReply}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
