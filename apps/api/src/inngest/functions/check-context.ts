import { inngest } from "../client";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { db, eq } from "@repo/database";
import {
  featureRequestsTable,
  clarificationQuestionsTable,
} from "@repo/database/schema";
import { OPENROUTER_MODEL } from "../utils/ai";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const checkFeatureRequestContext = inngest.createFunction(
  { id: "check-feature-request-context", triggers: [{ event: "feature-request/check-context" }] },
  async ({ event, step }) => {
    const { featureRequestId } = event.data;

    const featureRequest = await step.run("fetch-request", async () => {
      const result = await db
        .select()
        .from(featureRequestsTable)
        .where(eq(featureRequestsTable.id, featureRequestId));
      return result[0];
    });

    const questions = await step.run("fetch-questions", async () => {
      return db
        .select()
        .from(clarificationQuestionsTable)
        .where(eq(clarificationQuestionsTable.featureRequestId, featureRequestId));
    });

    if (!featureRequest) return { error: "Not found" };

    const aiDecision = await step.run("decide-context", async () => {
      if (!process.env.OPENROUTER_API_KEY) {
        throw new Error("OPENROUTER_API_KEY is not configured");
      }

      const qnaText = questions
        .map((q, i) => `Q${i + 1}: ${q.question}\nA${i + 1}: ${q.answer || "No answer"}`)
        .join("\n\n");

      const prompt = `You are a product manager analyzing a feature request and its follow-up clarifications.
Title: ${featureRequest.title}
Description: ${featureRequest.description}

Clarifications:
${qnaText}

If the context is now complete and actionable for developers, respond exactly with READY.
If there are still ambiguities that need more clarification, ask exactly 1 follow-up question.
Do not include anything except READY or the single follow-up question.`;

      const { text } = await generateText({
        model: openrouter(OPENROUTER_MODEL),
        prompt,
        temperature: 0.2,
      });

      return text.trim();
    });

    if (aiDecision === "READY" || aiDecision.includes("READY")) {
      await step.run("mark-ready", async () => {
        await db
          .update(featureRequestsTable)
          .set({ status: "ready" })
          .where(eq(featureRequestsTable.id, featureRequestId));
      });
      return { status: "ready" };
    } else {
      await step.run("add-followup", async () => {
        await db.insert(clarificationQuestionsTable).values({
          featureRequestId,
          question: aiDecision,
          status: "pending",
        });
      });
      return { status: "clarifying", followup: aiDecision };
    }
  }
);
