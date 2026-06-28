import { z } from "zod";
import { router, protectedProcedure } from "../../trpc";
import { db, eq, and, or, desc, count, sql } from "@repo/database";
import {
  pullRequestsTable,
  featureRequestsTable,
  prdsTable,
  tasksTable,
  organizationsTable,
  workspaceMembersTable,
  projectsTable,
  reviewsTable,
  reviewIssuesTable,
} from "@repo/database/schema";
import { TRPCError } from "@trpc/server";

async function getOctokitApp() {
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const clientId = process.env.GITHUB_CLIENT_ID;

  if (!appId || !privateKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "GitHub App configuration is missing on the server",
    });
  }

  const { App } = await import("@octokit/app");
  return new App({
    appId,
    privateKey: privateKey.replace(/\\n/g, "\n"),
    oauth: {
      clientId: clientId || "",
      clientSecret: clientSecret || "",
    },
  });
}

async function getInstallationOctokit(userId: string) {
  const membership = await db
    .select({ organizationId: workspaceMembersTable.organizationId })
    .from(workspaceMembersTable)
    .where(eq(workspaceMembersTable.userId, userId))
    .limit(1);

  if (!membership.length || !membership[0]) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "No organization membership found for this user",
    });
  }

  const organizationId = membership[0].organizationId;

  const org = await db
    .select({ githubInstallationId: organizationsTable.githubInstallationId })
    .from(organizationsTable)
    .where(eq(organizationsTable.id, organizationId))
    .limit(1);

  if (!org.length || !org[0] || !org[0].githubInstallationId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "GitHub App is not connected to this organization",
    });
  }

  const installationId = org[0].githubInstallationId;

  const app = await getOctokitApp();
  const octokit = await app.getInstallationOctokit(installationId);
  return { octokit, installationId, organizationId };
}

export const pullRequestsRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    // Resolve user's organization
    const membership = await db
      .select({ organizationId: workspaceMembersTable.organizationId })
      .from(workspaceMembersTable)
      .where(eq(workspaceMembersTable.userId, userId))
      .limit(1);

    if (!membership.length || !membership[0]) {
      return [];
    }

    const organizationId = membership[0].organizationId;

    // Fetch PRs linked to feature requests in this organization, or general PRs
    const prs = await db
      .select({
        id: pullRequestsTable.id,
        githubId: pullRequestsTable.githubId,
        number: pullRequestsTable.number,
        title: pullRequestsTable.title,
        description: pullRequestsTable.description,
        branch: pullRequestsTable.branch,
        status: pullRequestsTable.status,
        url: pullRequestsTable.url,
        featureRequestId: pullRequestsTable.featureRequestId,
        repoOwner: pullRequestsTable.repoOwner,
        repoName: pullRequestsTable.repoName,
        prNumber: pullRequestsTable.prNumber,
        headSha: pullRequestsTable.headSha,
        createdAt: pullRequestsTable.createdAt,
        updatedAt: pullRequestsTable.updatedAt,
        featureRequestTitle: featureRequestsTable.title,
        featureRequestStatus: featureRequestsTable.status,
      })
      .from(pullRequestsTable)
      .leftJoin(
        featureRequestsTable,
        eq(pullRequestsTable.featureRequestId, featureRequestsTable.id)
      )
      .where(
        or(
          eq(featureRequestsTable.organizationId, organizationId),
          sql`${pullRequestsTable.featureRequestId} IS NULL`
        )
      )
      .orderBy(desc(pullRequestsTable.createdAt));

    return prs;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const [pr] = await db
        .select()
        .from(pullRequestsTable)
        .where(eq(pullRequestsTable.id, input.id))
        .limit(1);

      if (!pr) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pull request not found",
        });
      }

      let featureRequest = null;
      let prd = null;
      let tasksList: any[] = [];

      if (pr.featureRequestId) {
        const [fr] = await db
          .select()
          .from(featureRequestsTable)
          .where(eq(featureRequestsTable.id, pr.featureRequestId))
          .limit(1);
        
        if (fr) {
          featureRequest = fr;
          const [p] = await db
            .select()
            .from(prdsTable)
            .where(eq(prdsTable.featureRequestId, fr.id))
            .limit(1);
          
          if (p) {
            prd = p;
            tasksList = await db
              .select()
              .from(tasksTable)
              .where(eq(tasksTable.prdId, p.id))
              .orderBy(tasksTable.order);
          }
        }
      }

      return {
        pr,
        featureRequest,
        prd,
        tasks: tasksList,
      };
    }),
  getReviewHistory: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const [pr] = await db
        .select()
        .from(pullRequestsTable)
        .where(eq(pullRequestsTable.id, input.id))
        .limit(1);

      if (!pr) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pull request not found",
        });
      }

      let featureRequest = null;
      if (pr.featureRequestId) {
        const [fr] = await db
          .select()
          .from(featureRequestsTable)
          .where(eq(featureRequestsTable.id, pr.featureRequestId))
          .limit(1);
        featureRequest = fr;
      }

      try {
        const reviews = await db
          .select()
          .from(reviewsTable)
          .where(eq(reviewsTable.pullRequestId, input.id))
          .orderBy(desc(reviewsTable.createdAt));

        const reviewsWithIssues = await Promise.all(
          reviews.map(async (review) => {
            const issues = await db
              .select()
              .from(reviewIssuesTable)
              .where(eq(reviewIssuesTable.reviewId, review.id))
              .orderBy(desc(reviewIssuesTable.createdAt));
            return {
              ...review,
              issues,
              pullRequest: pr,
              featureRequest,
            };
          })
        );

        return {
          latest: reviewsWithIssues[0] || null,
          history: reviewsWithIssues,
        };
      } catch (err: any) {
        console.error("Failed to fetch review history from database:", err);
        return {
          latest: null,
          history: [],
          error: err.message || "Failed to fetch review history",
        };
      }
    }),

  getOverview: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    
    // Resolve organization
    const membership = await db
      .select({ organizationId: workspaceMembersTable.organizationId })
      .from(workspaceMembersTable)
      .where(eq(workspaceMembersTable.userId, userId))
      .limit(1);

    if (!membership.length || !membership[0]) {
      return {
        metrics: { totalFeatures: 0, prdsGenerated: 0, prsReviewed: 0, shippedFeatures: 0, openPrs: 0, readyForApproval: 0 },
        featureRequests: [],
        projects: [],
        recentActivity: [],
      };
    }

    const organizationId = membership[0].organizationId;

    // Feature Requests count
    const [frCount] = await db
      .select({ val: count() })
      .from(featureRequestsTable)
      .where(eq(featureRequestsTable.organizationId, organizationId));
    
    // PRDs count
    const [prdCount] = await db
      .select({ val: count() })
      .from(prdsTable)
      .innerJoin(
        featureRequestsTable,
        eq(prdsTable.featureRequestId, featureRequestsTable.id)
      )
      .where(eq(featureRequestsTable.organizationId, organizationId));

    // Ready for Approval
    const [readyForApprovalCount] = await db
      .select({ val: count() })
      .from(featureRequestsTable)
      .where(
        and(
          eq(featureRequestsTable.organizationId, organizationId),
          eq(featureRequestsTable.status, "ready-for-approval")
        )
      );

    // Total Pull Requests
    const [prCount] = await db
      .select({ val: count() })
      .from(pullRequestsTable)
      .leftJoin(
        featureRequestsTable,
        eq(pullRequestsTable.featureRequestId, featureRequestsTable.id)
      )
      .where(
        or(
          eq(featureRequestsTable.organizationId, organizationId),
          sql`${pullRequestsTable.featureRequestId} IS NULL`
        )
      );

    // Open PRs
    const [openPrsCount] = await db
      .select({ val: count() })
      .from(pullRequestsTable)
      .leftJoin(
        featureRequestsTable,
        eq(pullRequestsTable.featureRequestId, featureRequestsTable.id)
      )
      .where(
        and(
          eq(pullRequestsTable.status, "open"),
          or(
            eq(featureRequestsTable.organizationId, organizationId),
            sql`${pullRequestsTable.featureRequestId} IS NULL`
          )
        )
      );

    // Shipped (Closed PRs)
    const [shippedCount] = await db
      .select({ val: count() })
      .from(pullRequestsTable)
      .leftJoin(
        featureRequestsTable,
        eq(pullRequestsTable.featureRequestId, featureRequestsTable.id)
      )
      .where(
        and(
          eq(pullRequestsTable.status, "closed"),
          or(
            eq(featureRequestsTable.organizationId, organizationId),
            sql`${pullRequestsTable.featureRequestId} IS NULL`
          )
        )
      );

    // Feature requests list
    const featureRequests = await db
      .select()
      .from(featureRequestsTable)
      .where(eq(featureRequestsTable.organizationId, organizationId))
      .orderBy(desc(featureRequestsTable.createdAt))
      .limit(10);

    // Map feature requests with their GitHub PR number if linked
    const featuresWithPrs = await Promise.all(
      featureRequests.map(async (fr) => {
        const [linkedPr] = await db
          .select({ prNumber: pullRequestsTable.prNumber, url: pullRequestsTable.url })
          .from(pullRequestsTable)
          .where(eq(pullRequestsTable.featureRequestId, fr.id))
          .limit(1);
        return {
          ...fr,
          githubPr: linkedPr ? `#${linkedPr.prNumber}` : undefined,
          githubPrUrl: linkedPr?.url,
        };
      })
    );

    // Projects list
    const projects = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.organizationId, organizationId))
      .orderBy(desc(projectsTable.createdAt))
      .limit(5);

    // Recent Activity Feed
    const latestPRs = await db
      .select({
        title: pullRequestsTable.title,
        status: pullRequestsTable.status,
        createdAt: pullRequestsTable.createdAt,
        prNumber: pullRequestsTable.prNumber,
        id: pullRequestsTable.id,
      })
      .from(pullRequestsTable)
      .leftJoin(
        featureRequestsTable,
        eq(pullRequestsTable.featureRequestId, featureRequestsTable.id)
      )
      .where(
        or(
          eq(featureRequestsTable.organizationId, organizationId),
          sql`${pullRequestsTable.featureRequestId} IS NULL`
        )
      )
      .orderBy(desc(pullRequestsTable.createdAt))
      .limit(5);

    const latestFRs = await db
      .select({
        title: featureRequestsTable.title,
        status: featureRequestsTable.status,
        createdAt: featureRequestsTable.createdAt,
        id: featureRequestsTable.id,
      })
      .from(featureRequestsTable)
      .where(eq(featureRequestsTable.organizationId, organizationId))
      .orderBy(desc(featureRequestsTable.createdAt))
      .limit(5);

    const latestPRDs = await db
      .select({
        status: prdsTable.status,
        updatedAt: prdsTable.updatedAt,
        featureTitle: featureRequestsTable.title,
        featureId: featureRequestsTable.id,
      })
      .from(prdsTable)
      .innerJoin(
        featureRequestsTable,
        eq(prdsTable.featureRequestId, featureRequestsTable.id)
      )
      .where(eq(featureRequestsTable.organizationId, organizationId))
      .orderBy(desc(prdsTable.updatedAt))
      .limit(5);

    const activityItems: Array<{
      id: string;
      type: "pr" | "feature" | "prd";
      title: string;
      description: string;
      timestamp: Date;
      href: string;
    }> = [];

    latestPRs.forEach((pr) => {
      activityItems.push({
        id: `pr-${pr.id}`,
        type: "pr",
        title: `Pull Request #${pr.prNumber}`,
        description: `"${pr.title}" was ${pr.status === "open" ? "opened" : "updated"}`,
        timestamp: pr.createdAt || new Date(),
        href: `/dashboard/prs/${pr.id}`,
      });
    });

    latestFRs.forEach((fr) => {
      activityItems.push({
        id: `fr-${fr.id}`,
        type: "feature",
        title: "Feature Request Created",
        description: `"${fr.title}" is currently ${fr.status}`,
        timestamp: fr.createdAt || new Date(),
        href: `/dashboard/feature-requests/${fr.id}`,
      });
    });

    latestPRDs.forEach((prd) => {
      activityItems.push({
        id: `prd-${prd.featureId}`,
        type: "prd",
        title: `PRD ${prd.status === "approved" ? "Approved" : "Drafted"}`,
        description: `Product Requirements Document for "${prd.featureTitle}"`,
        timestamp: prd.updatedAt || new Date(),
        href: `/dashboard/feature-requests/${prd.featureId}`,
      });
    });

    activityItems.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return {
      metrics: {
        totalFeatures: frCount?.val || 0,
        prdsGenerated: prdCount?.val || 0,
        prsReviewed: prCount?.val || 0,
        shippedFeatures: shippedCount?.val || 0,
        openPrs: openPrsCount?.val || 0,
        readyForApproval: readyForApprovalCount?.val || 0,
      },
      featureRequests: featuresWithPrs,
      projects,
      recentActivity: activityItems.slice(0, 10),
    };
  }),
});
