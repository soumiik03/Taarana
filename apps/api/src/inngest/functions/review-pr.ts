import { inngest } from "../client";
import { db } from "@repo/database";
import {
  pullRequestsTable,
  featureRequestsTable,
  prdsTable,
  organizationsTable,
  tasksTable,
  reviewsTable,
  reviewIssuesTable,
} from "@repo/database/schema";
import { eq } from "drizzle-orm";
import { getPRDiff } from "../utils/pr-files";
import { chunkDiff } from "../utils/chunk-code";
import { generateReviewForChunk } from "../utils/generate-review";
import { postReviewComments } from "../utils/pr-comment";

export const reviewPRFunction = inngest.createFunction(
  { id: "review-pr", name: "AI QA Review PR", triggers: [{ event: "github/pr.received" }] },
  async ({ event, step }) => {
    const { prId, featureRequestId, installationId, commitSha: eventCommitSha } = event.data as {
      prId: number;
      featureRequestId: string | null;
      installationId?: number;
      commitSha?: string;
    };

    // Pre-resolve commitSha if not provided in event payload
    let commitSha = eventCommitSha;
    if (!commitSha) {
      const [prRecord] = await db.select().from(pullRequestsTable).where(eq(pullRequestsTable.githubId, prId));
      commitSha = prRecord?.headSha;
    }
    if (!commitSha) {
      throw new Error("Unable to resolve commit SHA");
    }

    console.log(`[Review Run] Started review pipeline for PR ID: ${prId}, Commit: ${commitSha}`);

    // Step 1: Fetch everything we need from DB
    const { pr, featureRequest, prd, org, tasks } = await step.run(
      `fetch-context-${commitSha}`,
      async () => {
        const [pr] = await db.select().from(pullRequestsTable).where(eq(pullRequestsTable.githubId, prId));
        
        if (!pr) {
          throw new Error("Missing PR context");
        }

        let featureRequest = null;
        let prd = null;
        let org = null;
        let tasks: any[] = [];

        if (featureRequestId) {
          [featureRequest] = await db.select().from(featureRequestsTable).where(eq(featureRequestsTable.id, featureRequestId));
          if (featureRequest) {
            [prd] = await db.select().from(prdsTable).where(eq(prdsTable.featureRequestId, featureRequestId));
            [org] = await db.select().from(organizationsTable).where(eq(organizationsTable.id, featureRequest.organizationId!));
            if (prd) {
              tasks = await db.select().from(tasksTable).where(eq(tasksTable.prdId, prd.id));
            }
          }
        }

        return { pr, featureRequest, prd, org, tasks };
      }
    );
    console.log(`[Review Run] Context fetched for PR #${pr.prNumber} (${pr.repoOwner}/${pr.repoName})`);

    const githubInstallationId = org?.githubInstallationId || installationId;
    if (!githubInstallationId) {
      throw new Error("Missing githubInstallationId to fetch PR diff");
    }

    // Step 2: Fetch the diff from GitHub
    const files = await step.run(`fetch-diff-${commitSha}`, async () => {
      return getPRDiff(
        githubInstallationId,
        pr.repoOwner,
        pr.repoName,
        pr.prNumber
      );
    });
    console.log(`[Review Run] Diff fetched. Found ${files.length} changed files.`);

    // Step 3: Chunk the diff
    const chunks = chunkDiff(files);

    // Step 4: Run AI review on each chunk using the full PRD and task list context
    const allIssues: { filename: string | null; line: number | null; title: string; severity: string; whyItMatters: string; suggestedFix: string; expectedResult: string }[] = [];
    let mergedAssessment = "";

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

    const tasksListStr = tasks && tasks.length > 0 
      ? tasks.map((t: any) => `- Task: ${t.title}\n  Description: ${t.description || "None"}\n  Status: ${t.status}`).join("\n")
      : "No engineering tasks found.";

    for (const chunk of chunks) {
      const result = await step.run(`review-chunk-${commitSha}-${chunk.filename}`, async () => {
        return generateReviewForChunk(prdContext, tasksListStr, chunk.filename, chunk.chunk, commitSha);
      });

      if (result) {
        if (result.overallAssessment) {
          mergedAssessment = mergedAssessment 
            ? `${mergedAssessment}\n\n${result.overallAssessment}`
            : result.overallAssessment;
        }
        if (result.issues) {
          result.issues.forEach((issue: any) => {
            allIssues.push({
              title: issue.title,
              severity: issue.severity,
              whyItMatters: issue.whyItMatters,
              filename: issue.file || chunk.filename,
              line: issue.line,
              suggestedFix: issue.suggestedFix,
              expectedResult: issue.expectedResult,
            });
          });
        }
      }
    }

    // Step 5: Deduplicate findings (same title and same file)
    const uniqueIssuesMap = new Map<string, typeof allIssues[number]>();
    for (const issue of allIssues) {
      const fileKey = issue.filename || "";
      const key = `${issue.title.toLowerCase().trim()}|${fileKey.toLowerCase().trim()}`;
      if (!uniqueIssuesMap.has(key)) {
        uniqueIssuesMap.set(key, issue);
      }
    }
    const deduplicatedIssues = Array.from(uniqueIssuesMap.values());

    // Step 6: Calculate Review Score
    let score = 100;
    for (const issue of deduplicatedIssues) {
      const sev = issue.severity.toLowerCase();
      if (sev === "blocking") score -= 25;
      else if (sev === "high") score -= 15;
      else if (sev === "medium") score -= 8;
      else if (sev === "low") score -= 3;
      else if (sev === "suggestion") score -= 1;
    }
    score = Math.max(0, Math.min(100, score));
    console.log(`[Review Run] Review score calculated: ${score}/100. Issues count: ${deduplicatedIssues.length}`);

    const hasBlocking = deduplicatedIssues.some((i) => i.severity.toLowerCase() === "blocking");
    const overallStatus = hasBlocking ? "fix-needed" : "ready-for-approval";

    // Enforce approval text when zero blocking issues exist
    if (!hasBlocking && !mergedAssessment.includes("No blocking issues found. Ready for approval.")) {
      if (!mergedAssessment || mergedAssessment === "Failed to parse overall assessment." || mergedAssessment === "No overall assessment provided.") {
        mergedAssessment = "No blocking issues found. Ready for approval.";
      } else {
        mergedAssessment = `${mergedAssessment}\n\nNo blocking issues found. Ready for approval.`;
      }
    }

    // Step 7: Save Review to database
    const newReview = await step.run(`save-review-${commitSha}`, async () => {
      console.log(`[Review Run] Saving review to database for commit: ${commitSha}...`);
      const [newReview] = await db
        .insert(reviewsTable)
        .values({
          pullRequestId: pr.id,
          commitSha: commitSha,
          overallAssessment: mergedAssessment,
          score,
          status: overallStatus,
        })
        .returning();

      if (!newReview) {
        throw new Error("Failed to insert review into database");
      }
      console.log(`[Review Run] Review saved successfully with database ID: ${newReview.id}`);
      return newReview;
    });

    // Step 8: Save Review Issues to database
    if (deduplicatedIssues.length > 0) {
      await step.run(`save-review-issues-${commitSha}`, async () => {
        console.log(`[Review Run] Inserting ${deduplicatedIssues.length} review issues for Review ID: ${newReview.id}...`);
        await db.insert(reviewIssuesTable).values(
          deduplicatedIssues.map((issue) => ({
            reviewId: newReview.id,
            title: issue.title,
            severity: issue.severity.toLowerCase(),
            whyItMatters: issue.whyItMatters,
            file: issue.filename,
            line: issue.line,
            suggestedFix: issue.suggestedFix,
            expectedResult: issue.expectedResult,
          }))
        );
        console.log("[Review Run] Review issues inserted successfully into database.");
      });
    }

    // Step 9: Post comments to GitHub
    await step.run(`github-review-${commitSha}`, async () => {
      console.log(`[Review Run] Creating a new GitHub review for commit: ${commitSha}...`);
      await postReviewComments(
        githubInstallationId,
        pr.repoOwner,
        pr.repoName,
        pr.prNumber,
        commitSha,
        mergedAssessment,
        hasBlocking,
        deduplicatedIssues.map((issue) => ({
          filename: issue.filename || "",
          line: issue.line,
          comment: `**Title:** ${issue.title}
**Severity:** ${issue.severity.toUpperCase()}

**Why It Matters:**
${issue.whyItMatters}

**Suggested Fix:**
${issue.suggestedFix}

**Expected Result:**
${issue.expectedResult}`,
          type: issue.severity.toLowerCase() === "blocking" ? "blocking" : "non-blocking",
        }))
      );
      console.log(`[Review Run] GitHub review created successfully for commit: ${commitSha}`);
    });

    // Step 10: Update feature request status based on current run results only
    if (featureRequestId) {
      await step.run(`update-status-${commitSha}`, async () => {
        console.log(`[Review Run] Updating feature request status to ${overallStatus} for ID: ${featureRequestId}...`);
        await db
          .update(featureRequestsTable)
          .set({
            status: overallStatus,
            updatedAt: new Date(),
          })
          .where(eq(featureRequestsTable.id, featureRequestId));
        console.log(`[Review Run] Dashboard data and feature request status updated for ID: ${featureRequestId}`);
      });
    }

    return {
      totalIssues: deduplicatedIssues.length,
      blockingCount: deduplicatedIssues.filter((i) => i.severity.toLowerCase() === "blocking").length,
      score,
      status: overallStatus,
    };
  }
);
