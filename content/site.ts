/** Brand and contact details. Contact values are placeholders until the owner supplies them. */
export const SITE = {
  name: 'Mistrail',
  tagline: 'Into the Northeast',
  description:
    'Mistrail is a private travel company for India’s eight Northeast states — curated tour packages, homestays, state guides, permit help and a trip budget planner.',
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000'),
  city: 'Guwahati, Assam',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || '',
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '',
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '',
  alert: {
    label: 'Travel note',
    text: 'Permit rules change often — check the permit guide before you travel. Best season: October to April.',
    href: '/permits',
    linkText: 'Permit guide →',
  },
};

export const NAV = [
  { href: '/states', label: 'Destinations' },
  { href: '/packages', label: 'Tour packages' },
  { href: '/stays', label: 'Homestays' },
  { href: '/experiences', label: 'Experiences' },
  { href: '/festivals', label: 'Festivals' },
  { href: '/permits', label: 'Permits' },
] as const;
