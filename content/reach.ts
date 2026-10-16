import type { ReachInfo } from '@/types/content';

export const REACH_LAST_REVIEWED = '2026-10-15';

export const REACH: ReachInfo[] = [
  {
    title: 'Fly into Guwahati',
    body: 'The main gateway, linked by air and rail to major Indian cities. Other airports: Bagdogra (for Sikkim), Dimapur, Imphal, Agartala, Shillong and Itanagar.',
    verified: false,
  },
  {
    title: 'Private cab or shared taxi',
    body: 'Hill roads are slow — plan fewer places per day. Shared Sumos run between most towns and leave when full, usually early morning.',
    verified: false,
  },
  {
    title: 'Helicopter services',
    body: 'Some routes (for example Guwahati–Tawang) have limited helicopter services that are weather dependent and often booked out. Check before relying on one.',
    verified: false,
  },
  {
    title: 'Monsoon precautions',
    body: 'June to September brings landslides and road closures, especially in Sikkim and Arunachal. Keep a buffer day and travel insurance.',
    verified: false,
  },
];

export const ESSENTIALS: { title: string; body: string }[] = [
  {
    title: 'Money',
    body: 'Carry cash for villages and remote areas; ATMs thin out beyond towns.',
  },
  {
    title: 'Mobile network',
    body: 'Patchy in high passes and remote valleys. Download offline maps.',
  },
  {
    title: 'Health',
    body: 'Altitude above 3,000 m in Tawang and North Sikkim — acclimatise slowly.',
  },
  {
    title: 'Packing',
    body: 'Rain shell year-round, layers for the hills, grippy shoes for treks.',
  },
  {
    title: 'Etiquette',
    body: 'Ask before photographing people; dress modestly at monasteries.',
  },
  {
    title: 'Carry ID',
    body: 'Keep printed permits and photo ID handy for checkposts.',
  },
];

export const ETIQUETTE: { title: string; body: string }[] = [
  {
    title: 'Photography',
    body: 'Ask before photographing people, rituals and inside monasteries. Some festival grounds charge a camera fee.',
  },
  {
    title: 'Plastic-free sites',
    body: 'Several villages and protected areas ban single-use plastic. Carry a bottle and a cloth bag.',
  },
  {
    title: 'Homestay etiquette',
    body: 'Remove shoes indoors, eat what the family eats, and ask before entering kitchens or prayer rooms.',
  },
  {
    title: 'Sacred places',
    body: 'Walk clockwise around stupas and prayer wheels, and don’t touch ritual objects.',
  },
];
