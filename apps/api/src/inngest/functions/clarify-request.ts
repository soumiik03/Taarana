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
      return { error: "Feature request not found" };
    }

    const aiResponse = await step.run("generate-clarification-questions", async () => {
      if (!process.env.OPENROUTER_API_KEY) {
        throw new Error("OPENROUTER_API_KEY is not configured");
      }

      const prompt = `You are a product manager analyzing a new feature request.
Title: ${featureRequest.title}
Description: ${featureRequest.description}

If the feature request is clear enough to be actionable by a development team, return an empty JSON array [].
If the feature request needs clarification, ask 1 to 3 clarifying questions.
Format your output EXACTLY as a JSON array of strings.
Example if clear: []
Example if unclear: ["What specific user roles will have access to this?", "Do we need to support export to CSV?"]
Do NOT return anything else besides the JSON array.`;

      const { text } = await generateText({
        model: openrouter(OPENROUTER_MODEL),
        prompt,
        temperature: 0.2,
      });

      return asStringArray(parseJsonFromText<unknown>(text)).slice(0, 3);
    });

    if (aiResponse.length > 0) {
      await step.run("save-clarification-questions", async () => {
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
      });
      return { status: "clarifying", questions: aiResponse.length };
    } else {
      await step.run("mark-request-ready", async () => {
        await db
          .update(featureRequestsTable)
          .set({ status: "ready" })
          .where(eq(featureRequestsTable.id, featureRequestId));
      });
      return { status: "ready" };
    }
  }
);
