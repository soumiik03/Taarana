import { db, eq, or } from "@repo/database";
import { pullRequestsTable, featureRequestsTable, prdsTable, tasksTable } from "@repo/database/schema";
import { triggerReview } from "./trigger-review";

// Extracts feature request ID by matching UUIDs found in text against feature request ID, PRD ID, or task ID.
async function findFeatureRequestFromRefAndText(branch: string, title: string, body: string): Promise<string | null> {
  const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
  const combinedText = `${branch} ${title} ${body}`;
  const matches = combinedText.match(uuidRegex) || [];
  
  for (const match of matches) {
    const uuidVal = match.toLowerCase();
    
    // 1. Check if it's a feature request ID
    const [fr] = await db
      .select({ id: featureRequestsTable.id })
      .from(featureRequestsTable)
      .where(eq(featureRequestsTable.id, uuidVal))
      .limit(1);
    if (fr) {
      console.log(`[Link] Match found: UUID ${uuidVal} is a Feature Request ID.`);
      return fr.id;
    }
    
    // 2. Check if it's a PRD ID
    const [prd] = await db
      .select({ featureRequestId: prdsTable.featureRequestId })
      .from(prdsTable)
      .where(eq(prdsTable.id, uuidVal))
      .limit(1);
    if (prd) {
      console.log(`[Link] Match found: UUID ${uuidVal} is a PRD ID linking to Feature Request ID ${prd.featureRequestId}.`);
      return prd.featureRequestId;
    }
    
    // 3. Check if it's a Task ID
    const [task] = await db
      .select({ prdId: tasksTable.prdId })
      .from(tasksTable)
      .where(eq(tasksTable.id, uuidVal))
      .limit(1);
    if (task) {
      const [prdOfTask] = await db
        .select({ featureRequestId: prdsTable.featureRequestId })
        .from(prdsTable)
        .where(eq(prdsTable.id, task.prdId))
        .limit(1);
      if (prdOfTask) {
        console.log(`[Link] Match found: UUID ${uuidVal} is a Task ID. PRD ID: ${task.prdId}, Feature Request ID: ${prdOfTask.featureRequestId}.`);
        return prdOfTask.featureRequestId;
      }
    }
  }
  
  return null;
}

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
    // 1. Try UUID-based linking
    featureRequestId = await findFeatureRequestFromRefAndText(pr.head.ref, pr.title, pr.body ?? "");

    // 2. Fallback to title/substring matching against all feature requests
    if (!featureRequestId) {
      console.log("Querying all features...");
      const allFeatures = await db
        .select({ id: featureRequestsTable.id, title: featureRequestsTable.title })
        .from(featureRequestsTable);
      console.log(`Finished querying all features, found ${allFeatures.length}`);

      for (const feature of allFeatures) {
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
