import { inngest } from "../client";
import { db, eq } from "@repo/database";
import { prdsTable, featureRequestsTable, clarificationQuestionsTable } from "@repo/database/schema";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { buildPrdPrompt } from "../utils/prd-prompt";
import { OPENROUTER_MODEL, asStringArray, parseJsonFromText } from "../utils/ai";

const openrouter = createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

type PrdAiResponse = {
    problemStatement?: unknown;
    goals?: unknown;
    nonGoals?: unknown;
    userStories?: unknown;
    acceptanceCriteria?: unknown;
    edgeCases?: unknown;
    successMetrics?: unknown;
};

function normalizePrdResponse(response: PrdAiResponse) {
    return {
        problemStatement:
            typeof response.problemStatement === "string"
                ? response.problemStatement.trim()
                : "",
        goals: asStringArray(response.goals),
        nonGoals: asStringArray(response.nonGoals),
        userStories: asStringArray(response.userStories),
        acceptanceCriteria: asStringArray(response.acceptanceCriteria),
        edgeCases: asStringArray(response.edgeCases),
        successMetrics: asStringArray(response.successMetrics),
    };
}

export const generatePrdFunction = inngest.createFunction(
    { id: "generate-prd", triggers: [{ event: "prd/generate" }] },
    async ({ event, step }) => {
        const { featureRequestId } = event.data;

        const featureRequest = await step.run("fetch-feature-request", async () => {
            const result = await db
                .select()
                .from(featureRequestsTable)
                .where(eq(featureRequestsTable.id, featureRequestId));
            return result[0];
        });

        if (!featureRequest) throw new Error("Feature request not found");

        await step.run("mark-prd-generating", async () => {
            await db
                .update(prdsTable)
                .set({ status: "draft" })
                .where(eq(prdsTable.featureRequestId, featureRequestId));
        });

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

        const prdJson = await step.run("generate-prd-ai", async () => {
            if (!process.env.OPENROUTER_API_KEY) {
                throw new Error("OPENROUTER_API_KEY is not configured");
            }

            const prompt = buildPrdPrompt(
                featureRequest.title,
                featureRequest.description,
                answeredQA
            );

            const { text } = await generateText({
                model: openrouter(OPENROUTER_MODEL),
                prompt,
                temperature: 0.2,
            });

            return normalizePrdResponse(parseJsonFromText<PrdAiResponse>(text));
        });

        const prd = await step.run("save-prd", async () => {
            const values = {
                ...prdJson,
                status: "draft" as const,
            };

            const updated = await db
                .update(prdsTable)
                .set(values)
                .where(eq(prdsTable.featureRequestId, featureRequestId))
                .returning();

            if (updated[0]) {
                return updated[0];
            }

            const inserted = await db
                .insert(prdsTable)
                .values({
                    featureRequestId,
                    ...values,
                })
                .returning();

            return inserted[0];
        });

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
