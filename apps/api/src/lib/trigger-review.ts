import { inngest } from "../inngest/client";
import { prReceivedEvent } from "@repo/inngest";

export async function triggerReview(prId: number, featureRequestId: string | null) {
  await inngest.send(prReceivedEvent.create({
    data: {
      prId,
      featureRequestId,
    },
  }));
}
