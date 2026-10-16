import { ogCard, OG_SIZE } from '@/components/og/OgCard';

export const alt = 'Mistrail — Into the Northeast';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function OpengraphImage() {
  return ogCard({
    eyebrow: 'Tours · permits · trip planning',
    title: 'India’s eight Northeast states, sorted.',
    subtitle: 'Assam · Meghalaya · Arunachal · Nagaland · Manipur · Mizoram · Tripura · Sikkim',
  });
}
