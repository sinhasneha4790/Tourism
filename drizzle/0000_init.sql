CREATE TYPE "public"."cancellation_policy" AS ENUM('flexible', 'moderate', 'strict');--> statement-breakpoint
CREATE TYPE "public"."enquiry_status" AS ENUM('new', 'replied', 'closed');--> statement-breakpoint
CREATE TYPE "public"."listing_status" AS ENUM('draft', 'pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."listing_type" AS ENUM('stay', 'experience');--> statement-breakpoint
CREATE TYPE "public"."price_unit" AS ENUM('night', 'person', 'group');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('traveller', 'host', 'admin');--> statement-breakpoint
CREATE TABLE "account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "enquiry" (
	"id" text PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"listing_id" text,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"payload" jsonb NOT NULL,
	"emailed" boolean DEFAULT false NOT NULL,
	"status" "enquiry_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "host_profile" (
	"user_id" text PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"phone" text NOT NULL,
	"state" text NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing" (
	"id" text PRIMARY KEY NOT NULL,
	"host_id" text NOT NULL,
	"type" "listing_type" NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"state" text NOT NULL,
	"location" text NOT NULL,
	"lat" double precision,
	"lng" double precision,
	"description" text NOT NULL,
	"amenities" text[] DEFAULT '{}' NOT NULL,
	"photos" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"base_price_inr" integer NOT NULL,
	"price_unit" "price_unit" NOT NULL,
	"max_guests" integer NOT NULL,
	"cancellation_policy" "cancellation_policy" DEFAULT 'moderate' NOT NULL,
	"status" "listing_status" DEFAULT 'draft' NOT NULL,
	"rejection_reason" text,
	"rating" double precision,
	"submitted_at" timestamp with time zone,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"emailVerified" timestamp with time zone,
	"image" text,
	"role" "role" DEFAULT 'traveller' NOT NULL,
	"phone" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enquiry" ADD CONSTRAINT "enquiry_listing_id_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listing"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "host_profile" ADD CONSTRAINT "host_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing" ADD CONSTRAINT "listing_host_id_user_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "enquiry_listing_idx" ON "enquiry" USING btree ("listing_id");--> statement-breakpoint
CREATE INDEX "enquiry_created_idx" ON "enquiry" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "listing_slug_idx" ON "listing" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "listing_status_idx" ON "listing" USING btree ("status","type");--> statement-breakpoint
CREATE INDEX "listing_host_idx" ON "listing" USING btree ("host_id");