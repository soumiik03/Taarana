import { inngest, prReceivedEvent } from "../../inngest/client";

export async function triggerReview(prId: number, featureRequestId: string | null) {
  await inngest.send(prReceivedEvent.create({
    data: {
      prId,
      featureRequestId,
    },
  }));
}
