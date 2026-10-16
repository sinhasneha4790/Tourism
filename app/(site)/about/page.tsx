import type { Metadata } from 'next';
import Link from 'next/link';
import { Users, Leaf, ShieldCheck, Route } from 'lucide-react';
import { STATES } from '@/content/states';
import { PACKAGES } from '@/content/packages';
import { SITE } from '@/content/site';
import { SectionHeading } from '@/components/ui/Section';
import { Scene } from '@/components/ui/Scene';

export const metadata: Metadata = {
  title: 'About Mistrail',
  description: 'Mistrail is a Guwahati-based private travel company running small-group trips and homestay stays across all eight Northeast Indian states.',
  alternates: { canonical: '/about' },
};

const VALUES = [
  { icon: Users, title: 'Local first', body: 'Our drivers, guides and hosts live in the valleys we travel through. More of your money stays with them.' },
  { icon: Route, title: 'Honest routes', body: 'Hill roads are slow. We plan fewer stops per day and tell you the real drive times up front.' },
  { icon: ShieldCheck, title: 'Permits handled', body: 'We check ILP, PAP and RAP rules for your exact route and apply for you once you book.' },
  { icon: Leaf, title: 'Light footprint', body: 'Small groups, plastic-light trips and respect for village rules, festivals and sacred sites.' },
];

const STEPS = [
  { n: '01', title: 'Tell us your dates', body: 'Send an enquiry from any package or the cost planner, or just message us.' },
  { n: '02', title: 'Get a firm quote', body: 'Within one working day we reply with availability, a route and a price.' },
  { n: '03', title: 'We sort the permits', body: 'Send us your ID details and we apply for every permit your route needs.' },
  { n: '04', title: 'Travel with locals', body: 'Your driver and hosts meet you at the start hub and stay in touch throughout.' },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      <section className="container-site grid gap-10 py-12 md:py-16 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div className="flex flex-col gap-5">
          <span className="eyebrow text-terracotta">About us</span>
          <h1 className="text-[clamp(40px,7vw,72px)] font-extrabold leading-none tracking-[-0.035em]">
            We grew up <span className="accent">in these hills.</span>
          </h1>
          <p className="text-lg leading-relaxed text-ink-2">
            Mistrail is a private travel company based in {SITE.city}. We run curated trips across all eight Northeast states — from the root bridges of
            Meghalaya to the monasteries of Tawang — and connect travellers with homestays and local guides.
          </p>
          <p className="text-ink-3">
            We are not a government body. For permits we link to each state’s official portal, and we apply on your behalf when you book.
          </p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
          <Scene image={{ scene: 'village', alt: 'Illustration of a ridge-top village at sunset', tint: ['#F3C9B4', '#2E4A50'] }} />
        </div>
      </section>

      <section aria-label="Mistrail in numbers" className="bg-night text-white">
        <dl className="container-site grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
          {[
            [String(STATES.length), 'states covered'],
            [String(PACKAGES.length), 'signature trips'],
            ['1 day', 'reply time on enquiries'],
            ['100%', 'local drivers & hosts'],
          ].map(([v, k]) => (
            <div key={k} className="flex flex-col-reverse gap-1">
              <dt className="text-sm text-night-muted">{k}</dt>
              <dd className="text-4xl font-extrabold tracking-tight text-peach">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="values" className="container-site flex flex-col gap-8 py-16">
        <SectionHeading id="values" eyebrow="How we travel" title="What we" accent="stand for" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex flex-col gap-3 rounded-[20px] border border-line-soft bg-card p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-soft text-teal">
                <Icon size={20} aria-hidden="true" />
              </span>
              <h3 className="text-lg font-extrabold">{title}</h3>
              <p className="text-sm leading-relaxed text-ink-2">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="how" className="container-site flex flex-col gap-8 pb-20">
        <SectionHeading id="how" eyebrow="Booking with us" title="How it" accent="works" />
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <li key={s.n} className="flex flex-col gap-2 rounded-[20px] bg-teal-soft p-6">
              <span className="font-serif text-4xl italic text-terracotta">{s.n}</span>
              <h3 className="text-lg font-extrabold">{s.title}</h3>
              <p className="text-sm leading-relaxed text-ink-2">{s.body}</p>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-3">
          <Link href="/packages" className="flex h-12 items-center rounded-full bg-teal px-6 font-extrabold text-white">
            Browse packages
          </Link>
          <Link href="/contact" className="flex h-12 items-center rounded-full border border-line bg-card px-6 font-bold">
            Talk to us
          </Link>
        </div>
      </section>
    </div>
  );
}
