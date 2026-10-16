import { ogCard, OG_SIZE } from '@/components/og/OgCard';
import { PACKAGES, getPackage } from '@/content/packages';
import { stateName } from '@/content/states';
import { formatInr } from '@/lib/format';

export const alt = 'Mistrail tour package';
export const size = OG_SIZE;
export const contentType = 'image/png';

export function generateStaticParams() {
  return PACKAGES.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const pkg = getPackage((await params).slug);
  if (!pkg) return ogCard({ eyebrow: 'Tour packages', title: 'Mistrail trips', subtitle: 'Northeast India' });
  return ogCard({
    eyebrow: `${pkg.days} days · ${pkg.states.map(stateName).join(' · ')}`,
    title: pkg.title,
    subtitle: `From ${formatInr(pkg.fromPriceInr)} per person · starts in ${pkg.startHub}`,
  });
}
