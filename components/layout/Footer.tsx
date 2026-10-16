import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { STATES } from '@/content/states';
import { SITE } from '@/content/site';
import { NewsletterForm } from './NewsletterForm';

async function CopyrightYear() {
  'use cache';
  // Computed at build time, as the spec asks.
  return <>{new Date().getFullYear()}</>;
}

const TRAVEL = [
  { href: '/packages', label: 'Tour packages' },
  { href: '/festivals', label: 'Festival calendar' },
  { href: '/permits', label: 'Permits (ILP / PAP / RAP)' },
  { href: '/plan', label: 'Trip cost planner' },
  { href: '/search', label: 'Search' },
];

export function Footer() {
  const whatsapp = SITE.whatsapp ? `https://wa.me/${SITE.whatsapp.replace(/\D/g, '')}` : null;
  return (
    <footer className="no-print bg-night text-night-text">
      <div className="container-site flex flex-col gap-10 pb-7 pt-14">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-night-line pb-9">
          <p className="max-w-xl text-3xl font-extrabold leading-tight tracking-[-0.02em] text-white md:text-[40px]">
            Get monthly trail notes, <span className="font-serif font-normal italic">festival dates</span> &amp; permit updates.
          </p>
          <NewsletterForm />
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3">
            <div className="text-[26px] font-extrabold tracking-[-0.02em] text-white">mistrail</div>
            <p className="text-sm leading-relaxed text-night-muted">
              Mistrail is a private travel company running tours and homestay trips across all eight states of Northeast India. We are not a government body —
              always check permits on the official state portals.
            </p>
            <p className="text-sm text-night-muted">
              {SITE.city}
              {SITE.email && ` · ${SITE.email}`}
              {SITE.phone && ` · ${SITE.phone}`}
            </p>
            {whatsapp && (
              <a href={whatsapp} className="flex h-11 w-fit items-center gap-2 rounded-full border border-night-line-2 px-4 text-sm font-bold hover:bg-night-2">
                <MessageCircle size={18} aria-hidden="true" />
                Chat on WhatsApp
              </a>
            )}
          </div>

          <nav aria-label="Eight states" className="flex flex-col gap-2.5 text-sm">
            <h2 className="eyebrow mb-1 text-xs text-peach">Eight states</h2>
            {STATES.map((s) => (
              <Link key={s.slug} href={`/states/${s.slug}`} className="hover:text-white hover:underline">
                {s.name}
              </Link>
            ))}
          </nav>

          <nav aria-label="Travel" className="flex flex-col gap-2.5 text-sm">
            <h2 className="eyebrow mb-1 text-xs text-peach">Travel</h2>
            {TRAVEL.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-white hover:underline">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-2.5 text-sm">
            <h2 className="eyebrow mb-1 text-xs text-peach">Talk to us</h2>
            <p className="leading-relaxed text-night-muted">
              Every package page has an enquiry form — tell us your dates and we’ll reply within one working day.
            </p>
            <Link href="/packages" className="hover:text-white hover:underline">
              Browse packages →
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-3 border-t border-night-line pt-5 text-[13px] text-night-muted">
          <div>
            © <CopyrightYear /> Mistrail. {SITE.city}.
          </div>
          <div>Private travel company · not affiliated with any government body</div>
        </div>
      </div>
    </footer>
  );
}
