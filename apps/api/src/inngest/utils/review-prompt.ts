export function buildReviewPrompt(
    filename: string,
    codeDiff: string,
    prdContext: string[]
): string {
    const prdSection = prdContext.length
        ? prdContext.join("\n\n---\n\n")
        : "No specific PRD context found for this code.";

    return `You are a senior QA engineer reviewing a pull request against a Product Requirements Document (PRD).

## Relevant PRD Sections
${prdSection}

## Code Diff (file: ${filename})
\`\`\`diff
${codeDiff}
\`\`\`

Review this code change against the PRD requirements above. Return ONLY a valid JSON array of issues. Each issue must follow this exact shape:
{
  "type": "blocking" | "non-blocking",
  "line": <line number in diff or null>,
  "comment": "<clear description of the issue and how to fix it>"
}

Rules:
- blocking = violates acceptance criteria, missing required behavior, security risk, data loss risk
- non-blocking = code quality, naming, edge case not in PRD, suggestion
- If there are no issues return an empty array []
- Return ONLY the JSON array, no explanation, no markdown fences`;
}