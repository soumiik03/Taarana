export function buildPrdPrompt(
    title: string,
    description: string,
    questionsAndAnswers: { question: string; answer: string }[]
): string {
    const qaSection = questionsAndAnswers
        .map((qa, i) => `Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer}`)
        .join("\n\n");

    return `You are a senior product manager. Based on the feature request and clarification answers below, generate a complete Product Requirements Document.

Feature Request Title: ${title}
Feature Request Description: ${description}

Clarification Q&A:
${qaSection}

Return ONLY a valid JSON object with exactly these fields:
{
  "problemStatement": "string — what problem this solves",
  "goals": ["string", "string"],
  "nonGoals": ["string", "string"],
  "userStories": ["As a [user], I want to [action] so that [benefit]"],
  "acceptanceCriteria": ["string", "string"],
  "edgeCases": ["string", "string"],
  "successMetrics": ["string", "string"]
}

Return only valid JSON. No markdown, no preamble, no extra text.`;
}