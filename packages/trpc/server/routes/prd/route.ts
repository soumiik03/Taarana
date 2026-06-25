import { z } from "zod";
import { router, publicProcedure } from "../../trpc";
import { db, eq } from "@repo/database";
import { prdsTable } from "@repo/database/schema";

export const prdRouter = router({
    getByFeatureRequest: publicProcedure
        .input(z.object({ featureRequestId: z.string().uuid() }))
        .query(async ({ input }) => {
            const result = await db
                .select()
                .from(prdsTable)
                .where(eq(prdsTable.featureRequestId, input.featureRequestId));
            return result[0] ?? null;
        }),

    update: publicProcedure
        .input(
            z.object({
                id: z.string().uuid(),
                problemStatement: z.string().optional(),
                goals: z.array(z.string()).optional(),
                nonGoals: z.array(z.string()).optional(),
                userStories: z.array(z.string()).optional(),
                acceptanceCriteria: z.array(z.string()).optional(),
                edgeCases: z.array(z.string()).optional(),
                successMetrics: z.array(z.string()).optional(),
            })
        )
        .mutation(async ({ input }) => {
            const { id, ...rest } = input;
            const result = await db
                .update(prdsTable)
                .set(rest)
                .where(eq(prdsTable.id, id))
                .returning();
            return result[0];
        }),

    approve: publicProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ input }) => {
            const result = await db
                .update(prdsTable)
                .set({ status: "approved" })
                .where(eq(prdsTable.id, input.id))
                .returning();
            return result[0];
        }),
});