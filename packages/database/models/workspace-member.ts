import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { organizationsTable } from "./organization";
import { usersTable } from "./user";

export const workspaceMembersTable = pgTable("workspace_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizationsTable.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 50 }).notNull().default("member"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type SelectWorkspaceMember = typeof workspaceMembersTable.$inferSelect;
export type InsertWorkspaceMember = typeof workspaceMembersTable.$inferInsert;
