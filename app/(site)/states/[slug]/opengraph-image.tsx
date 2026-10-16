import { ogCard, OG_SIZE } from '@/components/og/OgCard';
import { STATES, getState } from '@/content/states';

export const alt = 'Mistrail state travel guide';
export const size = OG_SIZE;
export const contentType = 'image/png';

export function generateStaticParams() {
  return STATES.map((s) => ({ slug: s.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const state = getState((await params).slug);
  if (!state) return ogCard({ eyebrow: 'State guides', title: 'Northeast India', subtitle: 'Eight states' });
  return ogCard({
    eyebrow: 'Travel guide',
    title: state.name,
    subtitle: `${state.tagline} · best ${state.bestTime}`,
  });
}
