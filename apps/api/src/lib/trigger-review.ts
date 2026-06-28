import { inngest } from "../inngest/client";
import { prReceivedEvent } from "@repo/inngest";
import { logger } from "@repo/logger";

export async function triggerReview(prId: number, featureRequestId: string | null, installationId?: number, commitSha?: string) {
  logger.info(`[Webhook/Trigger] triggerReview called for PR ID: ${prId}, Feature Request ID: ${featureRequestId}, Installation ID: ${installationId}, Commit SHA: ${commitSha}`);
  logger.info("Calling inngest.send...");
  await inngest.send({
    name: "github/pr.received",
    data: {
      prId,
      featureRequestId,
      installationId,
      commitSha,
    },
  });
  logger.info("Finished inngest.send successfully");
}
