import type { MetadataRoute } from 'next';
import { STATES } from '@/content/states';
import { PACKAGES } from '@/content/packages';
import { SITE } from '@/content/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['', '/states', '/packages', '/festivals', '/permits', '/plan'];
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
  ];
}
