import { inngest } from "../client";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { db, eq } from "@repo/database";
import {
  featureRequestsTable,
  clarificationQuestionsTable,
} from "@repo/database/schema";
import { OPENROUTER_MODEL, asStringArray, parseJsonFromText } from "../utils/ai";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const clarifyFeatureRequest = inngest.createFunction(
  { id: "clarify-feature-request", triggers: [{ event: "feature-request/created" }] },
  async ({ event, step }) => {
    const { featureRequestId } = event.data;
    console.log(`[Clarification Inngest] Started clarification workflow for Feature Request ID: ${featureRequestId}`);

    const featureRequest = await step.run(
      "fetch-feature-request",
      async () => {
        const result = await db
          .select()
          .from(featureRequestsTable)
          .where(eq(featureRequestsTable.id, featureRequestId));
        return result[0];
      }
    );

    if (!featureRequest) {
      console.error(`[Clarification Inngest] Feature request with ID: ${featureRequestId} not found in database.`);
      return { error: "Feature request not found" };
    }
    console.log(`[Clarification Inngest] Fetched request details: title="${featureRequest.title}", current status=${featureRequest.status}`);

    const aiResponse = await step.run("generate-clarification-questions", async () => {
      if (!process.env.OPENROUTER_API_KEY) {
        throw new Error("OPENROUTER_API_KEY is not configured");
      }

      const prompt = `You are a product manager analyzing a new feature request.
Title: ${featureRequest.title}
Description: ${featureRequest.description}

If the feature request is clear enough to be actionable by a development team, return an empty JSON array [].
If the feature request needs clarification, ask exactly 3 clarifying questions.
Format your output EXACTLY as a JSON array of strings.
Example if clear: []
Example if unclear: ["What specific user roles will have access to this?", "Do we need to support export to CSV?"]
Do NOT return anything else besides the JSON array.`;

      const { text } = await generateText({
        model: openrouter(OPENROUTER_MODEL),
        prompt,
        temperature: 0.2,
      });

      console.log(`[Clarification Inngest] Raw AI Response for ID ${featureRequestId}: ${text}`);
      return asStringArray(parseJsonFromText<unknown>(text)).slice(0, 3);
    });

    console.log(`[Clarification Inngest] AI clarification response for ID ${featureRequestId}:`, JSON.stringify(aiResponse));
    console.log(`[Clarification Inngest] Number of clarification questions generated for ID ${featureRequestId}: ${aiResponse.length}`);

    if (aiResponse.length > 0) {
      await step.run("save-clarification-questions", async () => {
        console.log(`[Clarification Inngest] Saving clarification questions to DB for FR ID: ${featureRequestId} and setting status to 'clarifying'`);
        const values = aiResponse.map((q: string) => ({
          featureRequestId,
          question: q,
          status: "pending" as const,
        }));
        await db.insert(clarificationQuestionsTable).values(values);

        await db
          .update(featureRequestsTable)
          .set({ status: "clarifying" })
          .where(eq(featureRequestsTable.id, featureRequestId));
        console.log(`[Clarification Inngest] Database status updated to 'clarifying' for FR ID: ${featureRequestId}`);
      });
      console.log(`[Clarification Inngest] Final Feature Request status for ID ${featureRequestId}: clarifying`);
      return { status: "clarifying", questions: aiResponse.length };
    } else {
      await step.run("mark-request-ready", async () => {
        console.log(`[Clarification Inngest] No clarification questions generated. Updating DB status to 'ready' for FR ID: ${featureRequestId}`);
        await db
          .update(featureRequestsTable)
          .set({ status: "ready" })
          .where(eq(featureRequestsTable.id, featureRequestId));
        console.log(`[Clarification Inngest] Database status updated to 'ready' for FR ID: ${featureRequestId}`);
      });
      console.log(`[Clarification Inngest] Final Feature Request status for ID ${featureRequestId}: ready`);
      return { status: "ready" };
    }
  }
);
