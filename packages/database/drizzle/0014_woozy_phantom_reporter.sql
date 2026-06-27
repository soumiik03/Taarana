ALTER TABLE "feature_requests" ADD COLUMN "approved_by" varchar(255);--> statement-breakpoint
ALTER TABLE "feature_requests" ADD COLUMN "approval_notes" text;--> statement-breakpoint
ALTER TABLE "feature_requests" ADD COLUMN "rejection_reason" text;--> statement-breakpoint
ALTER TABLE "feature_requests" ADD COLUMN "shipped_at" timestamp;