import { inngest } from "../client";
import { db, eq } from "@repo/database";
import { prdsTable, featureRequestsTable, clarificationQuestionsTable } from "@repo/database/schema";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { buildPrdPrompt } from "../utils/prd-prompt";

const openrouter = createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY!,
});

export const generatePrdFunction = inngest.createFunction(
    { id: "generate-prd", triggers: [{ event: "prd/generate" }] },
    async ({ event, step }) => {
        const { featureRequestId } = event.data;

        // Step 1 — fetch feature request
        const featureRequest = await step.run("fetch-feature-request", async () => {
            const result = await db
                .select()
                .from(featureRequestsTable)
                .where(eq(featureRequestsTable.id, featureRequestId));
            return result[0];
        });

        if (!featureRequest) throw new Error("Feature request not found");

        // Step 2 — fetch all answered clarification questions
        const questions = await step.run("fetch-questions", async () => {
            return db
                .select()
                .from(clarificationQuestionsTable)
                .where(
                    eq(clarificationQuestionsTable.featureRequestId, featureRequestId)
                );
        });

        const answeredQA = questions
            .filter((q) => q.answer)
            .map((q) => ({ question: q.question, answer: q.answer! }));

        // Step 3 — call OpenRouter to generate PRD
        const prdJson = await step.run("generate-prd-ai", async () => {
            const prompt = buildPrdPrompt(
                featureRequest.title,
                featureRequest.description,
                answeredQA
            );

            const { text } = await generateText({
                model: openrouter("mistralai/mistral-7b-instruct"),
                prompt,
            });

            return JSON.parse(text.trim());
        });

        // Step 4 — save PRD to DB
        const prd = await step.run("save-prd", async () => {
            const result = await db
                .insert(prdsTable)
                .values({
                    featureRequestId,
                    problemStatement: prdJson.problemStatement,
                    goals: prdJson.goals,
                    nonGoals: prdJson.nonGoals,
                    userStories: prdJson.userStories,
                    acceptanceCriteria: prdJson.acceptanceCriteria,
                    edgeCases: prdJson.edgeCases,
                    successMetrics: prdJson.successMetrics,
                    status: "draft",
                })
                .returning();
            return result[0];
        });

        // Step 5 — update feature request status to ready
        await step.run("update-feature-status", async () => {
            await db
                .update(featureRequestsTable)
                .set({ status: "ready" })
                .where(eq(featureRequestsTable.id, featureRequestId));
        });

        if (!prd) throw new Error("Failed to save PRD");

        return { prdId: prd.id };
    }
);