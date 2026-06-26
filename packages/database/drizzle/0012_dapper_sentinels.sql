ALTER TYPE "public"."feature_request_status" ADD VALUE 'fix-needed';--> statement-breakpoint
ALTER TYPE "public"."feature_request_status" ADD VALUE 'ready-for-approval';--> statement-breakpoint
ALTER TABLE "pull_requests" ALTER COLUMN "github_id" SET DATA TYPE bigint;