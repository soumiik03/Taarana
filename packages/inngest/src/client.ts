import { Inngest, eventType, staticSchema } from "inngest";

export const prReceivedEvent = eventType("github/pr.received", {
  schema: staticSchema<{
    data: {
      prId: number;
      featureRequestId: string | null;
      installationId?: number;
      commitSha?: string;
    };
  }>(),
});

export const inngest = new Inngest({ id: "taarana" });
