import {
    pgTable,
    uuid,
    timestamp,
    text,
    pgEnum,
  } from "drizzle-orm/pg-core";
  import { featureRequestsTable } from "./feature-request";
  
  export const questionStatusEnum = pgEnum("question_status", [
    "pending",
    "answered",
  ]);
  
  export const clarificationQuestionsTable = pgTable("clarification_questions", {
    id: uuid("id").primaryKey().defaultRandom(),
    featureRequestId: uuid("feature_request_id")
      .notNull()
      .references(() => featureRequestsTable.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    answer: text("answer"),
    status: questionStatusEnum("status").notNull().default("pending"),
    order: uuid("order").defaultRandom(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  });
  
  export type SelectClarificationQuestion =
    typeof clarificationQuestionsTable.$inferSelect;
  export type InsertClarificationQuestion =
    typeof clarificationQuestionsTable.$inferInsert;