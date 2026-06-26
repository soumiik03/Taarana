import { db, eq, or } from "@repo/database";
import { pullRequestsTable, featureRequestsTable } from "@repo/database/schema";
import { triggerReview } from "./trigger-review";

export async function savePullRequestAndLinkFeature(payload: any) {
  const pr = payload.pull_request;

  // Check if we already have it
  const existingPr = await db
    .select()
    .from(pullRequestsTable)
    .where(eq(pullRequestsTable.githubId, pr.id))
    .limit(1);

  let featureRequestId: string | null = existingPr[0]?.featureRequestId ?? null;

  // Try to link it if not already linked
  if (!featureRequestId) {
    const openFeatures = await db
      .select({ id: featureRequestsTable.id, title: featureRequestsTable.title })
      .from(featureRequestsTable)
      .where(
        or(
          eq(featureRequestsTable.status, "pending"),
          eq(featureRequestsTable.status, "clarifying"),
          eq(featureRequestsTable.status, "ready")
        )
      );

    for (const feature of openFeatures) {
      const matchBranch = pr.head.ref.toLowerCase().includes(feature.id.toLowerCase()) || 
                          pr.head.ref.toLowerCase().includes(feature.title.toLowerCase().replace(/\s+/g, '-'));
      const matchBody = pr.body?.toLowerCase().includes(feature.id.toLowerCase()) || 
                        pr.body?.toLowerCase().includes(feature.title.toLowerCase());
      const matchTitle = pr.title.toLowerCase().includes(feature.id.toLowerCase()) ||
                         pr.title.toLowerCase().includes(feature.title.toLowerCase());

      if (matchBranch || matchBody || matchTitle) {
        featureRequestId = feature.id;
        break;
      }
    }
  }

  const repoOwner = payload.repository.owner.login;
  const repoName = payload.repository.name;
  const prNumber = pr.number;
  const headSha = pr.head.sha;

  // Upsert the PR
  if (existingPr.length > 0) {
    await db
      .update(pullRequestsTable)
      .set({
        title: pr.title,
        description: pr.body ?? "",
        branch: pr.head.ref,
        status: pr.state,
        url: pr.html_url,
        featureRequestId: featureRequestId,
        repoOwner,
        repoName,
        prNumber,
        headSha,
        updatedAt: new Date(),
      })
      .where(eq(pullRequestsTable.githubId, pr.id));
  } else {
    await db
      .insert(pullRequestsTable)
      .values({
        githubId: pr.id,
        number: pr.number,
        title: pr.title,
        description: pr.body ?? "",
        branch: pr.head.ref,
        status: pr.state,
        url: pr.html_url,
        featureRequestId: featureRequestId,
        repoOwner,
        repoName,
        prNumber,
        headSha,
      });
  }

  // Trigger the background review process
  await triggerReview(pr.id, featureRequestId);

  return { success: true };
}
