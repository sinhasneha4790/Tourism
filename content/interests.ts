import type { ImageRef, Interest } from '@/types/content';

export const INTERESTS: {
  id: Interest;
  label: string;
  tile: string;
  image: ImageRef;
}[] = [
  {
    id: 'wildlife',
    label: 'Wildlife',
    tile: 'Wildlife & safaris',
    image: {
      scene: 'forest',
      alt: 'Illustration of grassland and forest',
      tint: ['#F3D9B4', '#2F6B5E'],
    },
  },
  {
    id: 'spiritual',
    label: 'Monasteries & temples',
    tile: 'Monasteries',
    image: {
      scene: 'monastery',
      alt: 'Illustration of a mountain monastery',
      tint: ['#E6EEF0', '#2E4A50'],
    },
  },
  {
    id: 'trekking',
    label: 'Treks & root bridges',
    tile: 'Root bridges & treks',
    image: {
      scene: 'hills',
      alt: 'Illustration of misty hills',
      tint: ['#DCE3E0', '#2F6B5E'],
    },
  },
  {
    id: 'culture',
    label: 'Tribal heritage & culture',
    tile: 'Tribal heritage',
    image: {
      scene: 'village',
      alt: 'Illustration of a hill village',
      tint: ['#F3C9B4', '#B5462E'],
    },
  },
  {
    id: 'tea',
    label: 'Tea & river islands',
    tile: 'Tea & river islands',
    image: {
      scene: 'tea',
      alt: 'Illustration of tea gardens',
      tint: ['#E6EEF0', '#3E7A6B'],
    },
  },
];

export function interestLabel(id: Interest): string {
  return INTERESTS.find((i) => i.id === id)?.label ?? id;
}
