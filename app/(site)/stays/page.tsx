import type { Metadata } from 'next';
import { MarketplaceIndex } from '@/components/marketplace/MarketplaceIndex';

export const metadata: Metadata = {
  title: 'Homestays in Northeast India',
  description: 'Homestays across the eight Northeast states, hosted by locals and reviewed by Mistrail. Filter by state, price and group size.',
  alternates: { canonical: '/stays' },
};

export default function Page() {
  return <MarketplaceIndex type="stay" />;
}
