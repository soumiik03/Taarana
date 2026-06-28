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
  clarificationQuestionsTable,
} from "@repo/database/schema";
import { eq } from "drizzle-orm";
import { getPRDiff } from "../utils/pr-files";
import { chunkDiff } from "../utils/chunk-code";
import { generateReviewForChunk, consolidateReview } from "../utils/generate-review";
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
    const { pr, featureRequest, prd, org, tasks, clarifications, previousReviews, resolvedFeatureRequestId } = await step.run(
      `fetch-context-${commitSha}`,
      async () => {
        const [pr] = await db.select().from(pullRequestsTable).where(eq(pullRequestsTable.githubId, prId));
        
        if (!pr) {
          throw new Error("Missing PR context");
        }

        const targetFeatureRequestId = featureRequestId || pr.featureRequestId;
        let featureRequest = null;
        let prd = null;
        let org = null;
        let tasks: any[] = [];
        let clarifications: any[] = [];
        let previousReviews: any[] = [];

        if (targetFeatureRequestId) {
          [featureRequest] = await db.select().from(featureRequestsTable).where(eq(featureRequestsTable.id, targetFeatureRequestId));
          if (featureRequest) {
            clarifications = await db.select().from(clarificationQuestionsTable).where(eq(clarificationQuestionsTable.featureRequestId, targetFeatureRequestId));
            [prd] = await db.select().from(prdsTable).where(eq(prdsTable.featureRequestId, targetFeatureRequestId));
            [org] = await db.select().from(organizationsTable).where(eq(organizationsTable.id, featureRequest.organizationId!));
            if (prd) {
              tasks = await db.select().from(tasksTable).where(eq(tasksTable.prdId, prd.id));
            }
          }
        }

        // Fetch review history (oldest first)
        const rawReviews = await db
          .select()
          .from(reviewsTable)
          .where(eq(reviewsTable.pullRequestId, pr.id))
          .orderBy(reviewsTable.createdAt);
          
        for (const r of rawReviews) {
          const issues = await db
            .select()
            .from(reviewIssuesTable)
            .where(eq(reviewIssuesTable.reviewId, r.id));
          previousReviews.push({ ...r, issues });
        }

        return { pr, featureRequest, prd, org, tasks, clarifications, previousReviews, resolvedFeatureRequestId: targetFeatureRequestId };
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
    const allIssues: { filename: string | null; line: number | null; title: string; severity: string; whyItMatters: string; suggestedFix: string; expectedResult: string; requirementReference?: string }[] = [];

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

      if (result && result.issues) {
        result.issues.forEach((issue: any) => {
          allIssues.push({
            title: issue.title,
            severity: issue.severity,
            whyItMatters: issue.whyItMatters,
            filename: issue.file || chunk.filename,
            line: issue.line,
            suggestedFix: issue.suggestedFix,
            expectedResult: issue.expectedResult,
            requirementReference: issue.requirementReference
          });
        });
      }
    }

    // Step 5: Consolidate review using a second AI pass
    const consolidationResult = await step.run(`consolidate-review-${commitSha}`, async () => {
      // Format clarifications context
      const clarificationsStr = clarifications && clarifications.length > 0
        ? clarifications.map((c: any) => `Q: ${c.question}\nA: ${c.answer || "Unanswered"}`).join("\n\n")
        : "No clarifications found.";

      // Format previous reviews context
      const previousReviewsStr = previousReviews && previousReviews.length > 0
        ? previousReviews.map((r: any, idx: number) => {
            const issuesStr = r.issues && r.issues.length > 0
              ? r.issues.map((i: any) => `- [${i.severity.toUpperCase()}] ${i.title} (in ${i.file || "N/A"})`).join("\n")
              : "No issues reported.";
            return `Review #${idx + 1} (Score: ${r.score}/100, Status: ${r.status}):\nOverall Assessment:\n${r.overallAssessment}\nIssues:\n${issuesStr}`;
          }).join("\n\n---\n\n")
        : "No previous reviews found.";

      // Format raw issues context
      const rawIssuesStr = allIssues.length > 0
        ? allIssues.map((i: any, idx: number) => {
            return `Raw Issue #${idx + 1}:\nTitle: ${i.title}\nSeverity: ${i.severity}\nFile: ${i.filename}:${i.line}\nWhy it matters: ${i.whyItMatters}\nSuggested Fix: ${i.suggestedFix}\nExpected Result: ${i.expectedResult}\nRequirement Reference: ${i.requirementReference || "N/A"}`;
          }).join("\n\n")
        : "No raw issues found.";

      // Format full diff context
      const fullDiffStr = files.map(f => `File: ${f.filename}\n${f.patch}`).join("\n\n");

      return consolidateReview({
        prdContext: prdContext.join("\n\n---\n\n"),
        tasksContext: tasksListStr,
        featureRequest: featureRequest ? `Title: ${featureRequest.title}\nDescription: ${featureRequest.description}` : "No feature request found.",
        clarifications: clarificationsStr,
        previousReviews: previousReviewsStr,
        rawIssues: rawIssuesStr,
        fullDiff: fullDiffStr,
        commitSha,
      });
    });

    const score = consolidationResult.score;
    const overallStatus = consolidationResult.approved ? "ready-for-approval" : "fix-needed";
    const mergedAssessment = consolidationResult.overallAssessment;
    const deduplicatedIssues = consolidationResult.outstandingIssues;

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
            severity: (issue.severity || "suggestion").toLowerCase(),
            whyItMatters: issue.whyItMatters,
            file: issue.file,
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
      // If approved, we pass zero outstanding comments to prevent any comment noise on GitHub.
      // Suggestions/recommendations are fully shown in the overall assessment markdown.
      const issuesForGitHub = consolidationResult.approved ? [] : deduplicatedIssues;

      await postReviewComments(
        githubInstallationId,
        pr.repoOwner,
        pr.repoName,
        pr.prNumber,
        commitSha,
        mergedAssessment,
        overallStatus === "fix-needed",
        issuesForGitHub.map((issue) => ({
          filename: issue.file || "",
          line: issue.line,
          comment: `**Title:** ${issue.title}
**Severity:** ${issue.severity.toUpperCase()}

**Why It Matters:**
${issue.whyItMatters}

**Suggested Fix:**
${issue.suggestedFix}

**Expected Result:**
${issue.expectedResult}`,
          type: (issue.severity || "suggestion").toLowerCase() === "blocking" ? "blocking" : "non-blocking",
        }))
      );
      console.log(`[Review Run] GitHub review created successfully for commit: ${commitSha}`);
    });

    // Step 10: Update feature request status based on current run results only
    if (resolvedFeatureRequestId) {
      await step.run(`update-status-${commitSha}`, async () => {
        console.log(`[Review Run] Updating feature request status to ${overallStatus} for ID: ${resolvedFeatureRequestId}...`);
        await db
          .update(featureRequestsTable)
          .set({
            status: overallStatus,
            updatedAt: new Date(),
          })
          .where(eq(featureRequestsTable.id, resolvedFeatureRequestId));
        console.log(`[Review Run] Dashboard data and feature request status updated for ID: ${resolvedFeatureRequestId}`);
      });
    }

    return {
      totalIssues: deduplicatedIssues.length,
      blockingCount: deduplicatedIssues.filter((i) => (i.severity || "").toLowerCase() === "blocking").length,
      score,
      status: overallStatus,
    };
  }
);
