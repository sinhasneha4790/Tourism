import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { SectionHeading } from '@/components/ui/Section';
import { BudgetPlanner, BudgetPlannerFromUrl } from '@/components/planner/BudgetPlanner';

export const metadata: Metadata = {
  title: 'Trip cost planner — what will my Northeast trip cost?',
  description: 'Estimate the cost of a Northeast India trip: days, travellers, stay type, transport, safaris and permit fees, with peak-season pricing.',
  alternates: { canonical: '/plan' },
};

export default function PlanPage() {
  return (
    <div className="container-site flex flex-col gap-8 pb-24 pt-12">
      <SectionHeading
        as="h1"
        eyebrow="Plan your trip"
        title="What will my trip"
        accent="cost?"
        intro="A quick estimate before you talk to us. Change anything and the total updates."
      />
      <Suspense fallback={<BudgetPlanner />}>
        <BudgetPlannerFromUrl />
      </Suspense>
      <p className="no-print text-sm text-ink-3">
        Need permits too?{' '}
        <Link href="/permits" className="font-bold text-teal underline">
          Check what your route needs
        </Link>
        .
      </p>
    </div>
  );
}
