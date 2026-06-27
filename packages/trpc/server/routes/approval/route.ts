import { z } from "zod";
import { protectedProcedure, router } from "../../trpc";
import { db, eq, desc } from "@repo/database";
import { 
  featureRequestsTable,
  prdsTable,
  tasksTable,
  pullRequestsTable,
  reviewsTable,
  reviewIssuesTable
} from "@repo/database/schema";

export const approvalRouter = router({
  getApprovalData: protectedProcedure
    .input(z.object({ featureId: z.string() }))
    .query(async ({ input }) => {
      const { featureId } = input;

      const featureRequest = await db
        .select()
        .from(featureRequestsTable)
        .where(eq(featureRequestsTable.id, featureId))
        .limit(1)
        .then(res => res[0]);

      if (!featureRequest) {
        throw new Error("Feature request not found");
      }

      const prd = await db
        .select()
        .from(prdsTable)
        .where(eq(prdsTable.featureRequestId, featureId))
        .limit(1)
        .then(res => res[0]);

      const tasks = prd 
        ? await db
            .select()
            .from(tasksTable)
            .where(eq(tasksTable.prdId, prd.id))
            .orderBy(desc(tasksTable.createdAt))
        : [];

      const pullRequest = await db
        .select()
        .from(pullRequestsTable)
        .where(eq(pullRequestsTable.featureRequestId, featureId))
        .limit(1)
        .then(res => res[0]);

      let reviewsWithIssues: any[] = [];
      if (pullRequest) {
        const rawReviews = await db
          .select()
          .from(reviewsTable)
          .where(eq(reviewsTable.pullRequestId, pullRequest.id))
          .orderBy(desc(reviewsTable.createdAt));
          
        for (const r of rawReviews) {
          const issues = await db
            .select()
            .from(reviewIssuesTable)
            .where(eq(reviewIssuesTable.reviewId, r.id));
          reviewsWithIssues.push({ ...r, issues });
        }
      }

      return {
        featureRequest,
        prd,
        tasks,
        pullRequest,
        reviews: reviewsWithIssues,
      };
    }),

  approve: protectedProcedure
    .input(z.object({
      featureId: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { featureId, notes } = input;
      
      const [updated] = await db.update(featureRequestsTable)
        .set({
          status: "shipped",
          approvedBy: ctx.user.id,
          shippedAt: new Date(),
          approvalNotes: notes || null,
        })
        .where(eq(featureRequestsTable.id, featureId))
        .returning();
        
      return updated;
    }),

  reject: protectedProcedure
    .input(z.object({
      featureId: z.string(),
      notes: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { featureId, notes } = input;
      
      const [updated] = await db.update(featureRequestsTable)
        .set({
          status: "fix-needed",
        })
        .where(eq(featureRequestsTable.id, featureId))
        .returning();

      const pullRequest = await db
        .select()
        .from(pullRequestsTable)
        .where(eq(pullRequestsTable.featureRequestId, featureId))
        .limit(1)
        .then(res => res[0]);

      if (pullRequest) {
        const latestReview = await db
          .select()
          .from(reviewsTable)
          .where(eq(reviewsTable.pullRequestId, pullRequest.id))
          .orderBy(desc(reviewsTable.createdAt))
          .limit(1)
          .then(res => res[0]);

        if (latestReview) {
          await db.insert(reviewIssuesTable).values({
            reviewId: latestReview.id,
            title: "Human Review Rejection",
            severity: "blocking",
            whyItMatters: "The human reviewer rejected the PR with specific feedback.",
            suggestedFix: notes,
            expectedResult: "Address the reviewer's feedback.",
          });
        }
      }

      return updated;
    }),

  getShipped: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ input }) => {
      const { organizationId } = input;

      const shippedFeatures = await db
        .select()
        .from(featureRequestsTable)
        .where(eq(featureRequestsTable.organizationId, organizationId))
        .orderBy(desc(featureRequestsTable.createdAt));
        
      const results = [];
      
      for (const feature of shippedFeatures) {
        if (feature.status !== "shipped") continue;
        
        const prd = await db.select().from(prdsTable).where(eq(prdsTable.featureRequestId, feature.id)).limit(1).then(r => r[0]);
        const pullRequest = await db.select().from(pullRequestsTable).where(eq(pullRequestsTable.featureRequestId, feature.id)).limit(1).then(r => r[0]);
        
        results.push({
          ...feature,
          timeline: {
            requestedAt: feature.createdAt?.toISOString() || null,
            prdApprovedAt: prd?.updatedAt?.toISOString() || null, 
            prOpenedAt: pullRequest?.createdAt?.toISOString() || null,
            shippedAt: feature.shippedAt?.toISOString() || null,
          }
        });
      }

      return results;
    }),
});