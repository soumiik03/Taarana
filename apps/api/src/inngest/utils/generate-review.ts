import OpenAI from "openai";
import { buildReviewPrompt, buildConsolidationPrompt } from "./review-prompt";

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

const getModel = () => {
    return process.env.REVIEW_MODEL || process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
};

export type ReviewIssue = {
    title: string;
    severity: "blocking" | "high" | "medium" | "low" | "suggestion";
    whyItMatters: string;
    file: string | null;
    line: number | null;
    suggestedFix: string;
    expectedResult: string;
    requirementReference?: string;
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
    const modelName = getModel();
    console.log(`[AI Generation] Started AI review for file: ${filename}, model: ${modelName}, commit SHA: ${commitSha || "N/A"}`);
    
    // 1. Build the prompt with full context
    const prompt = buildReviewPrompt(filename, codeDiff, prdContext, tasksContext);

    // 2. Call the AI
    const response = await openai.chat.completions.create({
        model: modelName,
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

export type ConsolidateParams = {
    prdContext: string;
    tasksContext: string;
    featureRequest: string;
    clarifications: string;
    previousReviews: string;
    rawIssues: string;
    fullDiff: string;
    commitSha?: string;
};

export type ConsolidatedReviewResult = {
    approved: boolean;
    overallAssessment: string;
    requirementCoverage: {
        requirement: string;
        status: string;
        details: string;
    }[];
    confidence: string;
    resolvedIssues: {
        title: string;
    }[];
    outstandingIssues: ReviewIssue[];
    score: number;
    formattedMarkdown: string;
};

export async function consolidateReview(params: ConsolidateParams): Promise<ConsolidatedReviewResult> {
    const modelName = getModel();
    console.log(`[AI Consolidation] Started AI consolidation review, model: ${modelName}, commit SHA: ${params.commitSha || "N/A"}`);

    const prompt = buildConsolidationPrompt(params);

    const response = await openai.chat.completions.create({
        model: modelName,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    console.log(`[AI Consolidation] Raw AI Response:`);
    console.log(raw);

    try {
        const cleaned = raw.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleaned);

        const approved = !!parsed.approved;
        let outstandingIssues: ReviewIssue[] = Array.isArray(parsed.outstandingIssues) ? parsed.outstandingIssues : [];
        const resolvedIssues = Array.isArray(parsed.resolvedIssues) ? parsed.resolvedIssues : [];
        const requirementCoverage = Array.isArray(parsed.requirementCoverage) ? parsed.requirementCoverage : [];
        const confidence = parsed.confidence || "High";
        let overallAssessment = parsed.overallAssessment || "";

        // Enforce: recommendations (suggestions) do NOT affect approval/score.
        // We will calculate score deterministically in TypeScript based on outstanding issues.
        let score = 100;
        let hasBlocking = false;
        let hasHigh = false;

        for (const issue of outstandingIssues) {
            const sev = (issue.severity || "").toLowerCase().trim();
            if (sev === "blocking") {
                score -= 25;
                hasBlocking = true;
            } else if (sev === "high") {
                score -= 15;
                hasHigh = true;
            } else if (sev === "medium") {
                score -= 8;
            } else if (sev === "low") {
                score -= 3;
            }
        }
        score = Math.max(0, Math.min(100, score));

        // Enforce automatic approval overrides
        const finalApproved = approved && !hasBlocking && !hasHigh;
        
        let finalScore = score;
        if (finalApproved) {
            finalScore = 100;
            // Suppress outstanding issues that are not suggestions/recommendations
            outstandingIssues = outstandingIssues.filter(i => (i.severity || "").toLowerCase() === "suggestion");
            
            // Set the exact requested approval template text
            overallAssessment = `Status: ✅ APPROVED

Overall Assessment:
All requested functionality has been implemented successfully.
Previously reported issues have been resolved. The implementation
satisfies the original Feature Request, clarification answers, PRD,
generated tasks, and pull request requirements. No blocking or high
severity issues remain.

Ready to Merge.`;
        }

        // Generate the formatted markdown document using the structured fields
        const formattedMarkdown = formatConsolidatedReviewMarkdown({
            approved: finalApproved,
            overallAssessment,
            requirementCoverage,
            resolvedIssues,
            outstandingIssues,
            confidence
        }, finalScore);

        return {
            approved: finalApproved,
            overallAssessment: formattedMarkdown,
            requirementCoverage,
            confidence,
            resolvedIssues,
            outstandingIssues,
            score: finalScore,
            formattedMarkdown
        };

    } catch (err) {
        console.error(`[AI Consolidation] Failed to parse consolidation JSON:`, raw, err);
        
        // Fallback result in case of failure
        const fallbackText = `Status: ❌ Review Error\n\nFailed to process and consolidate review output.`;
        return {
            approved: false,
            overallAssessment: fallbackText,
            requirementCoverage: [],
            confidence: "Low",
            resolvedIssues: [],
            outstandingIssues: [],
            score: 0,
            formattedMarkdown: fallbackText
        };
    }
}

export function formatConsolidatedReviewMarkdown(
    parsed: {
        approved: boolean;
        overallAssessment: string;
        requirementCoverage: any[];
        resolvedIssues: any[];
        outstandingIssues: any[];
        confidence: string;
    },
    score: number
): string {
    const isApproved = parsed.approved;

    let overallSection = "";
    if (isApproved) {
        overallSection = parsed.overallAssessment;
    } else {
        overallSection = `### 1. Overall Assessment\n${parsed.overallAssessment || "Needs changes before merging."}`;
    }

    // 2. Requirement Coverage
    let coverageStr = "### 2. Requirement Coverage\n";
    if (Array.isArray(parsed.requirementCoverage) && parsed.requirementCoverage.length > 0) {
        for (const req of parsed.requirementCoverage) {
            const statusLower = (req.status || "").toLowerCase();
            const icon = statusLower.includes("not satisfied") ? "❌" : (statusLower.includes("partially") ? "⚠️" : "✓");
            coverageStr += `- ${icon} **${req.requirement}**: ${req.status} - ${req.details}\n`;
        }
    } else {
        coverageStr += `- ✓ **Feature Request**: Satisfied\n- ✓ **Clarifications**: Satisfied\n- ✓ **PRD**: Satisfied\n- ✓ **Generated Tasks**: Satisfied\n`;
    }

    // 3. Resolved Issues
    let resolvedStr = "### 3. Resolved Issues\n";
    const resolvedList = parsed.resolvedIssues || [];
    if (resolvedList.length > 0) {
        resolvedStr += resolvedList.map((ri: any) => `- ✓ ${ri.title}`).join("\n") + "\n";
    } else {
        resolvedStr += "*No previously reported issues were marked as resolved in this run.*\n";
    }

    // 4. Outstanding Issues & Recommendations
    let outstandingStr = "### 4. Outstanding Issues\n";
    const actualIssues = (parsed.outstandingIssues || []).filter((issue: any) => (issue.severity || "").toLowerCase() !== "suggestion");
    const recommendations = (parsed.outstandingIssues || []).filter((issue: any) => (issue.severity || "").toLowerCase() === "suggestion");

    if (actualIssues.length > 0) {
        // Group by severity
        const severities = ["blocking", "high", "medium", "low"];
        for (const sev of severities) {
            const sevIssues = actualIssues.filter((i: any) => (i.severity || "").toLowerCase() === sev);
            if (sevIssues.length > 0) {
                outstandingStr += `\n#### ${sev.toUpperCase()}\n`;
                for (const issue of sevIssues) {
                    outstandingStr += `- **${issue.title}** (File: ${issue.file || "N/A"}:${issue.line || "N/A"})\n`;
                    outstandingStr += `  - *Requirement:* ${issue.requirementReference || "N/A"}\n`;
                    outstandingStr += `  - *Why it matters:* ${issue.whyItMatters}\n`;
                    outstandingStr += `  - *Suggested Fix:* \`${issue.suggestedFix}\`\n`;
                    outstandingStr += `  - *Expected Result:* ${issue.expectedResult}\n`;
                }
            }
        }
    } else {
        outstandingStr += "*No outstanding blocking or high-severity issues found.*\n";
    }

    // Separate recommendations section
    let recommendationsStr = "\n### Recommendations (Optional / Suggestions)\n";
    if (recommendations.length > 0) {
        for (const rec of recommendations) {
            recommendationsStr += `- **${rec.title}** (File: ${rec.file || "N/A"}:${rec.line || "N/A"})\n`;
            recommendationsStr += `  - *Details:* ${rec.whyItMatters}\n`;
            recommendationsStr += `  - *Suggested Cleanup:* \`${rec.suggestedFix}\`\n`;
        }
    } else {
        recommendationsStr += "*No additional design, accessibility, or code style recommendations.*\n";
    }

    // 5. Review Score
    const scoreStr = `### 5. Review Score
**${score} / 100**`;

    // 6. Risk Summary
    const riskVal = isApproved ? "Minimal" : (actualIssues.some((i: any) => (i.severity || "").toLowerCase() === "blocking" || (i.severity || "").toLowerCase() === "high") ? "High" : "Medium");
    const riskStr = `### 6. Risk Summary
**Risk Level: ${riskVal}**
*Outstanding issues impact stability/readiness:* ${isApproved ? "No risk. PR is ready." : `The PR has ${actualIssues.length} outstanding issues.`}`;

    // 7. Merge Recommendation
    const recVal = isApproved ? "Ready to Merge" : "Fix Needed";
    const mergeRecStr = `### 7. Merge Recommendation
**Recommendation: ${recVal}**
${isApproved ? "The pull request is approved and ready for merge." : "Please resolve the outstanding blocking/high issues before merging."}`;

    // 8. Confidence Score
    const confidenceStr = `### 8. Review Confidence
**Confidence: ${parsed.confidence || "High"}**`;

    return `${overallSection}

---

${scoreStr}

---

${coverageStr}

---

${resolvedStr}

---

${outstandingStr}
${recommendationsStr}

---

${riskStr}

---

${mergeRecStr}

---

${confidenceStr}`;
}
