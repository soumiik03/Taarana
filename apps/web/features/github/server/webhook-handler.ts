import { savePullRequestAndLinkFeature } from "../../reviews/server/save-pull-request";
import type { GitHubPullRequestPayload } from "../../reviews/types/review";

export async function webhookHandler(payload: any) {
  // We only process pull_request events, specifically opened, synchronize, and reopened.
  // The routing level should ideally pass only PR payloads here, but we can double check.
  const action = payload.action;

  if (["opened", "synchronize", "reopened"].includes(action)) {
    const prPayload = payload as GitHubPullRequestPayload;
    await savePullRequestAndLinkFeature(prPayload);
  } else {
    console.log(`[GitHub Webhook] Ignoring pull_request action: ${action}`);
  }

  return { success: true };
}
