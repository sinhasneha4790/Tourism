import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, MessageCircle, Phone, MapPin } from 'lucide-react';
import { SITE } from '@/content/site';
import { mailtoHref, telHref, whatsappHref } from '@/lib/contact';
import { SectionHeading } from '@/components/ui/Section';
import { EnquiryForm } from '@/components/forms/EnquiryForm';
import { JsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Contact & FAQ',
  description: 'Talk to Mistrail about a Northeast India trip: send an enquiry, message us on WhatsApp, or read answers to common questions.',
  alternates: { canonical: '/contact' },
};

const FAQ = [
  {
    q: 'How quickly will you reply?',
    a: 'Within one working day, usually sooner. On WhatsApp we often reply within a few hours during Indian business hours.',
  },
  {
    q: 'Do you arrange permits?',
    a: 'Yes. When you book a package we apply for every ILP, PAP or RAP your route needs. You send us the documents; we do the rest.',
  },
  {
    q: 'Can you plan a custom route?',
    a: 'Yes. Tell us your dates, interests and budget in the form and we’ll suggest a route — or adapt one of our packages.',
  },
  { q: 'When should I book?', a: 'Two to three months ahead for October–December and festival weeks such as Hornbill; a few weeks ahead at other times.' },
  {
    q: 'Is Mistrail a government website?',
    a: 'No. Mistrail is a private travel company. We link to official state portals for permits, and always recommend checking rules there.',
  },
];

export default function ContactPage() {
  const channels = [
    { icon: MessageCircle, label: 'WhatsApp', value: SITE.whatsapp, href: whatsappHref('Hi Mistrail, I’d like help planning a trip.') },
    { icon: Phone, label: 'Phone', value: SITE.phone, href: telHref() },
    { icon: Mail, label: 'Email', value: SITE.email, href: mailtoHref() },
  ].filter((c) => c.href);

  return (
    <div className="container-site flex flex-col gap-16 py-12 md:py-16">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        }}
      />
      <SectionHeading
        as="h1"
        eyebrow="Contact"
        title="Let’s plan your"
        accent="trail."
        intro="Tell us where and when you’d like to go. A real person in Guwahati will reply within one working day."
      />

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <section aria-labelledby="form-title" className="flex flex-col gap-4 rounded-[28px] border border-line-soft bg-card p-6 md:p-8">
          <h2 id="form-title" className="text-2xl font-extrabold">
            Send us a message
          </h2>
          <EnquiryForm kind="contact" refLabel="Contact page" showTrip={false} messageLabel="Your message" />
        </section>

        <aside className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-[28px] bg-night p-6 text-white md:p-8">
            <span className="eyebrow text-peach">Other ways to reach us</span>
            {channels.map(({ icon: Icon, label, value, href }) => (
              <a
                key={label}
                href={href!}
                {...(label === 'WhatsApp' ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="flex items-center gap-3 rounded-2xl bg-white/[0.08] p-4 hover:bg-white/[0.14]"
              >
                <Icon size={20} aria-hidden="true" className="text-peach" />
                <span className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-wider text-night-muted">{label}</span>
                  <span className="font-bold">{value}</span>
                </span>
              </a>
            ))}
            {channels.length === 0 && <p className="text-night-soft">Use the form — we read every message.</p>}
            <p className="flex items-center gap-3 rounded-2xl bg-white/[0.08] p-4">
              <MapPin size={20} aria-hidden="true" className="text-peach" />
              <span className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wider text-night-muted">Based in</span>
                <span className="font-bold">{SITE.city}</span>
              </span>
            </p>
          </div>
          <p className="rounded-[20px] bg-amber-bg p-5 text-sm text-amber-ink">
            Mistrail is a private travel company, not a government office. For permit applications without a booking, use the{' '}
            <Link href="/permits" className="font-bold underline">
              official portals listed in our permit guide
            </Link>
            .
          </p>
        </aside>
      </div>

      <section aria-labelledby="faq" className="flex flex-col gap-4">
        <h2 id="faq" className="text-[clamp(28px,4vw,40px)] font-extrabold tracking-tight">
          Common <span className="accent">questions</span>
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {FAQ.map((f) => (
            <details key={f.q} className="rounded-2xl border border-line-soft bg-card p-5">
              <summary className="cursor-pointer font-bold">{f.q}</summary>
              <p className="mt-2 leading-relaxed text-ink-2">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
