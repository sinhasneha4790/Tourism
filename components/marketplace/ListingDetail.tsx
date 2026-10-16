import Link from 'next/link';
import { Check, MapPin, Users, ShieldCheck } from 'lucide-react';
import type { PublicListing } from '@/lib/listings';
import type { StateSlug } from '@/types/content';
import { stateName } from '@/content/states';
import { SITE } from '@/content/site';
import { formatInr } from '@/lib/format';
import { Picture } from '@/components/ui/Picture';
import { Chip } from '@/components/ui/Section';
import { RatingSummary } from '@/components/ui/Stars';
import type { PublicReview } from '@/lib/listings';
import { ReviewList } from './ReviewList';
import { JsonLd } from '@/components/JsonLd';
import { EnquiryForm } from '@/components/forms/EnquiryForm';
import { BookingWidget } from '@/components/booking/BookingWidget';
import { POLICY_SUMMARY } from '@/content/policies';
import { listingHref, listingImage } from './ListingCard';

export function ListingDetail({ listing: l, bookingOpen, reviews = [] }: { listing: PublicListing; bookingOpen: boolean; reviews?: PublicReview[] }) {
  const isStay = l.type === 'stay';
  const state = stateName(l.state as StateSlug);
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': isStay ? 'LodgingBusiness' : 'TouristTrip',
          name: l.title,
          description: l.description,
          url: `${SITE.url}${listingHref(l)}`,
          image: l.photos.map((p) => p.url),
          address: { '@type': 'PostalAddress', addressLocality: l.location, addressRegion: state, addressCountry: 'IN' },
          offers: { '@type': 'Offer', price: l.basePriceInr, priceCurrency: 'INR' },
          ...(l.rating && l.reviewCount
            ? {
                aggregateRating: { '@type': 'AggregateRating', ratingValue: l.rating, reviewCount: l.reviewCount, bestRating: 5, worstRating: 1 },
                review: reviews.slice(0, 5).map((r) => ({
                  '@type': 'Review',
                  author: { '@type': 'Person', name: r.authorName },
                  reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
                  reviewBody: r.text,
                  datePublished: r.createdAt.toISOString().slice(0, 10),
                })),
              }
            : {}),
        }}
      />
      <div className="container-site flex flex-col gap-8 py-10 md:py-14">
        <nav aria-label="Breadcrumb" className="text-sm text-ink-3">
          <Link href={isStay ? '/stays' : '/experiences'} className="hover:underline">
            {isStay ? 'Homestays' : 'Experiences'}
          </Link>{' '}
          / {l.title}
        </nav>
        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <Chip tone="terracotta">{state}</Chip>
            <Chip>{isStay ? 'Homestay' : 'Experience'}</Chip>
          </div>
          <h1 className="text-[clamp(34px,5.5vw,58px)] font-extrabold leading-[1.02] tracking-[-0.03em]">{l.title}</h1>
          <p className="flex flex-wrap items-center gap-4 text-ink-3">
            <span className="flex items-center gap-1.5">
              <MapPin size={16} aria-hidden="true" /> {l.location}, {state}
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={16} aria-hidden="true" /> Up to {l.maxGuests} guests
            </span>
            <RatingSummary rating={l.rating} count={l.reviewCount} className="text-ink" />
          </p>
        </header>

        <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
          <div className="relative aspect-[16/10] overflow-hidden rounded-[24px]">
            <Picture image={listingImage(l, 0)} sizes="(min-width:768px) 66vw, 100vw" priority />
          </div>
          {l.photos.length > 1 && (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
              {l.photos.slice(1, 3).map((_, i) => (
                <div key={i} className="relative aspect-[16/10] overflow-hidden rounded-[24px]">
                  <Picture image={listingImage(l, i + 1)} sizes="(min-width:768px) 33vw, 50vw" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start">
          <div className="flex flex-col gap-8">
            <section aria-labelledby="about" className="flex flex-col gap-3">
              <h2 id="about" className="text-2xl font-extrabold">
                About this {isStay ? 'stay' : 'experience'}
              </h2>
              <p className="whitespace-pre-line leading-relaxed text-ink-2">{l.description}</p>
              <p className="text-sm text-ink-3">Hosted by {l.hostName}</p>
            </section>
            <ReviewList reviews={reviews} hostName={l.hostName} />
            {l.amenities.length > 0 && (
              <section aria-labelledby="amenities" className="flex flex-col gap-3">
                <h2 id="amenities" className="text-2xl font-extrabold">
                  {isStay ? 'Amenities' : 'What’s included'}
                </h2>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {l.amenities.map((a) => (
                    <li key={a} className="flex gap-2 text-ink-2">
                      <Check size={18} className="mt-0.5 shrink-0 text-forest" aria-hidden="true" /> {a}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <section aria-labelledby="policy" className="rounded-[20px] bg-amber-bg p-5 text-amber-ink">
              <h2 id="policy" className="mb-1 flex items-center gap-2 font-extrabold">
                <ShieldCheck size={18} aria-hidden="true" /> Cancellation
              </h2>
              <p className="text-sm">{POLICY_SUMMARY[l.cancellationPolicy]}</p>
            </section>
            <section aria-labelledby="enquire" className="flex flex-col gap-4 rounded-[28px] border border-line-soft bg-card p-6 md:p-8">
              <h2 id="enquire" className="text-2xl font-extrabold">
                {bookingOpen ? 'Questions before you book?' : 'Ask about dates'}
              </h2>
              <p className="text-ink-2">
                {bookingOpen
                  ? `Ask ${l.hostName} anything — we usually reply within a day.`
                  : `Online booking opens soon. Send your dates and we’ll confirm availability with ${l.hostName}.`}
              </p>
              <EnquiryForm kind="listing" listingId={l.id} refLabel={l.title} />
            </section>
          </div>
          <aside aria-label="Book" className="flex flex-col gap-3 rounded-[28px] bg-night p-7 text-white lg:sticky lg:top-28">
            {bookingOpen ? (
              <BookingWidget
                listingId={l.id}
                title={l.title}
                type={l.type}
                priceUnit={l.priceUnit}
                basePriceInr={l.basePriceInr}
                maxGuests={l.maxGuests}
                policy={POLICY_SUMMARY[l.cancellationPolicy]}
              />
            ) : (
              <>
                <span className="eyebrow text-peach">From</span>
                <p className="text-5xl font-extrabold tracking-tight">{formatInr(l.basePriceInr)}</p>
                <p className="text-night-muted">per {l.priceUnit}</p>
                <a href="#enquire" className="flex h-13 items-center justify-center rounded-full bg-peach font-extrabold text-night">
                  Ask about dates
                </a>
              </>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
