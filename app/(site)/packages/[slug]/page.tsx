import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check, X, Calculator, ShieldCheck, MessageCircle } from 'lucide-react';
import { whatsappHref } from '@/lib/contact';
import { PACKAGES, getPackage } from '@/content/packages';
import { stateName } from '@/content/states';
import { interestLabel } from '@/content/interests';
import { SITE } from '@/content/site';
import { formatInr, formatNumber, MONTHS_SHORT } from '@/lib/format';
import { Picture } from '@/components/ui/Picture';
import { Chip } from '@/components/ui/Section';
import { JsonLd } from '@/components/JsonLd';
import { EnquiryForm } from '@/components/forms/EnquiryForm';

export function generateStaticParams() {
  return PACKAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<'/packages/[slug]'>): Promise<Metadata> {
  const pkg = getPackage((await params).slug);
  if (!pkg) return {};
  const title = `${pkg.title} — ${pkg.days} days`;
  return {
    title,
    description: pkg.summary,
    alternates: { canonical: `/packages/${pkg.slug}` },
    openGraph: { title, description: pkg.summary },
  };
}

export default async function PackagePage({ params }: PageProps<'/packages/[slug]'>) {
  const pkg = getPackage((await params).slug);
  if (!pkg) notFound();

  const facts = [
    ['Duration', `${pkg.days} days / ${pkg.nights} nights`],
    ['Starts from', pkg.startHub],
    ['Vehicle', pkg.vehicle],
    ['Distance', `≈ ${formatNumber(pkg.distanceKm)} km`],
    ['Group size', pkg.groupSize ?? 'On request'],
    ['Best months', pkg.bestMonths.map((m) => MONTHS_SHORT[m - 1]).join(', ')],
  ];

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': ['TouristTrip', 'Product'],
          name: pkg.title,
          description: pkg.summary,
          url: `${SITE.url}/packages/${pkg.slug}`,
          touristType: pkg.interests.map(interestLabel),
          itinerary: {
            '@type': 'ItemList',
            itemListElement: pkg.itinerary.map((d) => ({
              '@type': 'ListItem',
              position: d.day,
              name: d.title,
              description: d.detail,
            })),
          },
          offers: {
            '@type': 'Offer',
            price: pkg.fromPriceInr,
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
            url: `${SITE.url}/packages/${pkg.slug}`,
            seller: { '@type': 'TravelAgency', name: 'Mistrail' },
          },
        }}
      />

      <section className="relative isolate overflow-hidden bg-night">
        <div className="absolute inset-0 -z-10 opacity-70">
          <Picture image={pkg.image} sizes="100vw" priority />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-night via-night/70 to-night/20" />
        <div className="container-site flex min-h-[420px] flex-col justify-end gap-4 pb-12 pt-24 text-white">
          <nav aria-label="Breadcrumb" className="text-sm text-night-soft">
            <Link href="/packages" className="hover:underline">
              Tour packages
            </Link>{' '}
            / {pkg.title}
          </nav>
          <div className="flex flex-wrap gap-1.5">
            {pkg.states.map((s) => (
              <Chip key={s} tone="terracotta">
                {stateName(s)}
              </Chip>
            ))}
            <Chip tone="light">
              {pkg.days} Days / {pkg.nights} Nights
            </Chip>
          </div>
          <h1 className="max-w-4xl text-[clamp(34px,5.5vw,60px)] font-extrabold leading-[1.02] tracking-[-0.03em]">{pkg.title}</h1>
          <p className="max-w-2xl text-lg text-night-soft">{pkg.summary}</p>
        </div>
      </section>

      <div className="container-site grid gap-10 py-12 lg:grid-cols-[1fr_380px] lg:items-start">
        <div className="flex flex-col gap-12">
          <dl className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {facts.map(([k, v]) => (
              <div key={k} className="rounded-[20px] border border-line-soft bg-card p-4">
                <dt className="text-xs font-extrabold uppercase tracking-wider text-ink-3">{k}</dt>
                <dd className="mt-1 font-bold">{v}</dd>
              </div>
            ))}
          </dl>

          <section aria-labelledby="itinerary" className="rounded-[28px] bg-night p-6 text-white md:p-9">
            <h2 id="itinerary" className="mb-6 text-3xl font-extrabold tracking-tight">
              Day by <span className="font-serif font-normal italic text-peach">day</span>
            </h2>
            <ol className="relative flex flex-col gap-7 border-l-2 border-night-line-2 pl-7">
              {pkg.itinerary.map((d) => (
                <li key={d.day} className="relative">
                  <span className="absolute -left-[37px] top-1 h-4 w-4 rounded-full bg-peach ring-4 ring-night" aria-hidden="true" />
                  <p className="text-xs font-extrabold uppercase tracking-wider text-peach">Day {d.day}</p>
                  <h3 className="text-lg font-extrabold">{d.title}</h3>
                  <p className="mt-1 text-night-soft">{d.detail}</p>
                  {(d.overnight || d.driveKm) && (
                    <p className="mt-2 text-sm text-night-muted">
                      {d.overnight && `Overnight: ${d.overnight}`}
                      {d.overnight && d.driveKm ? ' · ' : ''}
                      {d.driveKm ? `≈ ${d.driveKm} km drive` : ''}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </section>

          <div className="grid gap-5 md:grid-cols-2">
            <section aria-labelledby="inc" className="rounded-[24px] border border-line-soft bg-card p-6">
              <h2 id="inc" className="mb-3 text-xl font-extrabold">
                Included
              </h2>
              <ul className="flex flex-col gap-2">
                {pkg.inclusions.map((i) => (
                  <li key={i} className="flex gap-2 text-ink-2">
                    <Check size={18} className="mt-0.5 shrink-0 text-forest" aria-hidden="true" />
                    {i}
                  </li>
                ))}
              </ul>
            </section>
            <section aria-labelledby="exc" className="rounded-[24px] border border-line-soft bg-card p-6">
              <h2 id="exc" className="mb-3 text-xl font-extrabold">
                Not included
              </h2>
              <ul className="flex flex-col gap-2">
                {pkg.exclusions.map((i) => (
                  <li key={i} className="flex gap-2 text-ink-2">
                    <X size={18} className="mt-0.5 shrink-0 text-terracotta" aria-hidden="true" />
                    {i}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section aria-labelledby="permits" className="rounded-[24px] bg-amber-bg p-6">
            <h2 id="permits" className="mb-2 flex items-center gap-2 text-xl font-extrabold">
              <ShieldCheck size={20} aria-hidden="true" /> Permits
            </h2>
            {pkg.permitsNeeded.length ? (
              <p className="text-amber-ink">
                This route needs permits for{' '}
                {pkg.permitsNeeded.map((s, i) => (
                  <span key={s}>
                    {i > 0 && ', '}
                    <Link href={`/permits?state=${s}`} className="font-bold underline">
                      {stateName(s)}
                    </Link>
                  </span>
                ))}
                . We arrange them once you book.
              </p>
            ) : (
              <p className="text-amber-ink">No entry permits are needed for Indian citizens on this route. Foreign nationals: check the permit guide.</p>
            )}
          </section>

          {pkg.faqs && pkg.faqs.length > 0 && (
            <section aria-labelledby="faq" className="flex flex-col gap-3">
              <h2 id="faq" className="text-2xl font-extrabold">
                Questions
              </h2>
              {pkg.faqs.map((f) => (
                <details key={f.q} className="rounded-2xl border border-line-soft bg-card p-5">
                  <summary className="cursor-pointer font-bold">{f.q}</summary>
                  <p className="mt-2 text-ink-2">{f.a}</p>
                </details>
              ))}
            </section>
          )}

          <section aria-labelledby="enquire" className="flex flex-col gap-4 rounded-[28px] border border-line-soft bg-card p-6 md:p-8">
            <h2 id="enquire" className="text-2xl font-extrabold">
              Enquire about this trip
            </h2>
            <p className="text-ink-2">Tell us your dates. We reply within one working day with availability and a firm price.</p>
            <EnquiryForm kind="package" refLabel={pkg.title} />
          </section>
        </div>

        <aside className="flex flex-col gap-4 rounded-[28px] bg-night p-7 text-white lg:sticky lg:top-28">
          <span className="eyebrow text-peach">From</span>
          <p className="text-5xl font-extrabold tracking-tight">{formatInr(pkg.fromPriceInr)}</p>
          <p className="text-night-muted">per person, twin share · indicative until confirmed</p>
          <a href="#enquire" className="flex h-13 items-center justify-center rounded-full bg-peach font-extrabold text-night">
            Enquire now
          </a>
          <Link
            href={`/plan?days=${pkg.days}&package=${pkg.slug}`}
            className="flex h-13 items-center justify-center gap-2 rounded-full border border-night-line-2 font-bold hover:bg-night-2"
          >
            <Calculator size={18} aria-hidden="true" /> Estimate cost
          </Link>
          {whatsappHref(`Hi Mistrail, I’m interested in “${pkg.title}”.`) && (
            <a
              href={whatsappHref(`Hi Mistrail, I’m interested in “${pkg.title}”.`)!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-13 items-center justify-center gap-2 rounded-full border border-night-line-2 font-bold hover:bg-night-2"
            >
              <MessageCircle size={18} aria-hidden="true" /> Ask on WhatsApp
            </a>
          )}
          <p className="text-xs text-night-muted">Prices are placeholders while Mistrail confirms this season’s rates.</p>
        </aside>
      </div>
    </>
  );
}
