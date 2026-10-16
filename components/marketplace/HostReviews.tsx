import { desc, inArray } from 'drizzle-orm';
import { requireDb } from '@/lib/db';
import { reviews } from '@/lib/db/schema';
import { replyToReview } from '@/app/review-actions';
import { Stars } from '@/components/ui/Stars';
import { textareaCls } from '@/components/forms/fields';

/** Recent reviews of a host's listings, each with a public reply form. */
export async function HostReviews({ listingTitles }: { listingTitles: Map<string, string> }) {
  const ids = [...listingTitles.keys()];
  const rows = ids.length ? await requireDb().select().from(reviews).where(inArray(reviews.listingId, ids)).orderBy(desc(reviews.createdAt)).limit(20) : [];
  return (
    <section aria-labelledby="host-reviews" className="flex flex-col gap-4">
      <h2 id="host-reviews" className="text-2xl font-extrabold">
        Reviews
      </h2>
      {rows.length === 0 ? (
        <p className="text-ink-3">Guests can review their stay once it’s over. Their reviews will appear here.</p>
      ) : (
        <ul className="grid gap-3">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-col gap-2 rounded-[20px] border border-line-soft bg-card p-5">
              <p className="flex flex-wrap items-center gap-3 text-sm text-ink-3">
                <Stars value={r.rating} /> <strong className="text-ink">{r.authorName}</strong> on {listingTitles.get(r.listingId)}
                {!r.published && <span className="font-bold text-terracotta">(hidden by Mistrail)</span>}
              </p>
              <p className="whitespace-pre-line text-ink-2">{r.text}</p>
              <form action={replyToReview} className="flex flex-col gap-2">
                <input type="hidden" name="id" value={r.id} />
                <label htmlFor={`reply-${r.id}`} className="text-sm font-bold text-ink-2">
                  {r.hostReply ? 'Your public reply' : 'Reply publicly (optional)'}
                </label>
                <textarea id={`reply-${r.id}`} name="reply" rows={2} defaultValue={r.hostReply ?? ''} maxLength={1000} className={textareaCls} />
                <button type="submit" className="h-10 w-fit rounded-full border border-teal px-5 text-sm font-bold text-teal">
                  Save reply
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
