import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { requireHost } from '@/lib/dal';
import { ListingForm } from '@/components/marketplace/ListingForm';

export const metadata: Metadata = { title: 'New listing', robots: { index: false, follow: false } };

async function NewListing() {
  await requireHost('/host/listings/new');
  return <ListingForm />;
}

export default function NewListingPage() {
  return (
    <div className="container-site flex max-w-4xl flex-col gap-6 py-12 md:py-16">
      <Link href="/host/dashboard" className="text-sm font-bold text-teal">
        ← Host dashboard
      </Link>
      <h1 className="text-[clamp(34px,5vw,52px)] font-extrabold leading-none tracking-[-0.03em]">
        New <span className="accent">listing</span>
      </h1>
      <p className="text-ink-2">Save a draft first, then add photos and submit it for review.</p>
      <div className="rounded-[28px] border border-line-soft bg-card p-6 md:p-8">
        <Suspense fallback={<div className="h-96" />}>
          <NewListing />
        </Suspense>
      </div>
    </div>
  );
}
