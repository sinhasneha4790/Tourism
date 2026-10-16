import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { eq } from 'drizzle-orm';
import { requireHost } from '@/lib/dal';
import { requireDb } from '@/lib/db';
import { listings } from '@/lib/db/schema';
import { canEditListing, canSubmitForReview } from '@/lib/permissions';
import { PHOTO_MAX_COUNT } from '@/lib/validators';
import { submitListing } from '@/app/marketplace-actions';
import { ListingForm } from '@/components/marketplace/ListingForm';
import { PhotoManager } from '@/components/marketplace/PhotoManager';
import { StatusChip } from '@/components/marketplace/StatusChip';

export const metadata: Metadata = { title: 'Edit listing', robots: { index: false, follow: false } };

async function Editor({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await requireHost(`/host/listings/${id}`);
  const [listing] = await requireDb().select().from(listings).where(eq(listings.id, id));
  if (!listing || !canEditListing(user, listing)) notFound();

  const publicPath = `/${listing.type === 'stay' ? 'stays' : 'experiences'}/${listing.slug}`;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center gap-3">
        <StatusChip status={listing.status} />
        <h1 className="w-full text-[clamp(30px,4.5vw,46px)] font-extrabold leading-tight tracking-[-0.03em]">{listing.title}</h1>
      </div>

      {sp.created && <p className="rounded-2xl bg-teal-soft p-4 font-semibold text-teal">Draft created. Add photos, then submit it for review.</p>}
      {sp.submitted && (
        <p className="rounded-2xl bg-teal-soft p-4 font-semibold text-teal">Submitted. We usually review new listings within two working days.</p>
      )}
      {listing.status === 'rejected' && listing.rejectionReason && (
        <div role="alert" className="rounded-2xl border border-terracotta/40 bg-amber-bg p-4 text-amber-ink">
          <p className="font-extrabold">Changes requested by Mistrail</p>
          <p>{listing.rejectionReason}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 rounded-[20px] bg-night p-5 text-white">
        {listing.status === 'approved' && (
          <Link href={publicPath} className="flex h-11 items-center rounded-full bg-peach px-5 font-extrabold text-night">
            View live listing
          </Link>
        )}
        {canSubmitForReview(listing.status) ? (
          <form action={submitListing}>
            <input type="hidden" name="id" value={listing.id} />
            <button type="submit" className="h-11 rounded-full bg-peach px-5 font-extrabold text-night">
              Submit for review
            </button>
          </form>
        ) : (
          listing.status === 'pending' && <p className="text-night-soft">In review — we’ll email you when it’s live.</p>
        )}
        <p className="text-sm text-night-muted">Editing a live listing sends it back for a quick review before changes appear.</p>
      </div>

      <section aria-labelledby="photos" className="flex flex-col gap-4 rounded-[28px] border border-line-soft bg-card p-6 md:p-8">
        <h2 id="photos" className="text-2xl font-extrabold">
          Photos
        </h2>
        <PhotoManager listingId={listing.id} photos={listing.photos} uploadsEnabled={Boolean(process.env.BLOB_READ_WRITE_TOKEN)} max={PHOTO_MAX_COUNT} />
      </section>

      <section aria-labelledby="details" className="flex flex-col gap-4 rounded-[28px] border border-line-soft bg-card p-6 md:p-8">
        <h2 id="details" className="text-2xl font-extrabold">
          Details
        </h2>
        <ListingForm
          defaults={{
            id: listing.id,
            type: listing.type,
            title: listing.title,
            state: listing.state,
            location: listing.location,
            description: listing.description,
            amenities: listing.amenities,
            basePriceInr: listing.basePriceInr,
            priceUnit: listing.priceUnit,
            maxGuests: listing.maxGuests,
            cancellationPolicy: listing.cancellationPolicy,
            lat: listing.lat,
            lng: listing.lng,
          }}
        />
      </section>
    </div>
  );
}

export default function EditListingPage({ params, searchParams }: PageProps<'/host/listings/[id]'>) {
  return (
    <div className="container-site flex max-w-4xl flex-col gap-6 py-12 md:py-16">
      <Link href="/host/dashboard" className="text-sm font-bold text-teal">
        ← Host dashboard
      </Link>
      <Suspense fallback={<div className="h-96 rounded-[28px] border border-line-soft bg-card" />}>
        <Editor params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
