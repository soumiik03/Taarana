import { z } from "zod";
import { router, publicProcedure } from "../../trpc";
import { db, eq } from "@repo/database";
import { organizationsTable, workspaceMembersTable } from "@repo/database/schema";

export const workspaceRouter = router({
  create: publicProcedure
    .input(z.object({
      name: z.string().min(2).max(255),
      slug: z.string().min(2).max(255),
    }))
    .mutation(async ({ input, ctx }) => {
      const org = await db.insert(organizationsTable).values({
        name: input.name,
        slug: input.slug,
      }).returning();

      return org[0];
    }),

  getByUser: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const memberships = await db
        .select()
        .from(workspaceMembersTable)
        .where(eq(workspaceMembersTable.userId, input.userId));
      return memberships;
    }),
});