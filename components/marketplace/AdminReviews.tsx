import { desc, eq } from 'drizzle-orm';
import { requireDb } from '@/lib/db';
import { listings, reviews } from '@/lib/db/schema';
import { setReviewPublished } from '@/app/review-actions';
import { Stars } from '@/components/ui/Stars';

/** Latest reviews with a hide / show switch (reviews publish immediately). */
export async function AdminReviews() {
  const rows = await requireDb()
    .select({ r: reviews, title: listings.title })
    .from(reviews)
    .innerJoin(listings, eq(listings.id, reviews.listingId))
    .orderBy(desc(reviews.createdAt))
    .limit(30);
  return (
    <section aria-labelledby="admin-reviews" className="flex flex-col gap-4">
      <h2 id="admin-reviews" className="text-2xl font-extrabold">
        Reviews
      </h2>
      {rows.length === 0 ? (
        <p className="text-ink-3">No reviews yet.</p>
      ) : (
        <ul className="grid gap-3">
          {rows.map(({ r, title }) => (
            <li
              key={r.id}
              className={`flex flex-wrap items-start justify-between gap-3 rounded-[20px] border border-line-soft p-5 ${r.published ? 'bg-card' : 'bg-line-soft'}`}
            >
              <div className="flex max-w-3xl flex-col gap-1">
                <p className="flex flex-wrap items-center gap-2 text-sm text-ink-3">
                  <Stars value={r.rating} /> <strong className="text-ink">{r.authorName}</strong> · {title}
                </p>
                <p className="text-ink-2">{r.text}</p>
              </div>
              <form action={setReviewPublished}>
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="published" value={r.published ? 'false' : 'true'} />
                <button type="submit" className="h-10 rounded-full border border-line bg-card px-4 text-sm font-bold">
                  {r.published ? 'Hide review' : 'Show review'}
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
