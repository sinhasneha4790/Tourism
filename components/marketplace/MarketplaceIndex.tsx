import Link from 'next/link';
import { Suspense } from 'react';
import { getApprovedListings } from '@/lib/listings';
import { SectionHeading } from '@/components/ui/Section';
import { ListingBrowser, ListingGrid } from './ListingBrowser';

const COPY = {
  stay: {
    eyebrow: 'Homestays',
    title: 'Stay with',
    accent: 'local hosts.',
    intro: 'Bamboo houses, tea-garden bungalows and village homes, each reviewed by the Mistrail team.',
    unit: 'night',
    empty: 'Our first homestays are being reviewed right now.',
  },
  experience: {
    eyebrow: 'Experiences',
    title: 'Go with someone',
    accent: 'who knows the way.',
    intro: 'Village walks, root-bridge treks, weaving workshops and food trails led by local guides.',
    unit: 'person',
    empty: 'Our first local experiences are being reviewed right now.',
  },
} as const;

export async function MarketplaceIndex({ type }: { type: 'stay' | 'experience' }) {
  const items = await getApprovedListings(type);
  const c = COPY[type];
  return (
    <div className="container-site flex flex-col gap-10 py-12 md:py-16">
      <SectionHeading as="h1" eyebrow={c.eyebrow} title={c.title} accent={c.accent} intro={c.intro} />
      {items.length === 0 ? (
        <div className="flex flex-col items-start gap-4 rounded-[28px] border border-dashed border-line p-8 md:p-10">
          <p className="text-xl font-extrabold">{c.empty}</p>
          <p className="text-ink-2">Until they go live, our curated packages include hand-picked homestays — or tell us what you’re looking for.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/packages" className="flex h-12 items-center rounded-full bg-teal px-6 font-extrabold text-white">
              Browse packages
            </Link>
            <Link href="/host" className="flex h-12 items-center rounded-full border border-line bg-card px-6 font-bold">
              Are you a host? List with us
            </Link>
          </div>
        </div>
      ) : (
        <Suspense fallback={<ListingGrid items={items} />}>
          <ListingBrowser items={items} unit={c.unit} />
        </Suspense>
      )}
    </div>
  );
}
