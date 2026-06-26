import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  integer,
  bigint,
} from "drizzle-orm/pg-core";
import { featureRequestsTable } from "./feature-request";

export const pullRequestsTable = pgTable("pull_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  githubId: bigint("github_id", { mode: "number" }).notNull().unique(),
  number: integer("number").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  branch: varchar("branch", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("open"),
  url: varchar("url", { length: 255 }).notNull(),
  featureRequestId: uuid("feature_request_id")
    .references(() => featureRequestsTable.id, { onDelete: "set null" }),
  repoOwner: text("repo_owner").notNull(),
  repoName: text("repo_name").notNull(),
  prNumber: integer("pr_number").notNull(),
  headSha: text("head_sha").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export type SelectPullRequest = typeof pullRequestsTable.$inferSelect;
export type InsertPullRequest = typeof pullRequestsTable.$inferInsert;
