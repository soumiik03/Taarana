import { inngest } from "../client";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { db, eq } from "@repo/database";
import {
  featureRequestsTable,
  clarificationQuestionsTable,
} from "@repo/database/schema";
import { env } from "../../env";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const checkFeatureRequestContext = inngest.createFunction(
  { id: "check-feature-request-context", triggers: [{ event: "feature-request/check-context" }] },
  async ({ event, step }) => {
    try {
      require("fs").appendFileSync("j:/Projects/AI/Taarana/scratch/check-log.txt", `\n[${new Date().toISOString()}] Started check-context for ${event.data.featureRequestId}\n`);
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
      const qnaText = questions
        .map((q, i) => `Q${i + 1}: ${q.question}\nA${i + 1}: ${q.answer || "No answer"}`)
        .join("\n\n");

      const prompt = `You are a product manager analyzing a feature request and its follow-up clarifications.
Title: ${featureRequest.title}
Description: ${featureRequest.description}

Clarifications:
${qnaText}

If the context is now complete and actionable for developers, respond exactly with "READY".
If there are still ambiguities that need more clarification, ask exactly 1 follow-up question.
If no further clarification is needed, just say "READY". Do not include any other text.`;

      const { text } = await generateText({
        model: openrouter("openai/gpt-oss-120b:free"),
        prompt,
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
      // The AI asked a follow-up question
      await step.run("add-followup", async () => {
        await db.insert(clarificationQuestionsTable).values({
          featureRequestId,
          question: aiDecision,
          status: "pending",
        });
      });
      return { status: "clarifying", followup: aiDecision };
    }
    } catch (e: any) {
      require("fs").appendFileSync("j:/Projects/AI/Taarana/scratch/check-log.txt", `\n[${new Date().toISOString()}] Error: ${e.message}\n${e.stack}\n`);
      throw e;
    }
  }
);
