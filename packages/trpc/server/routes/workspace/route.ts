import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../../trpc";
import { db, eq } from "@repo/database";
import { organizationsTable, workspaceMembersTable } from "@repo/database/schema";

export const workspaceRouter = router({
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(2).max(255),
      slug: z.string().min(2).max(255),
    }))
    .mutation(async ({ input, ctx }) => {
      const org = await db.insert(organizationsTable).values({
        name: input.name,
        slug: input.slug,
      }).returning();

      // Automatically add the creator as the admin of the workspace
      await db.insert(workspaceMembersTable).values({
        organizationId: org[0]!.id,
        userId: ctx.user.id,
        role: "admin",
      });

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

  getUserWorkspaces: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const orgs = await db
      .select({
        id: organizationsTable.id,
        name: organizationsTable.name,
        slug: organizationsTable.slug,
        logoUrl: organizationsTable.logoUrl,
      })
      .from(workspaceMembersTable)
      .innerJoin(
        organizationsTable,
        eq(workspaceMembersTable.organizationId, organizationsTable.id)
      )
      .where(eq(workspaceMembersTable.userId, userId));
    return orgs;
  }),
});