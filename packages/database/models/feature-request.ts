import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  pgEnum,
} from "drizzle-orm/pg-core";
import { organizationsTable } from "./organization";

export const featureRequestSourceEnum = pgEnum("feature_request_source", [
  "email",
  "ticket",
  "call",
  "manual",
]);

export const featureRequestStatusEnum = pgEnum("feature_request_status", [
  "pending",
  "clarifying",
  "ready",
  "rejected",
  "fix-needed",
  "ready-for-approval",
  "shipped"
]);

export const featureRequestsTable = pgTable("feature_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizationsTable.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  source: featureRequestSourceEnum("source").notNull().default("manual"),
  status: featureRequestStatusEnum("status").notNull().default("pending"),
  approvedBy: varchar("approved_by", { length: 255 }),
  approvalNotes: text("approval_notes"),
  rejectionReason: text("rejection_reason"),
  shippedAt: timestamp("shipped_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});



export type SelectFeatureRequest = typeof featureRequestsTable.$inferSelect;
export type InsertFeatureRequest = typeof featureRequestsTable.$inferInsert;