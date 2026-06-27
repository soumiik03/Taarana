import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  integer,
} from "drizzle-orm/pg-core";
import { pullRequestsTable } from "./pull-request";

export const reviewsTable = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  pullRequestId: uuid("pull_request_id")
    .notNull()
    .references(() => pullRequestsTable.id, { onDelete: "cascade" }),
  commitSha: text("commit_sha").notNull(),
  overallAssessment: text("overall_assessment").notNull(),
  score: integer("score").notNull(),
  status: varchar("status", { length: 50 }).notNull(), // "ready-for-approval" | "fix-needed"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const reviewIssuesTable = pgTable("review_issues", {
  id: uuid("id").primaryKey().defaultRandom(),
  reviewId: uuid("review_id")
    .notNull()
    .references(() => reviewsTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  severity: varchar("severity", { length: 50 }).notNull(), // "blocking" | "high" | "medium" | "low" | "suggestion"
  whyItMatters: text("why_it_matters").notNull(),
  file: text("file"),
  line: integer("line"),
  suggestedFix: text("suggested_fix").notNull(),
  expectedResult: text("expected_result").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type SelectReview = typeof reviewsTable.$inferSelect;
export type InsertReview = typeof reviewsTable.$inferInsert;

export type SelectReviewIssue = typeof reviewIssuesTable.$inferSelect;
export type InsertReviewIssue = typeof reviewIssuesTable.$inferInsert;
