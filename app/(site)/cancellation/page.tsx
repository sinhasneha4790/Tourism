import type { Metadata } from 'next';
import { getLegal } from '@/content/legal';
import { LegalPage } from '@/components/LegalPage';

const doc = getLegal('cancellation');

export const metadata: Metadata = {
  title: doc.title,
  description: doc.summary,
  alternates: { canonical: '/cancellation' },
};

export default function Page() {
  return <LegalPage doc={doc} />;
}
