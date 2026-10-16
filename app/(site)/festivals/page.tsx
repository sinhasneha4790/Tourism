import type { Metadata } from 'next';
import { Suspense } from 'react';
import { FESTIVALS } from '@/content/festivals';
import { ETIQUETTE } from '@/content/reach';
import { stateName } from '@/content/states';
import { SITE } from '@/content/site';
import { SectionHeading } from '@/components/ui/Section';
import { FestivalCard } from '@/components/cards';
import { FestivalBrowser } from '@/components/festivals/FestivalBrowser';
import { orderFestivals } from '@/lib/festival-filter';
import { JsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Festival calendar — Northeast India festivals by month',
  description: 'Hornbill, Bihu, Losar, Wangala, Sangai and more: a month-by-month calendar of festivals across the eight Northeast states.',
  alternates: { canonical: '/festivals' },
};

export default function FestivalsPage() {
  return (
    <div className="container-site flex flex-col gap-12 py-12 md:py-16">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': FESTIVALS.filter((f) => f.startDate).map((f) => ({
            '@type': 'Event',
            name: f.name,
            description: f.description,
            startDate: f.startDate,
            endDate: f.endDate ?? f.startDate,
            eventStatus: 'https://schema.org/EventScheduled',
            eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
            location: {
              '@type': 'Place',
              name: stateName(f.state),
              address: {
                '@type': 'PostalAddress',
                addressRegion: stateName(f.state),
                addressCountry: 'IN',
              },
            },
            url: `${SITE.url}/festivals?month=${f.month}`,
          })),
        }}
      />
      <SectionHeading
        as="h1"
        eyebrow="Festival calendar"
        title="Time your trip to a"
        accent="festival."
        intro="Many dates follow lunar or community calendars and are confirmed only weeks ahead. ‘Dates TBC’ means we haven’t confirmed this year’s dates yet."
      />
      <Suspense
        fallback={
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {orderFestivals(FESTIVALS, null, 1).map((f) => (
              <FestivalCard key={f.slug} festival={f} headingLevel="h2" />
            ))}
          </div>
        }
      >
        <FestivalBrowser />
      </Suspense>

      <section aria-labelledby="etiquette" className="flex flex-col gap-6 rounded-[28px] bg-teal-soft p-7 md:p-10">
        <h2 id="etiquette" className="text-[clamp(28px,4vw,40px)] font-extrabold tracking-tight">
          Etiquette &amp; <span className="accent">responsible travel</span>
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ETIQUETTE.map((e) => (
            <div key={e.title} className="rounded-[20px] bg-card p-5">
              <h3 className="font-extrabold">{e.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-2">{e.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
