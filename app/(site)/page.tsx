import Link from 'next/link';
import { BadgeCheck, Leaf, Home as HomeIcon, ShieldCheck } from 'lucide-react';
import { STATES } from '@/content/states';
import { PACKAGES } from '@/content/packages';
import { FESTIVALS } from '@/content/festivals';
import { INTERESTS } from '@/content/interests';
import { SITE } from '@/content/site';
import { nextFestival } from '@/lib/dates';
import { StateCard, PackageCard } from '@/components/cards';
import { SectionHeading } from '@/components/ui/Section';
import { Scene } from '@/components/ui/Scene';
import { Picture } from '@/components/ui/Picture';
import { HeroFilter } from '@/components/home/HeroFilter';
import { FestivalSpotlight } from '@/components/home/FestivalSpotlight';
import { JsonLd } from '@/components/JsonLd';
import { StaysRow } from '@/components/marketplace/StaysRow';

async function buildTimeNextFestival() {
  'use cache';
  return nextFestival(FESTIVALS, Date.now());
}

const TRUST = [
  {
    icon: ShieldCheck,
    title: 'Permit help, online',
    body: 'We check ILP, PAP and RAP rules for your route and apply for you.',
  },
  {
    icon: Leaf,
    title: 'Sustainable travel',
    body: 'Small groups, plastic-light trips and money that stays in the valley.',
  },
  {
    icon: HomeIcon,
    title: 'Local hosts',
    body: 'Homestays and guides from the communities you visit.',
  },
];

export default async function HomePage() {
  const spotlight = await buildTimeNextFestival();
  const featured = PACKAGES.filter((p) => p.featured).slice(0, 3);

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'TravelAgency',
          name: 'Mistrail',
          slogan: 'Into the Northeast',
          description: SITE.description,
          url: SITE.url,
          areaServed: STATES.map((s) => s.name),
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Guwahati',
            addressRegion: 'Assam',
            addressCountry: 'IN',
          },
        }}
      />

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-night">
        <div className="absolute inset-0 -z-10">
          <Scene image={{ scene: 'hills', alt: '', tint: ['#F3C9B4', '#2E4A50'] }} label={false} priority />
          <div className="absolute inset-0 bg-gradient-to-b from-[rgb(23_34_28/0.55)] via-[rgb(46_74_80/0.65)] to-[rgb(23_34_28/0.9)]" />
        </div>
        <div className="container-site flex min-h-[640px] flex-col justify-center gap-7 py-20 text-white md:min-h-[700px]">
          <span className="w-fit rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur motion-safe:animate-pulse">
            Eight states · one trail
          </span>
          <h1 className="max-w-4xl text-[clamp(40px,7.5vw,84px)] font-extrabold leading-[0.98] tracking-[-0.035em]">
            Into the Northeast, <span className="font-serif font-normal italic text-peach">sorted.</span>
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-night-soft md:text-xl">
            Root bridges, Himalayan monasteries, rhinos and river islands. Curated trips across Assam, Meghalaya, Arunachal, Nagaland, Manipur, Mizoram, Tripura
            and Sikkim — permits handled.
          </p>
          <HeroFilter />
        </div>
      </section>

      <div className="container-site flex flex-col gap-20 py-16 md:gap-24 md:py-20">
        {/* Trust row */}
        <ul className="grid gap-4 md:grid-cols-3" aria-label="Why travel with Mistrail">
          {TRUST.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex gap-4 rounded-[20px] border border-line-soft bg-card p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-soft text-teal">
                <Icon size={20} aria-hidden="true" />
              </span>
              <span>
                <strong className="flex items-center gap-1.5 font-extrabold">
                  <BadgeCheck size={16} className="text-forest" aria-hidden="true" /> {title}
                </strong>
                <span className="text-sm leading-relaxed text-ink-2">{body}</span>
              </span>
            </li>
          ))}
        </ul>

        {/* State grid */}
        <section aria-labelledby="states-title" className="flex flex-col gap-8">
          <SectionHeading
            id="states-title"
            eyebrow="The eight states"
            title="Where do you want to"
            accent="wander?"
            action={{ href: '/states', label: 'All state guides' }}
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STATES.map((s) => (
              <StateCard key={s.slug} state={s} />
            ))}
          </div>
        </section>

        {/* Experiences strip */}
        <section aria-labelledby="exp-title" className="flex flex-col gap-8">
          <SectionHeading id="exp-title" eyebrow="Experiences" title="Travel by what you" accent="love" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {INTERESTS.map((i) => (
              <Link
                key={i.id}
                href={`/packages?interest=${i.id}`}
                className="group relative flex aspect-[3/4] items-end overflow-hidden rounded-[20px] shadow-sm transition-shadow hover:shadow-xl"
              >
                <Picture image={i.image} sizes="(min-width:768px) 20vw, 50vw" className="group-hover:scale-110" />
                <span className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/20 to-transparent" />
                <span className="relative p-4 text-lg font-extrabold leading-tight text-white">
                  {i.tile}
                  <span className="block text-sm font-semibold text-night-soft">See trips →</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured packages */}
        <section aria-labelledby="pkg-title" className="flex flex-col gap-8">
          <SectionHeading
            id="pkg-title"
            eyebrow="Mistrail packages"
            title="Trips we run"
            accent="every season"
            intro="Fixed routes with local drivers and hosts. Every package is enquiry-first — we confirm dates, permits and price with you."
            action={{ href: '/packages', label: 'All packages' }}
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <PackageCard key={p.slug} pkg={p} />
            ))}
          </div>
        </section>

        <FestivalSpotlight initial={spotlight} />

        <StaysRow
          title={
            <>
              Stay with <span className="accent">local hosts</span>
            </>
          }
        />

        {/* Permit banner */}
        <section
          aria-labelledby="permit-banner"
          className="flex flex-col items-start gap-5 rounded-[28px] border border-amber-line bg-amber-bg p-7 md:flex-row md:items-center md:justify-between md:p-10"
        >
          <div className="flex max-w-2xl flex-col gap-2">
            <span className="eyebrow text-amber-ink">Before you book</span>
            <h2 id="permit-banner" className="text-[clamp(26px,3.5vw,36px)] font-extrabold leading-tight tracking-tight text-ink">
              Arunachal, Nagaland, Manipur and Mizoram need an Inner Line Permit.
            </h2>
            <p className="text-ink-2">Foreign nationals need protected-area permits in several states. Check what applies to your route in under a minute.</p>
          </div>
          <Link href="/permits" className="flex h-13 shrink-0 items-center gap-2 rounded-full bg-amber px-7 font-extrabold text-white hover:brightness-110">
            <ShieldCheck size={18} aria-hidden="true" />
            Check my permits
          </Link>
        </section>
      </div>
    </>
  );
}
