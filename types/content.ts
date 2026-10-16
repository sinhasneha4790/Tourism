export type StateSlug = 'assam' | 'meghalaya' | 'arunachal-pradesh' | 'nagaland' | 'manipur' | 'mizoram' | 'tripura' | 'sikkim';

export type Interest = 'wildlife' | 'culture' | 'spiritual' | 'trekking' | 'tea';

/** Illustrated placeholder scenes, used until the owner supplies photography. */
export type SceneKind = 'hills' | 'river' | 'forest' | 'monastery' | 'lake' | 'tea' | 'village' | 'festival';

export interface ImageRef {
  /** Remote or /public path. Omit to render the illustrated scene instead. */
  src?: string;
  alt: string;
  credit?: string;
  scene: SceneKind;
  /** Hue pair for the illustrated scene: [sky, land]. */
  tint?: [string, string];
}

export interface Attraction {
  name: string;
  location: string;
  timeNeeded: string;
  image: ImageRef;
  interests: Interest[];
}

/** One letter per month Jan→Dec: b = best, g = good, m = monsoon / avoid. */
export type SeasonRow = string;

export interface StateGuide {
  slug: StateSlug;
  name: string;
  shortName: string;
  tagline: string;
  capital: string;
  bestTime: string;
  bestTimeNote?: string;
  season: SeasonRow;
  airports: string[];
  languages: string[];
  cover: ImageRef;
  description: string;
  attractions: Attraction[];
  food: string[];
  crafts: string[];
  seo: { title: string; description: string };
}

export interface PackageDay {
  day: number;
  title: string;
  detail: string;
  overnight?: string;
  driveKm?: number;
}

export interface TourPackage {
  slug: string;
  title: string;
  summary: string;
  states: StateSlug[];
  interests: Interest[];
  days: number;
  nights: number;
  startHub: string;
  vehicle: string;
  distanceKm: number;
  fromPriceInr: number;
  groupSize?: string;
  bestMonths: number[];
  image: ImageRef;
  itinerary: PackageDay[];
  inclusions: string[];
  exclusions: string[];
  permitsNeeded: StateSlug[];
  faqs?: { q: string; a: string }[];
  featured?: boolean;
}

export interface Festival {
  slug: string;
  name: string;
  state: StateSlug;
  month: number;
  /** ISO date, yyyy-mm-dd */
  startDate?: string;
  endDate?: string;
  dateConfirmed: boolean;
  /** Annual festivals roll to the next year once they end. */
  recurring: boolean;
  community: string;
  description: string;
  image: ImageRef;
}

export type Nationality = 'indian' | 'foreign' | 'oci';

export type PermitType = 'ILP' | 'PAP' | 'RAP' | 'None' | 'Protected Area';

export interface PermitRule {
  state: StateSlug;
  area?: string;
  nationality: Nationality;
  required: boolean;
  permitType: PermitType;
  /** Who issues the permit. */
  issuedBy: string;
  feeText: string;
  documents: string[];
  validity: string;
  processing: string;
  applyUrl?: string;
  sourceUrl?: string;
  notes?: string;
  verified: boolean;
  lastVerified?: string;
}

export interface ReachInfo {
  title: string;
  body: string;
  verified: boolean;
}
