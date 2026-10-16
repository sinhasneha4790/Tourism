import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Plane, Languages, Landmark, CalendarRange, Clock, MapPin, ShieldCheck } from 'lucide-react';
import { STATES, getState } from '@/content/states';
import { PACKAGES } from '@/content/packages';
import { FESTIVALS } from '@/content/festivals';
import { headlinePermit } from '@/content/permits';
import { PackageCard, FestivalCard } from '@/components/cards';
import { Picture } from '@/components/ui/Picture';
import { Chip, LastVerified } from '@/components/ui/Section';
import { JsonLd } from '@/components/JsonLd';
import { StaysRow } from '@/components/marketplace/StaysRow';
import { SITE } from '@/content/site';

export function generateStaticParams() {
  return STATES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<'/states/[slug]'>): Promise<Metadata> {
  const state = getState((await params).slug);
  if (!state) return {};
  return {
    title: state.seo.title,
    description: state.seo.description,
    alternates: { canonical: `/states/${state.slug}` },
    openGraph: { title: state.seo.title, description: state.seo.description },
  };
}

export default async function StatePage({ params }: PageProps<'/states/[slug]'>) {
  const state = getState((await params).slug);
  if (!state) notFound();

  const packages = PACKAGES.filter((p) => p.states.includes(state.slug));
  const festivals = FESTIVALS.filter((f) => f.state === state.slug);
  const permitIn = headlinePermit(state.slug, 'indian');
  const permitFx = headlinePermit(state.slug, 'foreign');

  const facts = [
    { icon: Landmark, label: 'Capital', value: state.capital },
    { icon: CalendarRange, label: 'Best time', value: state.bestTime },
    {
      icon: Plane,
      label: 'Nearest airports',
      value: state.airports.join(' · '),
    },
    { icon: Languages, label: 'Languages', value: state.languages.join(', ') },
  ];

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'TouristDestination',
          name: state.name,
          description: state.description,
          url: `${SITE.url}/states/${state.slug}`,
          containedInPlace: { '@type': 'Country', name: 'India' },
          includesAttraction: state.attractions.map((a) => ({
            '@type': 'TouristAttraction',
            name: a.name,
            address: a.location,
          })),
        }}
      />

      {/* State tab strip */}
      <nav aria-label="States" className="border-b border-line bg-card">
        <ul className="container-site flex gap-1 overflow-x-auto py-2">
          {STATES.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/states/${s.slug}`}
                aria-current={s.slug === state.slug ? 'page' : undefined}
                className={`block whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold ${s.slug === state.slug ? 'bg-teal text-white' : 'text-ink-2 hover:bg-teal-soft'}`}
              >
                {s.shortName}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="container-site flex flex-col gap-16 py-12 md:py-16">
        <header className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div className="flex flex-col gap-4">
            <Chip>{state.tagline}</Chip>
            <h1 className="text-[clamp(38px,6vw,68px)] font-extrabold leading-none tracking-[-0.035em]">
              {state.name} <span className="accent">travel guide</span>
            </h1>
            <p className="text-lg leading-relaxed text-ink-2">{state.description}</p>
            {state.bestTimeNote && <p className="rounded-2xl bg-amber-bg p-4 text-sm text-amber-ink">{state.bestTimeNote}</p>}
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
            <Picture image={state.cover} sizes="(min-width:1024px) 45vw, 100vw" priority />
          </div>
        </header>

        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col gap-1 rounded-[20px] border border-line-soft bg-card p-5">
              <dt className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-ink-3">
                <Icon size={15} aria-hidden="true" /> {label}
              </dt>
              <dd className="font-bold leading-snug">{value}</dd>
            </div>
          ))}
        </dl>

        <section aria-labelledby="places" className="flex flex-col gap-6">
          <h2 id="places" className="text-[clamp(28px,4vw,40px)] font-extrabold tracking-tight">
            Top places in {state.name}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {state.attractions.map((a) => (
              <article key={a.name} className="overflow-hidden rounded-[20px] border border-line-soft bg-card">
                <div className="relative aspect-[4/3]">
                  <Picture image={a.image} sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw" />
                </div>
                <div className="flex flex-col gap-2 p-5">
                  <h3 className="text-lg font-extrabold">{a.name}</h3>
                  <p className="flex items-center gap-1.5 text-sm text-ink-3">
                    <MapPin size={14} aria-hidden="true" /> {a.location}
                  </p>
                  <span className="flex w-fit items-center gap-1.5 rounded-full bg-teal-soft px-3 py-1 text-xs font-extrabold text-teal">
                    <Clock size={13} aria-hidden="true" /> {a.timeNeeded}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="grid gap-5 md:grid-cols-2">
          <section aria-labelledby="food" className="rounded-[24px] bg-amber-bg p-7">
            <h2 id="food" className="mb-3 text-2xl font-extrabold">
              What to eat
            </h2>
            <ul className="flex flex-wrap gap-2">
              {state.food.map((f) => (
                <li key={f} className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-amber-ink">
                  {f}
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="crafts" className="rounded-[24px] bg-teal-soft p-7">
            <h2 id="crafts" className="mb-3 text-2xl font-extrabold">
              Crafts to look for
            </h2>
            <ul className="flex flex-wrap gap-2">
              {state.crafts.map((c) => (
                <li key={c} className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-teal">
                  {c}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section aria-labelledby="permit" className="flex flex-col gap-4 rounded-[24px] bg-teal p-7 text-white md:p-9">
          <h2 id="permit" className="flex items-center gap-2 text-2xl font-extrabold">
            <ShieldCheck aria-hidden="true" /> Permits for {state.name}
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              ['Indian citizens', permitIn],
              ['Foreign nationals', permitFx],
            ].map(([who, rule]) =>
              rule && typeof rule === 'object' ? (
                <div key={String(who)} className="rounded-2xl bg-white/10 p-4">
                  <p className="text-sm font-bold text-peach-soft">{String(who)}</p>
                  <p className="font-extrabold">{rule.required ? rule.permitType : 'No entry permit'}</p>
                  <p className="text-sm text-night-soft">{rule.notes}</p>
                </div>
              ) : null,
            )}
          </div>
          <p className="text-xs text-night-soft">Unverified — always confirm on the official state portal before travel.</p>
          <Link href={`/permits?state=${state.slug}`} className="flex h-12 w-fit items-center rounded-full bg-white px-6 font-extrabold text-ink">
            Full permit details for {state.name} →
          </Link>
        </section>

        <section aria-labelledby="pkgs" className="flex flex-col gap-6">
          <h2 id="pkgs" className="text-[clamp(28px,4vw,40px)] font-extrabold tracking-tight">
            Packages in {state.name}
          </h2>
          {packages.length ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {packages.map((p) => (
                <PackageCard key={p.slug} pkg={p} />
              ))}
            </div>
          ) : (
            <p className="text-ink-2">
              No fixed package here yet —{' '}
              <Link href="/packages" className="font-bold text-teal underline">
                browse all packages
              </Link>{' '}
              or ask us for a custom route.
            </p>
          )}
        </section>

        {festivals.length > 0 && (
          <section aria-labelledby="fests" className="flex flex-col gap-6">
            <h2 id="fests" className="text-[clamp(28px,4vw,40px)] font-extrabold tracking-tight">
              Festivals in {state.name}
            </h2>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {festivals.map((f) => (
                <FestivalCard key={f.slug} festival={f} />
              ))}
            </div>
          </section>
        )}

        <StaysRow state={state.slug} title={`Stays in ${state.name}`} emptyHint />

        <LastVerified verified={false} />
      </div>
    </>
  );
}
