import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { REACH, ESSENTIALS } from '@/content/reach';
import { SectionHeading, LastVerified } from '@/components/ui/Section';
import { PermitChecker, PermitCheckerFallback } from '@/components/permits/PermitChecker';
import { SeasonGrid } from '@/components/permits/SeasonGrid';

export const metadata: Metadata = {
  title: 'Permits & planning — ILP, PAP and RAP checker',
  description:
    'Check which Inner Line, Protected Area or Restricted Area permits you need for each Northeast state, plus the best time to visit and how to get there.',
  alternates: { canonical: '/permits' },
};

const JUMP = [
  { href: '#permits', label: 'Permit checker' },
  { href: '/plan', label: 'Cost calculator' },
  { href: '#season', label: 'Best time to visit' },
  { href: '#reach', label: 'Getting there' },
  { href: '#essentials', label: 'Essentials & packing' },
];

export default function PermitsPage() {
  return (
    <div className="container-site flex flex-col gap-16 pb-24 pt-12 md:gap-[72px]">
      <section className="flex max-w-[900px] flex-col gap-4">
        <span className="eyebrow text-terracotta">Plan your trip</span>
        <h1 className="text-[clamp(40px,7vw,76px)] font-extrabold leading-none tracking-[-0.035em]">
          Permits, seasons, <span className="accent">sorted.</span>
        </h1>
        <p className="text-[17px] leading-relaxed text-ink-2 md:text-[19px]">
          Everything you need to know before you go. Book any Mistrail package and we apply for your permits for you.
        </p>
        <nav aria-label="On this page" className="flex flex-wrap gap-2 text-sm font-bold">
          {JUMP.map((j) => (
            <Link key={j.href} href={j.href} className="rounded-full border border-line bg-card px-4 py-2.5 hover:border-sage">
              {j.label}
            </Link>
          ))}
        </nav>
      </section>

      <section id="permits" aria-label="Permit checker">
        <Suspense fallback={<PermitCheckerFallback />}>
          <PermitChecker />
        </Suspense>
      </section>

      <section id="season" aria-labelledby="season-title" className="flex flex-col gap-5">
        <SectionHeading id="season-title" title="Best time to" accent="visit" />
        <SeasonGrid />
      </section>

      <section id="reach" aria-labelledby="reach-title" className="flex flex-col gap-5">
        <SectionHeading id="reach-title" title="Getting there & around" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {REACH.map((r) => (
            <div key={r.title} className="flex flex-col gap-2 rounded-[20px] border border-line-soft bg-card p-6">
              <h3 className="text-[19px] font-bold">{r.title}</h3>
              <p className="leading-relaxed text-ink-2">{r.body}</p>
            </div>
          ))}
        </div>
        <LastVerified verified={false} />
      </section>

      <section id="essentials" aria-labelledby="ess-title" className="flex flex-col gap-5">
        <SectionHeading id="ess-title" title="Essentials" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ESSENTIALS.map((e) => (
            <div key={e.title} className="flex flex-col gap-1.5 rounded-[20px] bg-teal-soft p-5">
              <h3 className="text-[17px] font-bold">{e.title}</h3>
              <p className="text-[15px] leading-relaxed text-ink-2">{e.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
