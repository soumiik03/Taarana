import { z } from "zod";
import { router, publicProcedure } from "../../trpc";
import { db, eq } from "@repo/database";
import { tasksTable } from "@repo/database/schema";

export const tasksRouter = router({
  getByPrd: publicProcedure
    .input(z.object({ prdId: z.string().uuid() }))
    .query(async ({ input }) => {
      return db
        .select()
        .from(tasksTable)
        .where(eq(tasksTable.prdId, input.prdId))
        .orderBy(tasksTable.order);
    }),

  updateStatus: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(["todo", "in_progress", "done"]),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db
        .update(tasksTable)
        .set({ status: input.status })
        .where(eq(tasksTable.id, input.id))
        .returning();
      return result[0];
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().optional(),
        description: z.string().optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...rest } = input;
      const result = await db
        .update(tasksTable)
        .set(rest)
        .where(eq(tasksTable.id, id))
        .returning();
      return result[0];
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await db.delete(tasksTable).where(eq(tasksTable.id, input.id));
      return { success: true };
    }),
});