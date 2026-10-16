import type { Metadata } from 'next';
import { MarketplaceIndex } from '@/components/marketplace/MarketplaceIndex';

export const metadata: Metadata = {
  title: 'Experiences in Northeast India',
  description: 'Experiences across the eight Northeast states, hosted by locals and reviewed by Mistrail. Filter by state, price and group size.',
  alternates: { canonical: '/experiences' },
};

export default function Page() {
  return <MarketplaceIndex type="experience" />;
}
