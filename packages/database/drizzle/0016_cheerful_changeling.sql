CREATE TYPE "public"."organization_plan" AS ENUM('FREE', 'PRO');--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "plan" "organization_plan" DEFAULT 'FREE' NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "subscription_id" varchar(255);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "razorpay_customer_id" varchar(255);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "subscription_status" varchar(50);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "subscription_current_period_end" timestamp;