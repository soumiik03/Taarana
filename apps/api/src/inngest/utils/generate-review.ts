import OpenAI from "openai";
import { buildReviewPrompt } from "./review-prompt";

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

export type ReviewIssue = {
    title: string;
    severity: "blocking" | "high" | "medium" | "low" | "suggestion";
    whyItMatters: string;
    file: string | null;
    line: number | null;
    suggestedFix: string;
    expectedResult: string;
};

export type ReviewResult = {
    overallAssessment: string;
    issues: ReviewIssue[];
};

export async function generateReviewForChunk(
    prdContext: string[],
    tasksContext: string,
    filename: string,
    codeDiff: string
): Promise<ReviewResult> {
    // 1. Build the prompt with full context
    const prompt = buildReviewPrompt(filename, codeDiff, prdContext, tasksContext);

    // 2. Call the AI
    const response = await openai.chat.completions.create({
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
    });

    const raw = response.choices[0]?.message?.content ?? "{}";

    try {
        const cleaned = raw.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        
        return {
            overallAssessment: parsed.overallAssessment || "No overall assessment provided.",
            issues: Array.isArray(parsed.issues) ? parsed.issues : [],
        } as ReviewResult;
    } catch {
        console.error("[Review] Failed to parse AI response:", raw);
        return {
            overallAssessment: "Failed to parse overall assessment.",
            issues: [],
        };
    }
}
