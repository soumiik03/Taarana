import {
    pgTable,
    uuid,
    varchar,
    timestamp,
    text,
    integer,
    pgEnum,
  } from "drizzle-orm/pg-core";
  
  export const organizationPlanEnum = pgEnum("organization_plan", [
    "FREE",
    "PRO",
  ]);

  export const organizationsTable = pgTable("organizations", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    logoUrl: text("logo_url"),
    githubInstallationId: integer("github_installation_id"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
    plan: organizationPlanEnum("plan").default("FREE").notNull(),
    subscriptionId: varchar("subscription_id", { length: 255 }),
    razorpayCustomerId: varchar("razorpay_customer_id", { length: 255 }),
    subscriptionStatus: varchar("subscription_status", { length: 50 }),
    subscriptionCurrentPeriodEnd: timestamp("subscription_current_period_end"),
  });
  
  export type SelectOrganization = typeof organizationsTable.$inferSelect;
  export type InsertOrganization = typeof organizationsTable.$inferInsert;