import { inngest } from "../inngest/client";
import { prReceivedEvent } from "@repo/inngest";

export async function triggerReview(prId: number, featureRequestId: string | null, installationId?: number, commitSha?: string) {
  console.log(`[Webhook/Trigger] triggerReview called for PR ID: ${prId}, Feature Request ID: ${featureRequestId}, Installation ID: ${installationId}, Commit SHA: ${commitSha}`);
  console.log("Calling inngest.send...");
  await inngest.send({
    name: "github/pr.received",
    data: {
      prId,
      featureRequestId,
      installationId,
      commitSha,
    },
  });
  console.log("Finished inngest.send successfully");
}
