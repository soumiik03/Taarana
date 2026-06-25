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
    const { prId, featureRequestId } = event.data as {
      prId: number;
      featureRequestId: string;
    };

    // Step 1: Fetch everything we need from DB
    const { pr, featureRequest, prd, org } = await step.run("fetch-context", async () => {
      const [pr] = await db.select().from(pullRequestsTable).where(eq(pullRequestsTable.githubId, prId));
      const [featureRequest] = await db.select().from(featureRequestsTable).where(eq(featureRequestsTable.id, featureRequestId));
      
      if (!pr || !featureRequest) {
        throw new Error("Missing PR or feature request context");
      }
      
      const [prd] = await db.select().from(prdsTable).where(eq(prdsTable.featureRequestId, featureRequestId));
      
      if (!prd) {
         throw new Error("Missing PRD");
      }

      const [org] = await db.select().from(organizationsTable).where(eq(organizationsTable.id, featureRequest.organizationId!));

      if (!org) {
        throw new Error("Missing organization context");
      }

      return { pr, featureRequest, prd, org };
    });

    // Step 2: Fetch the diff from GitHub
    const files = await step.run("fetch-diff", async () => {
      return getPRDiff(
        org.githubInstallationId!,
        pr.repoOwner,
        pr.repoName,
        pr.prNumber
      );
    });

    // Step 3: Chunk the diff
    const chunks = chunkDiff(files);

    // Step 4: Run AI review on each chunk using the full PRD
    const allIssues: { filename: string; line: number | null; comment: string; type: string }[] = [];

    for (const chunk of chunks) {
      const issues = await step.run(`review-chunk-${chunk.filename}`, async () => {
        return generateReviewForChunk(prd as Record<string, any>, chunk.filename, chunk.chunk);
      });

      issues.forEach((issue: ReviewIssue) => {
        allIssues.push({ ...issue, filename: chunk.filename });
      });
    }

    // Step 5: Post comments to GitHub
    await step.run("post-comments", async () => {
      await postReviewComments(
        org.githubInstallationId!,
        pr.repoOwner,
        pr.repoName,
        pr.prNumber,
        pr.headSha,
        allIssues
      );
    });

    // Step 6: Update feature request status based on whether blocking issues exist
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

    return {
      totalIssues: allIssues.length,
      blockingCount: allIssues.filter((i) => i.type === "blocking").length,
    };
  }
);
