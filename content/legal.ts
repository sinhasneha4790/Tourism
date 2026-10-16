/**
 * Legal pages. These are DRAFTS written so the pages exist and link correctly.
 * The owner must have them reviewed and replaced with approved text, then set
 * `draft: false` and update `lastUpdated`. Values in [square brackets] are for
 * the owner to fill in.
 */
export interface LegalDoc {
  slug: 'terms' | 'privacy' | 'cancellation';
  title: string;
  summary: string;
  lastUpdated: string;
  draft: boolean;
  sections: { heading: string; body: string[] }[];
}

export const LEGAL: LegalDoc[] = [
  {
    slug: 'terms',
    title: 'Terms of use & booking',
    summary: 'The terms that apply when you use this website or book a trip with Mistrail.',
    lastUpdated: '2026-10-16',
    draft: true,
    sections: [
      {
        heading: 'Who we are',
        body: [
          'Mistrail (“we”, “us”) is a private travel company based in Guwahati, Assam. [Registered business name, address and registration numbers.] We are not a government body and are not affiliated with any state tourism department.',
        ],
      },
      {
        heading: 'Information on this website',
        body: [
          'Permit rules, fees, festival dates and travel conditions in Northeast India change often. We show the date each item was last checked, but you must confirm permits and entry rules on the official state portal before you travel.',
          'Prices shown on package pages and in the trip cost planner are indicative. A price is only confirmed when we send you a written quote.',
        ],
      },
      {
        heading: 'Enquiries and bookings',
        body: [
          'Sending an enquiry does not create a booking. A booking is confirmed only when we have sent written confirmation and received any deposit stated in your quote.',
          'You are responsible for giving accurate traveller details, including names as they appear on ID, for permit applications.',
        ],
      },
      {
        heading: 'Permits',
        body: [
          'Where a package includes permit processing, we apply on your behalf using the documents you provide. Permit decisions are made by the issuing authority; we cannot guarantee that a permit will be granted.',
        ],
      },
      {
        heading: 'Changes, delays and force majeure',
        body: [
          'Mountain roads close because of landslides, snow and local restrictions. We may reroute or reschedule parts of a trip for safety. We are not liable for costs caused by events outside our control, such as weather, road closures, strikes or government orders.',
        ],
      },
      {
        heading: 'Liability',
        body: ['[Liability limits, insurance requirements and governing law — to be supplied by the owner’s legal adviser.]'],
      },
      {
        heading: 'Contact',
        body: ['Questions about these terms: use the contact page.'],
      },
    ],
  },
  {
    slug: 'privacy',
    title: 'Privacy policy',
    summary: 'What personal data Mistrail collects, why, and the choices you have.',
    lastUpdated: '2026-10-16',
    draft: true,
    sections: [
      {
        heading: 'What we collect',
        body: [
          'When you send an enquiry or sign up for trail notes we collect the details you enter: name, email, phone or WhatsApp number, travel dates, number of travellers and your message.',
          'When you book, we also collect the details needed for permits and stays, such as ID documents, which we share only with the issuing authority and your hosts.',
          'We use privacy-friendly analytics (Vercel Web Analytics) that count page views without cookies and without identifying you.',
        ],
      },
      {
        heading: 'Why we use it',
        body: [
          'To reply to your enquiry, prepare quotes, arrange permits, stays and transport, and — if you opted in — send monthly trail notes. We do not sell your data.',
        ],
      },
      {
        heading: 'Who we share it with',
        body: [
          'Our email provider (Resend) to deliver messages; hosting provider (Vercel); permit-issuing authorities; and the hosts, drivers and guides on your trip, only as far as needed for your booking.',
        ],
      },
      {
        heading: 'How long we keep it',
        body: ['[Retention periods — to be confirmed by the owner, in line with the Digital Personal Data Protection Act, 2023.]'],
      },
      {
        heading: 'Your rights',
        body: [
          'You can ask us for a copy of your data, ask us to correct or delete it, or unsubscribe from trail notes at any time. Contact us through the contact page.',
        ],
      },
      {
        heading: 'Browser storage',
        body: ['We store one item in your browser’s local storage to remember that you dismissed the travel note banner. It contains no personal information.'],
      },
    ],
  },
  {
    slug: 'cancellation',
    title: 'Cancellation & refunds',
    summary: 'What happens if you cancel or change a Mistrail trip, or if we have to.',
    lastUpdated: '2026-10-16',
    draft: true,
    sections: [
      {
        heading: 'If you cancel a package',
        body: [
          'More than [30] days before departure: [full refund minus non-refundable permit and booking fees].',
          '[15–30] days before departure: [50%] of the trip price refunded.',
          'Less than [15] days before departure or no-show: [no refund].',
        ],
      },
      {
        heading: 'Changes to your dates',
        body: ['We will try to move your trip to new dates at no charge if you tell us at least [21] days ahead, subject to availability.'],
      },
      {
        heading: 'If we cancel',
        body: [
          'If we cancel for reasons within our control, you get a full refund. If a trip is cancelled or cut short by events outside our control (landslides, road closures, government orders), we refund unused services we can recover from our suppliers.',
        ],
      },
      {
        heading: 'Homestays and experiences',
        body: [
          'Marketplace listings will show their own cancellation policy (flexible, moderate or strict) before you book. [Policy text per level — owner to supply.]',
        ],
      },
      {
        heading: 'How refunds are paid',
        body: ['Refunds go back to the original payment method within [7–10] working days of approval.'],
      },
    ],
  },
];

export function getLegal(slug: LegalDoc['slug']): LegalDoc {
  const doc = LEGAL.find((d) => d.slug === slug);
  if (!doc) throw new Error(`Unknown legal page: ${slug}`);
  return doc;
}
