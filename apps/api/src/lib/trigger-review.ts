import { inngest } from "../inngest/client";
import { prReceivedEvent } from "@repo/inngest";

export async function triggerReview(prId: number, featureRequestId: string | null, installationId?: number) {
  console.log("Started triggerReview inside function");
  console.log("Calling inngest.send...");
  await inngest.send({
    name: "github/pr.received",
    data: {
      prId,
      featureRequestId,
      installationId,
    },
  });
  console.log("Finished inngest.send");
}
