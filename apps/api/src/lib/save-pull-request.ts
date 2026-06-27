import { db, eq, or } from "@repo/database";
import { pullRequestsTable, featureRequestsTable } from "@repo/database/schema";
import { triggerReview } from "./trigger-review";

export async function savePullRequestAndLinkFeature(payload: any) {
  console.log("Started savePullRequestAndLinkFeature inside function");
  const pr = payload.pull_request;

  console.log("Checking if PR already exists...");
  // Check if we already have it
  const existingPr = await db
    .select()
    .from(pullRequestsTable)
    .where(eq(pullRequestsTable.githubId, pr.id))
    .limit(1);
  console.log("Finished checking existing PR");

  let featureRequestId: string | null = existingPr[0]?.featureRequestId ?? null;

  // Try to link it if not already linked
  if (!featureRequestId) {
    console.log("Querying open features...");
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
    console.log(`Finished querying open features, found ${openFeatures.length}`);

    for (const feature of openFeatures) {
      const matchBranch = pr.head.ref.toLowerCase().includes(feature.id.toLowerCase()) ||
        pr.head.ref.toLowerCase().includes(feature.title.toLowerCase().replace(/\s+/g, '-'));
      const body = pr.body?.toLowerCase() ?? "";
      const matchBody = body.includes(feature.id.toLowerCase()) ||
        body.includes(feature.title.toLowerCase());
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

  console.log("Attempting database upsert...");
  // Upsert the PR
  if (existingPr.length > 0) {
    console.log("Updating existing PR");
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
    console.log("Finished updating PR");
  } else {
    console.log("Inserting new PR with values:", {
      githubId: pr.id,
      number: pr.number,
      title: pr.title,
      repoOwner,
      repoName,
      prNumber,
      headSha
    });
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
    console.log("Finished inserting PR");
  }

  const installationId = payload.installation?.id;

  console.log(`[Webhook] Webhook received for PR #${prNumber} on repo ${repoOwner}/${repoName}. Head commit SHA: ${headSha}`);
  console.log(`[Webhook] Triggering review for PR ID: ${pr.id}, Feature Request ID: ${featureRequestId}, Installation ID: ${installationId}, Commit SHA: ${headSha}`);
  // Trigger the background review process
  await triggerReview(pr.id, featureRequestId, installationId, headSha);
  console.log("[Webhook] Finished triggering review");

  return { success: true };
}
