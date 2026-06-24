import {
    pgTable,
    uuid,
    varchar,
    timestamp,
    text,
    integer,
  } from "drizzle-orm/pg-core";
  
  export const organizationsTable = pgTable("organizations", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    logoUrl: text("logo_url"),
    githubInstallationId: integer("github_installation_id"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  });
  
  export type SelectOrganization = typeof organizationsTable.$inferSelect;
  export type InsertOrganization = typeof organizationsTable.$inferInsert;