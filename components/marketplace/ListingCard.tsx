import Link from 'next/link';
import { MapPin, Users } from 'lucide-react';
import type { PublicListing } from '@/lib/listings';
import type { ImageRef, StateSlug } from '@/types/content';
import { stateName } from '@/content/states';
import { formatInr } from '@/lib/format';
import { Picture } from '@/components/ui/Picture';
import { Chip } from '@/components/ui/Section';

export function listingImage(l: Pick<PublicListing, 'photos' | 'title' | 'type'>, index = 0): ImageRef {
  const photo = l.photos[index];
  return photo
    ? { src: photo.url, alt: photo.alt, scene: 'village' }
    : { alt: `Illustration for ${l.title}`, scene: l.type === 'stay' ? 'village' : 'hills', tint: ['#F3C9B4', '#2E4A50'] };
}

export function listingHref(l: Pick<PublicListing, 'type' | 'slug'>) {
  return `/${l.type === 'stay' ? 'stays' : 'experiences'}/${l.slug}`;
}

export function ListingCard({ listing: l, headingLevel = 'h3' }: { listing: PublicListing; headingLevel?: 'h2' | 'h3' }) {
  const H = headingLevel;
  return (
    <Link
      href={listingHref(l)}
      className="group flex flex-col overflow-hidden rounded-[20px] border border-line-soft bg-card shadow-sm transition-shadow duration-300 hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Picture image={listingImage(l)} sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw" className="group-hover:scale-105" />
        <span className="absolute left-3 top-3">
          <Chip tone="terracotta">{stateName(l.state as StateSlug)}</Chip>
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <H className="text-lg font-extrabold leading-snug">{l.title}</H>
        <p className="flex items-center gap-1.5 text-sm text-ink-3">
          <MapPin size={14} aria-hidden="true" /> {l.location}
        </p>
        <p className="flex items-center gap-1.5 text-sm text-ink-3">
          <Users size={14} aria-hidden="true" /> Up to {l.maxGuests} guests · hosted by {l.hostName}
        </p>
        <p className="mt-auto pt-2 text-sm text-ink-3">
          <strong className="text-lg text-ink">{formatInr(l.basePriceInr)}</strong> / {l.priceUnit}
        </p>
      </div>
    </Link>
  );
}
