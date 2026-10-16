import { boolean, date, doublePrecision, index, integer, jsonb, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
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
    reviewCount: integer('review_count').notNull().default(0),
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

/* -------------------------------- Bookings -------------------------------- */

export const bookingStatusEnum = pgEnum('booking_status', ['enquiry', 'pending_payment', 'confirmed', 'cancelled', 'refunded']);
export const payoutStatusEnum = pgEnum('payout_status', ['pending', 'paid']);

/** Per-date overrides set by hosts. No row = available at the base price. */
export const availability = pgTable(
  'availability',
  {
    listingId: text('listing_id')
      .notNull()
      .references(() => listings.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    available: boolean('available').notNull().default(true),
    priceOverrideInr: integer('price_override_inr'),
  },
  (t) => [primaryKey({ columns: [t.listingId, t.date] })],
);

export const payouts = pgTable('payout', {
  id: id(),
  hostId: text('host_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  amountInr: integer('amount_inr').notNull(),
  bookingIds: text('booking_ids').array().notNull(),
  status: payoutStatusEnum('status').notNull().default('pending'),
  note: text('note'),
  createdAt: createdAt(),
  paidAt: timestamp('paid_at', { withTimezone: true }),
});

export const bookings = pgTable(
  'booking',
  {
    id: id(),
    /** Short human-friendly reference, e.g. MT-7KQ2PX. */
    ref: text('ref').notNull(),
    /** Secret for guest-checkout links (/bookings/[ref]?t=…). */
    accessToken: text('access_token').notNull(),
    listingId: text('listing_id').references(() => listings.id, { onDelete: 'set null' }),
    packageSlug: text('package_slug'),
    hostId: text('host_id').references(() => users.id, { onDelete: 'set null' }),
    userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
    guestName: text('guest_name').notNull(),
    guestEmail: text('guest_email').notNull(),
    guestPhone: text('guest_phone'),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    guests: integer('guests').notNull(),
    nights: integer('nights').notNull(),
    subtotalInr: integer('subtotal_inr').notNull(),
    serviceFeeInr: integer('service_fee_inr').notNull(),
    taxInr: integer('tax_inr').notNull(),
    amountInr: integer('amount_inr').notNull(),
    commissionPct: doublePrecision('commission_pct').notNull(),
    commissionInr: integer('commission_inr').notNull(),
    hostPayoutInr: integer('host_payout_inr').notNull(),
    cancellationPolicy: cancellationEnum('cancellation_policy').notNull(),
    status: bookingStatusEnum('status').notNull().default('pending_payment'),
    /** Unpaid holds stop blocking dates after this time. */
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    razorpayOrderId: text('razorpay_order_id'),
    razorpayPaymentId: text('razorpay_payment_id'),
    razorpayRefundId: text('razorpay_refund_id'),
    refundDueInr: integer('refund_due_inr'),
    cancelReason: text('cancel_reason'),
    payoutId: text('payout_id').references(() => payouts.id, { onDelete: 'set null' }),
    reviewRequestedAt: timestamp('review_requested_at', { withTimezone: true }),
    createdAt: createdAt(),
    confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    refundedAt: timestamp('refunded_at', { withTimezone: true }),
  },
  (t) => [
    uniqueIndex('booking_ref_idx').on(t.ref),
    uniqueIndex('booking_order_idx').on(t.razorpayOrderId),
    index('booking_listing_dates_idx').on(t.listingId, t.startDate, t.endDate),
    index('booking_user_idx').on(t.userId),
    index('booking_email_idx').on(t.guestEmail),
    index('booking_host_idx').on(t.hostId),
  ],
);

/* --------------------------------- Reviews -------------------------------- */

/** One review per completed booking. Published immediately; admins can hide a review. */
export const reviews = pgTable(
  'review',
  {
    id: id(),
    bookingId: text('booking_id')
      .notNull()
      .references(() => bookings.id, { onDelete: 'cascade' }),
    listingId: text('listing_id')
      .notNull()
      .references(() => listings.id, { onDelete: 'cascade' }),
    authorName: text('author_name').notNull(),
    rating: integer('rating').notNull(),
    text: text('text').notNull(),
    published: boolean('published').notNull().default(true),
    hostReply: text('host_reply'),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('review_booking_idx').on(t.bookingId), index('review_listing_idx').on(t.listingId, t.published)],
);

/** Admin-editable settings (commission, fees, tax). */
export const settings = pgTable('setting', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Listing = typeof listings.$inferSelect;
export type HostProfile = typeof hostProfiles.$inferSelect;
export type Enquiry = typeof enquiries.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Review = typeof reviews.$inferSelect;
