CREATE TYPE "public"."booking_status" AS ENUM('enquiry', 'pending_payment', 'confirmed', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."payout_status" AS ENUM('pending', 'paid');--> statement-breakpoint
CREATE TABLE "availability" (
	"listing_id" text NOT NULL,
	"date" date NOT NULL,
	"available" boolean DEFAULT true NOT NULL,
	"price_override_inr" integer,
	CONSTRAINT "availability_listing_id_date_pk" PRIMARY KEY("listing_id","date")
);
--> statement-breakpoint
CREATE TABLE "booking" (
	"id" text PRIMARY KEY NOT NULL,
	"ref" text NOT NULL,
	"access_token" text NOT NULL,
	"listing_id" text,
	"package_slug" text,
	"host_id" text,
	"user_id" text,
	"guest_name" text NOT NULL,
	"guest_email" text NOT NULL,
	"guest_phone" text,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"guests" integer NOT NULL,
	"nights" integer NOT NULL,
	"subtotal_inr" integer NOT NULL,
	"service_fee_inr" integer NOT NULL,
	"tax_inr" integer NOT NULL,
	"amount_inr" integer NOT NULL,
	"commission_pct" double precision NOT NULL,
	"commission_inr" integer NOT NULL,
	"host_payout_inr" integer NOT NULL,
	"cancellation_policy" "cancellation_policy" NOT NULL,
	"status" "booking_status" DEFAULT 'pending_payment' NOT NULL,
	"expires_at" timestamp with time zone,
	"razorpay_order_id" text,
	"razorpay_payment_id" text,
	"razorpay_refund_id" text,
	"refund_due_inr" integer,
	"cancel_reason" text,
	"payout_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"confirmed_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"refunded_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "payout" (
	"id" text PRIMARY KEY NOT NULL,
	"host_id" text NOT NULL,
	"amount_inr" integer NOT NULL,
	"booking_ids" text[] NOT NULL,
	"status" "payout_status" DEFAULT 'pending' NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"paid_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "setting" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "availability" ADD CONSTRAINT "availability_listing_id_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listing"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_listing_id_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listing"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_host_id_user_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_payout_id_payout_id_fk" FOREIGN KEY ("payout_id") REFERENCES "public"."payout"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout" ADD CONSTRAINT "payout_host_id_user_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "booking_ref_idx" ON "booking" USING btree ("ref");--> statement-breakpoint
CREATE UNIQUE INDEX "booking_order_idx" ON "booking" USING btree ("razorpay_order_id");--> statement-breakpoint
CREATE INDEX "booking_listing_dates_idx" ON "booking" USING btree ("listing_id","start_date","end_date");--> statement-breakpoint
CREATE INDEX "booking_user_idx" ON "booking" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "booking_email_idx" ON "booking" USING btree ("guest_email");--> statement-breakpoint
CREATE INDEX "booking_host_idx" ON "booking" USING btree ("host_id");