import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SectionHeading } from '@/components/ui/Section';
import { PackageFilters, PackageListFallback } from '@/components/packages/PackageFilters';

export const metadata: Metadata = {
  title: 'Tour packages — curated Northeast India trips',
  description: 'Mistrail’s curated tours across Assam, Meghalaya, Arunachal, Nagaland and Sikkim. Filter by trip length, state and interest.',
  alternates: { canonical: '/packages' },
};

export default function PackagesPage() {
  return (
    <div className="container-site flex flex-col gap-10 py-12 md:py-16">
      <SectionHeading
        as="h1"
        eyebrow="Tour packages"
        title="Trips we know"
        accent="by heart."
        intro="Every package runs with our own drivers and local hosts. Prices are per person on twin share and confirmed when you enquire."
      />
      <Suspense fallback={<PackageListFallback />}>
        <PackageFilters />
      </Suspense>
    </div>
  );
}
