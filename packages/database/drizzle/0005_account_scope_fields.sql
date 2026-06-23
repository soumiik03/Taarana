ALTER TABLE "accounts" ADD COLUMN "access_token_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "refresh_token_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "scope" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "created_at" timestamp;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN IF EXISTS "expires_at";