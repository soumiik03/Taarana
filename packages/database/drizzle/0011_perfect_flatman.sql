ALTER TABLE "pull_requests" ADD COLUMN "repo_owner" text NOT NULL;--> statement-breakpoint
ALTER TABLE "pull_requests" ADD COLUMN "repo_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "pull_requests" ADD COLUMN "pr_number" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "pull_requests" ADD COLUMN "head_sha" text NOT NULL;