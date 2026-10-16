import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getApprovedListing, getPublishedReviews, listingStaticParams } from '@/lib/listings';
import { ListingDetail } from '@/components/marketplace/ListingDetail';
import { paymentsEnabled } from '@/lib/razorpay';

export function generateStaticParams() {
  return listingStaticParams('stay');
}

export async function generateMetadata({ params }: PageProps<'/stays/[slug]'>): Promise<Metadata> {
  const listing = await getApprovedListing('stay', (await params).slug);
  if (!listing) return { title: 'Not found', robots: { index: false } };
  return {
    title: listing.title,
    description: listing.description.slice(0, 155),
    alternates: { canonical: '/stays/' + listing.slug },
    openGraph: { title: listing.title, description: listing.description.slice(0, 155), images: listing.photos.slice(0, 1).map((p) => p.url) },
  };
}

export default async function Page({ params }: PageProps<'/stays/[slug]'>) {
  const listing = await getApprovedListing('stay', (await params).slug);
  if (!listing) notFound();
  const reviews = await getPublishedReviews(listing.id);
  return <ListingDetail listing={listing} bookingOpen={paymentsEnabled()} reviews={reviews} />;
}
