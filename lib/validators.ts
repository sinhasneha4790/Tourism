import { z } from 'zod';

const stateSlug = z.enum(['assam', 'meghalaya', 'arunachal-pradesh', 'nagaland', 'manipur', 'mizoram', 'tripura', 'sikkim']);
const interest = z.enum(['wildlife', 'culture', 'spiritual', 'trekking', 'tea']);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected yyyy-mm-dd');
const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'slugs must be lowercase-hyphenated');

const imageRef = z.object({
  src: z.string().optional(),
  alt: z.string().min(3),
  credit: z.string().optional(),
  scene: z.enum(['hills', 'river', 'forest', 'monastery', 'lake', 'tea', 'village', 'festival']),
  tint: z.tuple([z.string(), z.string()]).optional(),
});

export const stateGuideSchema = z.object({
  slug: stateSlug,
  name: z.string().min(1),
  shortName: z.string().min(1),
  tagline: z.string().min(1),
  capital: z.string().min(1),
  bestTime: z.string().min(1),
  bestTimeNote: z.string().optional(),
  season: z.string().regex(/^[bgm]{12}$/, 'season needs 12 letters of b / g / m'),
  airports: z.array(z.string()).min(1),
  languages: z.array(z.string()).min(1),
  cover: imageRef,
  description: z.string().min(20),
  attractions: z
    .array(
      z.object({
        name: z.string(),
        location: z.string(),
        timeNeeded: z.string(),
        image: imageRef,
        interests: z.array(interest),
      }),
    )
    .min(3),
  food: z.array(z.string()),
  crafts: z.array(z.string()),
  seo: z.object({ title: z.string(), description: z.string() }),
});

export const packageSchema = z
  .object({
    slug,
    title: z.string(),
    summary: z.string(),
    states: z.array(stateSlug).min(1),
    interests: z.array(interest).min(1),
    days: z.number().int().min(1),
    nights: z.number().int().min(0),
    startHub: z.string(),
    vehicle: z.string(),
    distanceKm: z.number().positive(),
    fromPriceInr: z.number().positive(),
    groupSize: z.string().optional(),
    bestMonths: z.array(z.number().int().min(1).max(12)),
    image: imageRef,
    itinerary: z.array(
      z.object({
        day: z.number().int(),
        title: z.string(),
        detail: z.string(),
        overnight: z.string().optional(),
        driveKm: z.number().optional(),
      }),
    ),
    inclusions: z.array(z.string()),
    exclusions: z.array(z.string()),
    permitsNeeded: z.array(stateSlug),
    faqs: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    featured: z.boolean().optional(),
  })
  .refine((p) => p.itinerary.length === p.days, {
    message: 'itinerary must have one entry per day',
  })
  .refine((p) => p.nights === p.days - 1, {
    message: 'nights must be days − 1',
  });

export const festivalSchema = z
  .object({
    slug,
    name: z.string(),
    state: stateSlug,
    month: z.number().int().min(1).max(12),
    startDate: isoDate.optional(),
    endDate: isoDate.optional(),
    dateConfirmed: z.boolean(),
    recurring: z.boolean(),
    community: z.string(),
    description: z.string(),
    image: imageRef,
  })
  .refine((f) => !f.startDate || Number(f.startDate.slice(5, 7)) === f.month, {
    message: 'month must match startDate',
  })
  .refine((f) => !f.endDate || !f.startDate || f.endDate >= f.startDate, {
    message: 'endDate before startDate',
  });

export const permitSchema = z.object({
  state: stateSlug,
  area: z.string().optional(),
  nationality: z.enum(['indian', 'foreign', 'oci']),
  required: z.boolean(),
  permitType: z.enum(['ILP', 'PAP', 'RAP', 'None', 'Protected Area']),
  issuedBy: z.string().min(1),
  feeText: z.string(),
  documents: z.array(z.string()),
  validity: z.string(),
  processing: z.string(),
  applyUrl: z.url().optional(),
  sourceUrl: z.url().optional(),
  notes: z.string().optional(),
  verified: z.boolean(),
  lastVerified: isoDate.optional(),
});

/** Shared by the enquiry form (client) and the server action. */
export const enquirySchema = z.object({
  kind: z.enum(['package', 'contact', 'plan', 'listing']),
  name: z.string().trim().min(2, 'Please tell us your name').max(80),
  email: z.email('Please enter a valid email'),
  phone: z
    .string()
    .trim()
    .max(20)
    .regex(/^[+\d\s()-]*$/, 'Digits, spaces and + only')
    .optional()
    .or(z.literal('')),
  startDate: isoDate.optional().or(z.literal('')),
  travellers: z.coerce.number().int().min(1).max(30),
  message: z.string().trim().max(2000).optional().or(z.literal('')),
  ref: z.string().max(200).optional(),
  listingId: z.string().max(64).optional(),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;

export const newsletterSchema = z.object({
  email: z.email('Please enter a valid email'),
});

const phoneField = z
  .string()
  .trim()
  .min(8, 'Please enter a phone number')
  .max(20)
  .regex(/^[+\d\s()-]+$/, 'Digits, spaces and + only');

export const hostProfileSchema = z.object({
  displayName: z.string().trim().min(2, 'Please enter the name guests will see').max(80),
  phone: phoneField,
  state: stateSlug,
  bio: z.string().trim().max(1000).optional().or(z.literal('')),
});

/** Splits a comma- or newline-separated amenities field into a clean list. */
const amenityList = z
  .string()
  .optional()
  .transform((v) =>
    (v ?? '')
      .split(/[,\n]/)
      .map((a) => a.trim())
      .filter(Boolean)
      .slice(0, 30),
  );

const optionalCoord = (min: number, max: number) =>
  z
    .union([z.literal(''), z.coerce.number().min(min).max(max)])
    .optional()
    .transform((v) => (v === '' || v === undefined ? null : v));

export const listingSchema = z.object({
  type: z.enum(['stay', 'experience']),
  title: z.string().trim().min(5, 'Use at least 5 characters').max(100),
  state: stateSlug,
  location: z.string().trim().min(2, 'Where is it? e.g. village, district').max(120),
  description: z.string().trim().min(40, 'Describe it in at least 40 characters').max(4000),
  amenities: amenityList,
  basePriceInr: z.coerce.number().int('Whole rupees only').min(100, 'Minimum ₹100').max(500000),
  priceUnit: z.enum(['night', 'person', 'group']),
  maxGuests: z.coerce.number().int().min(1).max(50),
  cancellationPolicy: z.enum(['flexible', 'moderate', 'strict']),
  lat: optionalCoord(20, 30),
  lng: optionalCoord(87, 98),
});

export type ListingInput = z.infer<typeof listingSchema>;

export const PHOTO_MAX_BYTES = 4 * 1024 * 1024;
export const PHOTO_MAX_COUNT = 8;
export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'listing'
  );
}
