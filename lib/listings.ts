import 'server-only';
import { and, desc, eq } from 'drizzle-orm';
import { cacheLife, cacheTag } from 'next/cache';
import { db } from '@/lib/db';
import { hostProfiles, listings, reviews, type ListingPhoto } from '@/lib/db/schema';

export const LISTINGS_TAG = 'listings';

export interface PublicListing {
  id: string;
  slug: string;
  type: 'stay' | 'experience';
  title: string;
  state: string;
  location: string;
  description: string;
  amenities: string[];
  photos: ListingPhoto[];
  basePriceInr: number;
  priceUnit: 'night' | 'person' | 'group';
  maxGuests: number;
  cancellationPolicy: 'flexible' | 'moderate' | 'strict';
  rating: number | null;
  reviewCount: number;
  hostName: string;
}

const publicColumns = {
  id: listings.id,
  slug: listings.slug,
  type: listings.type,
  title: listings.title,
  state: listings.state,
  location: listings.location,
  description: listings.description,
  amenities: listings.amenities,
  photos: listings.photos,
  basePriceInr: listings.basePriceInr,
  priceUnit: listings.priceUnit,
  maxGuests: listings.maxGuests,
  cancellationPolicy: listings.cancellationPolicy,
  rating: listings.rating,
  reviewCount: listings.reviewCount,
  hostName: hostProfiles.displayName,
};

/** Approved listings, cached until a host or admin changes one (tag: listings). */
export async function getApprovedListings(type: 'stay' | 'experience'): Promise<PublicListing[]> {
  'use cache';
  cacheTag(LISTINGS_TAG);
  if (!db) return [];
  try {
    const rows = await db
      .select(publicColumns)
      .from(listings)
      .innerJoin(hostProfiles, eq(hostProfiles.userId, listings.hostId))
      .where(and(eq(listings.status, 'approved'), eq(listings.type, type)))
      .orderBy(desc(listings.approvedAt));
    cacheLife('hours');
    return rows;
  } catch (err) {
    console.error('[listings] query failed', err);
    cacheLife('seconds');
    return [];
  }
}

/**
 * One approved listing by slug. Queried per slug (not filtered from the cached list) so a
 * listing approved after the build is never answered from build-time data; tagged so that
 * approving, rejecting or editing any listing refreshes it.
 */
export async function getApprovedListing(type: 'stay' | 'experience', slug: string): Promise<PublicListing | null> {
  'use cache';
  cacheTag(LISTINGS_TAG, `listing:${slug}`);
  if (!db || slug === NO_LISTING_SLUG) return null;
  try {
    const [row] = await db
      .select(publicColumns)
      .from(listings)
      .innerJoin(hostProfiles, eq(hostProfiles.userId, listings.hostId))
      .where(and(eq(listings.status, 'approved'), eq(listings.type, type), eq(listings.slug, slug)));
    cacheLife('hours');
    return row ?? null;
  } catch (err) {
    console.error('[listings] query failed', err);
    cacheLife('seconds');
    return null;
  }
}

/**
 * generateStaticParams must return at least one entry under Cache Components.
 * When nothing is approved yet we return a placeholder slug that renders a 404.
 */
export const NO_LISTING_SLUG = '__none';

export async function listingStaticParams(type: 'stay' | 'experience') {
  const all = await getApprovedListings(type);
  return all.length ? all.map((l) => ({ slug: l.slug })) : [{ slug: NO_LISTING_SLUG }];
}

export interface PublicReview {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  hostReply: string | null;
  createdAt: Date;
}

/** Published reviews for a listing, newest first (tag: listings). */
export async function getPublishedReviews(listingId: string): Promise<PublicReview[]> {
  'use cache';
  cacheTag(LISTINGS_TAG, `reviews:${listingId}`);
  if (!db) return [];
  try {
    const rows = await db
      .select({
        id: reviews.id,
        authorName: reviews.authorName,
        rating: reviews.rating,
        text: reviews.text,
        hostReply: reviews.hostReply,
        createdAt: reviews.createdAt,
      })
      .from(reviews)
      .where(and(eq(reviews.listingId, listingId), eq(reviews.published, true)))
      .orderBy(desc(reviews.createdAt))
      .limit(50);
    cacheLife('hours');
    return rows;
  } catch (err) {
    console.error('[reviews] query failed', err);
    cacheLife('seconds');
    return [];
  }
}
