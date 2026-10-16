import type { MetadataRoute } from 'next';
import { STATES } from '@/content/states';
import { PACKAGES } from '@/content/packages';
import { SITE } from '@/content/site';
import { getApprovedListings } from '@/lib/listings';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [stays, experiences] = await Promise.all([getApprovedListings('stay'), getApprovedListings('experience')]);
  const pages = [
    '',
    '/states',
    '/packages',
    '/festivals',
    '/permits',
    '/plan',
    '/about',
    '/contact',
    '/terms',
    '/privacy',
    '/cancellation',
    '/stays',
    '/experiences',
    '/host',
  ];
  return [
    ...pages.map((p) => ({
      url: `${SITE.url}${p}`,
      changeFrequency: 'weekly' as const,
      priority: p === '' ? 1 : 0.8,
    })),
    ...STATES.map((s) => ({
      url: `${SITE.url}/states/${s.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...PACKAGES.map((p) => ({
      url: `${SITE.url}/packages/${p.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...[...stays, ...experiences].map((l) => ({
      url: `${SITE.url}/${l.type === 'stay' ? 'stays' : 'experiences'}/${l.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ];
}
