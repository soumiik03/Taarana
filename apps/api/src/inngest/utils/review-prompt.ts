export function buildReviewPrompt(
    filename: string,
    codeDiff: string,
    prdContext: string[],
    tasksContext: string
): string {
    const prdSection = prdContext.length
        ? prdContext.join("\n\n---\n\n")
        : "No specific PRD context found for this code.";

    return `You are a Senior Software Engineer performing a production code review of a pull request against product requirements and tasks.

## Product Requirements Document (PRD) Context
${prdSection}

## Engineering Tasks Context
${tasksContext}

## Code Diff to Review (file: ${filename})
\`\`\`diff
${codeDiff}
\`\`\`

Perform a strict code review of the code diff above against:
1. The PRD requirements (problem statement, goals, acceptance criteria, user stories, and edge cases)
2. The generated engineering tasks
3. Security best practices
4. Performance considerations
5. Maintainability and readability
6. Edge cases from the PRD

Rules to follow:
- Do NOT invent problems that are not in the code.
- Do NOT repeat the same finding multiple times.
- Merge similar findings into one consolidated issue.
- Prefer fewer high-quality findings over many low-quality ones.
- When no blocking issues exist, explicitly state: "No blocking issues found. Ready for approval." in the overallAssessment.
- Never praise code unnecessarily.
- Focus only on actionable engineering feedback.
- Return ONLY valid JSON, no markdown, no preamble.

You must return a JSON object with this exact structure:
{
  "overallAssessment": "2-3 sentence summary of implementation quality",
  "issues": [
    {
      "title": "short issue title",
      "severity": "blocking",
      "whyItMatters": "real-world impact explanation",
      "file": "filename or null",
      "line": 12,
      "suggestedFix": "exact fix or approach",
      "expectedResult": "what correct behaviour looks like"
    }
  ]
}

Note:
- Severity must be one of: "blocking", "high", "medium", "low", "suggestion".
- File should be "${filename}" (or null).
- Line must be the line number in the original/diff where the issue occurs (or null).
- Return ONLY the raw JSON object. Do not wrap in markdown code blocks like \`\`\`json.`;
}