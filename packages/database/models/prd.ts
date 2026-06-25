import {
    pgTable,
    uuid,
    timestamp,
    text,
    pgEnum,
    jsonb,
  } from "drizzle-orm/pg-core";
  import { featureRequestsTable } from "./feature-request";
  
  export const prdStatusEnum = pgEnum("prd_status", [
    "draft",
    "approved",
    "rejected",
  ]);
  
  export const prdsTable = pgTable("prds", {
    id: uuid("id").primaryKey().defaultRandom(),
    featureRequestId: uuid("feature_request_id")
      .notNull()
      .unique()
      .references(() => featureRequestsTable.id, { onDelete: "cascade" }),
    problemStatement: text("problem_statement"),
    goals: jsonb("goals").$type<string[]>(),
    nonGoals: jsonb("non_goals").$type<string[]>(),
    userStories: jsonb("user_stories").$type<string[]>(),
    acceptanceCriteria: jsonb("acceptance_criteria").$type<string[]>(),
    edgeCases: jsonb("edge_cases").$type<string[]>(),
    successMetrics: jsonb("success_metrics").$type<string[]>(),
    status: prdStatusEnum("status").notNull().default("draft"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  });
  
  export type SelectPrd = typeof prdsTable.$inferSelect;
  export type InsertPrd = typeof prdsTable.$inferInsert;