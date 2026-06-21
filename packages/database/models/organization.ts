import {
    pgTable,
    uuid,
    varchar,
    timestamp,
    text,
  } from "drizzle-orm/pg-core";
  
  export const organizationsTable = pgTable("organizations", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    logoUrl: text("logo_url"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  });
  
  export type SelectOrganization = typeof organizationsTable.$inferSelect;
  export type InsertOrganization = typeof organizationsTable.$inferInsert;