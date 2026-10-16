import type { Metadata } from 'next';
import { getLegal } from '@/content/legal';
import { LegalPage } from '@/components/LegalPage';

const doc = getLegal('privacy');

export const metadata: Metadata = {
  title: doc.title,
  description: doc.summary,
  alternates: { canonical: '/privacy' },
};

export default function Page() {
  return <LegalPage doc={doc} />;
}
