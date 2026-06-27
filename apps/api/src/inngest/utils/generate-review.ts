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
    codeDiff: string,
    commitSha?: string
): Promise<ReviewResult> {
    console.log(`[AI Generation] Started AI review for file: ${filename}, commit SHA: ${commitSha || "N/A"}`);
    
    // 1. Build the prompt with full context
    const prompt = buildReviewPrompt(filename, codeDiff, prdContext, tasksContext);

    // 2. Call the AI
    const response = await openai.chat.completions.create({
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    console.log(`[AI Generation] Raw AI Response for file ${filename} (commit SHA: ${commitSha || "N/A"}):`);
    console.log(raw);

    try {
        const cleaned = raw.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        const issues = Array.isArray(parsed.issues) ? parsed.issues : [];

        // Calculate chunk-level stats for logging
        const severityCounts = { blocking: 0, high: 0, medium: 0, low: 0, suggestion: 0 };
        let score = 100;
        issues.forEach((issue: any) => {
            const sev = (issue.severity || "").toLowerCase();
            if (sev === "blocking") { score -= 25; severityCounts.blocking++; }
            else if (sev === "high") { score -= 15; severityCounts.high++; }
            else if (sev === "medium") { score -= 8; severityCounts.medium++; }
            else if (sev === "low") { score -= 3; severityCounts.low++; }
            else if (sev === "suggestion") { score -= 1; severityCounts.suggestion++; }
        });
        score = Math.max(0, Math.min(100, score));

        console.log(`[AI Generation] Parsed Findings for file ${filename} (commit SHA: ${commitSha || "N/A"}):`);
        console.log(`- Overall Assessment: ${parsed.overallAssessment}`);
        console.log(`- Issues Count: ${issues.length}`);
        console.log(`- Severity Breakdown: ${JSON.stringify(severityCounts)}`);
        console.log(`- Calculated Chunk Score: ${score}`);
        console.log(`- Detailed Findings:`, JSON.stringify(issues, null, 2));

        return {
            overallAssessment: parsed.overallAssessment || "No overall assessment provided.",
            issues: issues,
        } as ReviewResult;
    } catch (err) {
        console.error(`[AI Generation] Failed to parse AI response for file ${filename}:`, raw, err);
        return {
            overallAssessment: "Failed to parse overall assessment.",
            issues: [],
        };
    }
}
