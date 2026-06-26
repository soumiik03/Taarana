import { inngest } from "../client";
import { db } from "@repo/database";
import { pullRequestsTable, featureRequestsTable, prdsTable, organizationsTable } from "@repo/database/schema";
import { eq } from "drizzle-orm";
import { getPRDiff } from "../utils/pr-files";
import { chunkDiff } from "../utils/chunk-code";
import { generateReviewForChunk, ReviewIssue } from "../utils/generate-review";
import { postReviewComments } from "../utils/pr-comment";

export const reviewPRFunction = inngest.createFunction(
  { id: "review-pr", name: "AI QA Review PR", triggers: [{ event: "github/pr.received" }] },
  async ({ event, step }) => {
    const { prId, featureRequestId, installationId } = event.data as {
      prId: number;
      featureRequestId: string | null;
      installationId?: number;
    };

    // Step 1: Fetch everything we need from DB
    const { pr, featureRequest, prd, org } = await step.run("fetch-context", async () => {
      const [pr] = await db.select().from(pullRequestsTable).where(eq(pullRequestsTable.githubId, prId));
      
      if (!pr) {
        throw new Error("Missing PR context");
      }

      let featureRequest = null;
      let prd = null;
      let org = null;

      if (featureRequestId) {
        [featureRequest] = await db.select().from(featureRequestsTable).where(eq(featureRequestsTable.id, featureRequestId));
        if (featureRequest) {
          [prd] = await db.select().from(prdsTable).where(eq(prdsTable.featureRequestId, featureRequestId));
          [org] = await db.select().from(organizationsTable).where(eq(organizationsTable.id, featureRequest.organizationId!));
        }
      }

      return { pr, featureRequest, prd, org };
    });

    const githubInstallationId = org?.githubInstallationId || installationId;
    if (!githubInstallationId) {
      throw new Error("Missing githubInstallationId to fetch PR diff");
    }

    // Step 2: Fetch the diff from GitHub
    const files = await step.run("fetch-diff", async () => {
      return getPRDiff(
        githubInstallationId,
        pr.repoOwner,
        pr.repoName,
        pr.prNumber
      );
    });

    // Step 3: Chunk the diff
    const chunks = chunkDiff(files);

    // Step 4: Run AI review on each chunk using the full PRD
    const allIssues: { filename: string; line: number | null; comment: string; type: string }[] = [];

    const prdContext = prd ? [
      `Problem Statement: ${(prd as any).problemStatement || "None"}`,
      `Goals: ${((prd as any).goals || []).join(", ")}`,
      `Acceptance Criteria: ${((prd as any).acceptanceCriteria || []).join(", ")}`,
      `User Stories: ${((prd as any).userStories || []).join(", ")}`,
      `Edge Cases: ${((prd as any).edgeCases || []).join(", ")}`,
      `Non-Goals: ${((prd as any).nonGoals || []).join(", ")}`,
      `Success Metrics: ${((prd as any).successMetrics || []).join(", ")}`
    ] : [
      `PR Title: ${pr.title || "None"}`,
      `PR Description: ${pr.description || "None"}`
    ];

    for (const chunk of chunks) {
      const issues = await step.run(`review-chunk-${chunk.filename}`, async () => {
        return generateReviewForChunk(prdContext, chunk.filename, chunk.chunk);
      });

      issues.forEach((issue: ReviewIssue) => {
        allIssues.push({ ...issue, filename: chunk.filename });
      });
    }

    // Step 5: Post comments to GitHub
    await step.run("post-comments", async () => {
      await postReviewComments(
        githubInstallationId,
        pr.repoOwner,
        pr.repoName,
        pr.prNumber,
        pr.headSha,
        allIssues
      );
    });

    // Step 6: Update feature request status based on whether blocking issues exist
    if (featureRequestId) {
      await step.run("update-status", async () => {
        const hasBlockingIssues = allIssues.some((i) => i.type === "blocking");

        await db
          .update(featureRequestsTable)
          .set({
            status: hasBlockingIssues ? "fix-needed" : "ready-for-approval",
            updatedAt: new Date(),
          })
          .where(eq(featureRequestsTable.id, featureRequestId));
      });
    }

    return {
      totalIssues: allIssues.length,
      blockingCount: allIssues.filter((i) => i.type === "blocking").length,
    };
  }
);
