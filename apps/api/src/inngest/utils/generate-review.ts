import OpenAI from "openai";
import { buildReviewPrompt } from "./review-prompt";

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

export type ReviewIssue = {
    type: "blocking" | "non-blocking";
    line: number | null;
    comment: string;
};

export async function generateReviewForChunk(
    prd: Record<string, any>,
    filename: string,
    codeDiff: string
): Promise<ReviewIssue[]> {
    // 1. Build the prompt with full PRD
    const prompt = buildReviewPrompt(filename, codeDiff, prd);

    // 2. Call the AI
    const response = await openai.chat.completions.create({
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
    });

    const raw = response.choices[0]?.message?.content ?? "[]";

    try {
        const cleaned = raw.replace(/```json|```/g, "").trim();
        return JSON.parse(cleaned) as ReviewIssue[];
    } catch {
        console.error("[Review] Failed to parse AI response:", raw);
        return [];
    }
}
