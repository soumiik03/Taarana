import { z } from "zod";
import { router, publicProcedure } from "../../trpc";
import { db, eq, asc } from "@repo/database";
import {
  featureRequestsTable,
  clarificationQuestionsTable,
} from "@repo/database/schema";
import { inngest } from "@repo/inngest";

export const featureRequestsRouter = router({
  create: publicProcedure
    .input(
      z.object({
        organizationId: z.string().uuid(),
        title: z.string().min(3).max(255),
        description: z.string().min(10),
        source: z.enum(["email", "ticket", "call", "manual"]),
      })
    )
    .mutation(async ({ input }) => {
      const result = await db
        .insert(featureRequestsTable)
        .values({
          organizationId: input.organizationId,
          title: input.title,
          description: input.description,
          source: input.source,
          status: "pending",
        })
        .returning();

      const newRequest = result[0];
      if (!newRequest) {
        throw new Error("Failed to create feature request");
      }

      try {
        await inngest.send({
          name: "feature-request/created",
          data: { featureRequestId: newRequest.id },
        });
        console.log(`Successfully sent inngest event for ${newRequest.id}`);
      } catch (err) {
        console.error("Failed to send inngest event:", err);
        throw new Error(`Failed to trigger background job: ${(err as Error).message}`);
      }

      return newRequest;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const result = await db
        .select()
        .from(featureRequestsTable)
        .where(eq(featureRequestsTable.id, input.id));
      return result[0] ?? null;
    }),

  getByOrg: publicProcedure
    .input(z.object({ organizationId: z.string().uuid() }))
    .query(async ({ input }) => {
      return db
        .select()
        .from(featureRequestsTable)
        .where(
          eq(featureRequestsTable.organizationId, input.organizationId)
        );
    }),

  getQuestions: publicProcedure
    .input(z.object({ featureRequestId: z.string().uuid() }))
    .query(async ({ input }) => {
      return db
        .select()
        .from(clarificationQuestionsTable)
        .where(eq(clarificationQuestionsTable.featureRequestId, input.featureRequestId))
        .orderBy(asc(clarificationQuestionsTable.createdAt));
    }),

  submitAnswer: publicProcedure
    .input(
      z.object({
        questionId: z.string().uuid(),
        answer: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const updated = await db
        .update(clarificationQuestionsTable)
        .set({
          answer: input.answer,
          status: "answered",
        })
        .where(eq(clarificationQuestionsTable.id, input.questionId))
        .returning();

      const question = updated[0];
      if (!question) {
        throw new Error("Question not found");
      }

      // Check if all questions are answered
      const allQuestions = await db
        .select()
        .from(clarificationQuestionsTable)
        .where(eq(clarificationQuestionsTable.featureRequestId, question.featureRequestId));

      const allAnswered = allQuestions.every((q) => q.status === "answered");

      if (allAnswered) {
        // Send inngest event to check context
        await inngest.send({
          name: "feature-request/check-context",
          data: { featureRequestId: question.featureRequestId },
        });
      }

      return question;
    }),
});