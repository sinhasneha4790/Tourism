import type { Metadata } from 'next';
import { STATES } from '@/content/states';
import { StateCard } from '@/components/cards';
import { SectionHeading } from '@/components/ui/Section';

export const metadata: Metadata = {
  title: 'The eight states — Northeast India travel guides',
  description:
    'Travel guides to Assam, Meghalaya, Arunachal Pradesh, Nagaland, Manipur, Mizoram, Tripura and Sikkim: when to go, how to reach and what to see.',
  alternates: { canonical: '/states' },
};

export default function StatesPage() {
  return (
    <div className="container-site flex flex-col gap-10 py-12 md:py-16">
      <SectionHeading
        as="h1"
        eyebrow="Destinations"
        title="Eight states,"
        accent="eight worlds."
        intro="Each state has its own languages, food, festivals and permit rules. Start with a guide, then build your route."
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STATES.map((s) => (
          <StateCard key={s.slug} state={s} headingLevel="h2" />
        ))}
      </div>
    </div>
  );
}
