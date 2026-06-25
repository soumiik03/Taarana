import { z } from "zod";
import { router, publicProcedure } from "../../trpc";
import { db, eq } from "@repo/database";
import { featureRequestsTable, prdsTable } from "@repo/database/schema";
import { Inngest } from "inngest";

const inngest = new Inngest({ id: "taarana-api" });

export const prdRouter = router({
    getById: publicProcedure
        .input(z.object({ id: z.string().uuid() }))
        .query(async ({ input }) => {
            const result = await db
                .select()
                .from(prdsTable)
                .where(eq(prdsTable.id, input.id));
            return result[0] ?? null;
        }),

    getByFeatureRequest: publicProcedure
        .input(z.object({ featureRequestId: z.string().uuid() }))
        .query(async ({ input }) => {
            const result = await db
                .select()
                .from(prdsTable)
                .where(eq(prdsTable.featureRequestId, input.featureRequestId));
            return result[0] ?? null;
        }),

    trigger: publicProcedure
        .input(z.object({ featureRequestId: z.string().uuid() }))
        .mutation(async ({ input }) => {
            const featureRequest = await db
                .select()
                .from(featureRequestsTable)
                .where(eq(featureRequestsTable.id, input.featureRequestId));

            if (!featureRequest[0]) {
                throw new Error("Feature request not found");
            }

            const existingPrd = await db
                .select()
                .from(prdsTable)
                .where(eq(prdsTable.featureRequestId, input.featureRequestId));

            let prd = existingPrd[0];

            if (prd) {
                const updatedPrd = await db
                    .update(prdsTable)
                    .set({ status: "draft" })
                    .where(eq(prdsTable.id, prd.id))
                    .returning();
                prd = updatedPrd[0] ?? prd;
            } else {
                const createdPrd = await db
                    .insert(prdsTable)
                    .values({
                        featureRequestId: input.featureRequestId,
                        status: "draft",
                    })
                    .returning();

                prd = createdPrd[0];
            }

            if (!prd) {
                throw new Error("Failed to create PRD placeholder");
            }

            await inngest.send({
                name: "prd/generate",
                data: { featureRequestId: input.featureRequestId },
            });

            return { id: prd.id };
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
