import {
    pgTable,
    uuid,
    varchar,
    timestamp,
    text,
    pgEnum,
    integer,
  } from "drizzle-orm/pg-core";
  import { prdsTable } from "./prd";
  
  export const taskStatusEnum = pgEnum("task_status", [
    "todo",
    "in_progress",
    "done",
  ]);
  
  export const taskPriorityEnum = pgEnum("task_priority", [
    "low",
    "medium",
    "high",
  ]);
  
  export const tasksTable = pgTable("tasks", {
    id: uuid("id").primaryKey().defaultRandom(),
    prdId: uuid("prd_id")
      .notNull()
      .references(() => prdsTable.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    status: taskStatusEnum("status").notNull().default("todo"),
    priority: taskPriorityEnum("priority").notNull().default("medium"),
    order: integer("order").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  });
  
  export type SelectTask = typeof tasksTable.$inferSelect;
  export type InsertTask = typeof tasksTable.$inferInsert;