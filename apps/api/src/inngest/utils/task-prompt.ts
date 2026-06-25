import type { SelectPrd } from "@repo/database/schema";

export function buildTaskPrompt(prd: SelectPrd): string {
  return `You are a senior software engineer. Based on the Product Requirements Document below, break it down into granular engineering tasks a developer can pick up and implement individually.

PRD Details:
Problem Statement: ${prd.problemStatement}
Goals: ${(prd.goals as string[])?.join(", ")}
Acceptance Criteria: ${(prd.acceptanceCriteria as string[])?.join(", ")}
User Stories: ${(prd.userStories as string[])?.join(", ")}
Edge Cases: ${(prd.edgeCases as string[])?.join(", ")}

Return ONLY a valid JSON array of tasks. Each task must follow this exact structure:
[
  {
    "title": "short task title",
    "description": "clear description of what needs to be implemented",
    "priority": "high" | "medium" | "low"
  }
]

Rules:
- Each task must be small enough to complete in 1-4 hours
- Tasks must be ordered from foundational to dependent (database first, then API, then UI)
- Maximum 10 tasks
- Return only valid JSON array. No markdown, no preamble, no extra text.`;
}