CREATE TABLE "pull_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"github_id" integer NOT NULL,
	"number" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"branch" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'open' NOT NULL,
	"url" varchar(255) NOT NULL,
	"feature_request_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "pull_requests_github_id_unique" UNIQUE("github_id")
);
--> statement-breakpoint
ALTER TABLE "pull_requests" ADD CONSTRAINT "pull_requests_feature_request_id_feature_requests_id_fk" FOREIGN KEY ("feature_request_id") REFERENCES "public"."feature_requests"("id") ON DELETE set null ON UPDATE no action;