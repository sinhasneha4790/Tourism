import { boolean, doublePrecision, index, integer, jsonb, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import type { AdapterAccountType } from 'next-auth/adapters';

export const roleEnum = pgEnum('role', ['traveller', 'host', 'admin']);
export const listingTypeEnum = pgEnum('listing_type', ['stay', 'experience']);
export const listingStatusEnum = pgEnum('listing_status', ['draft', 'pending', 'approved', 'rejected']);
export const priceUnitEnum = pgEnum('price_unit', ['night', 'person', 'group']);
export const cancellationEnum = pgEnum('cancellation_policy', ['flexible', 'moderate', 'strict']);
export const enquiryStatusEnum = pgEnum('enquiry_status', ['new', 'replied', 'closed']);

const id = () =>
  text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());
const createdAt = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow();

/* ----------------------------- Auth.js tables ----------------------------- */

export const users = pgTable('user', {
  id: id(),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date', withTimezone: true }),
  image: text('image'),
  role: roleEnum('role').notNull().default('traveller'),
  phone: text('phone'),
  createdAt: createdAt(),
});

export const accounts = pgTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })],
);

export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date', withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date', withTimezone: true }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

/* ------------------------------- Marketplace ------------------------------ */

/** Payout details are collected by the payment provider (Phase 4), never stored here. */
export const hostProfiles = pgTable('host_profile', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  displayName: text('display_name').notNull(),
  phone: text('phone').notNull(),
  state: text('state').notNull(),
  bio: text('bio').notNull().default(''),
  createdAt: createdAt(),
});

export interface ListingPhoto {
  url: string;
  alt: string;
}

export const listings = pgTable(
  'listing',
  {
    id: id(),
    hostId: text('host_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: listingTypeEnum('type').notNull(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    state: text('state').notNull(),
    location: text('location').notNull(),
    lat: doublePrecision('lat'),
    lng: doublePrecision('lng'),
    description: text('description').notNull(),
    amenities: text('amenities').array().notNull().default([]),
    photos: jsonb('photos').$type<ListingPhoto[]>().notNull().default([]),
    basePriceInr: integer('base_price_inr').notNull(),
    priceUnit: priceUnitEnum('price_unit').notNull(),
    maxGuests: integer('max_guests').notNull(),
    cancellationPolicy: cancellationEnum('cancellation_policy').notNull().default('moderate'),
    status: listingStatusEnum('status').notNull().default('draft'),
    rejectionReason: text('rejection_reason'),
    rating: doublePrecision('rating'),
    submittedAt: timestamp('submitted_at', { withTimezone: true }),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('listing_slug_idx').on(t.slug), index('listing_status_idx').on(t.status, t.type), index('listing_host_idx').on(t.hostId)],
);

export const enquiries = pgTable(
  'enquiry',
  {
    id: id(),
    kind: text('kind').notNull(),
    listingId: text('listing_id').references(() => listings.id, { onDelete: 'set null' }),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
    emailed: boolean('emailed').notNull().default(false),
    status: enquiryStatusEnum('status').notNull().default('new'),
    createdAt: createdAt(),
  },
  (t) => [index('enquiry_listing_idx').on(t.listingId), index('enquiry_created_idx').on(t.createdAt)],
);

export type User = typeof users.$inferSelect;
export type Listing = typeof listings.$inferSelect;
export type HostProfile = typeof hostProfiles.$inferSelect;
export type Enquiry = typeof enquiries.$inferSelect;
