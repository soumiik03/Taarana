export const OPENROUTER_MODEL = "openai/gpt-oss-120b:free";

export function parseJsonFromText<T>(text: string): T {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed) as T;
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1];
    if (fenced) {
      return JSON.parse(fenced.trim()) as T;
    }

    const objectStart = trimmed.indexOf("{");
    const objectEnd = trimmed.lastIndexOf("}");
    if (objectStart !== -1 && objectEnd > objectStart) {
      return JSON.parse(trimmed.slice(objectStart, objectEnd + 1)) as T;
    }

    const arrayStart = trimmed.indexOf("[");
    const arrayEnd = trimmed.lastIndexOf("]");
    if (arrayStart !== -1 && arrayEnd > arrayStart) {
      return JSON.parse(trimmed.slice(arrayStart, arrayEnd + 1)) as T;
    }

    throw new Error(`AI response was not valid JSON: ${trimmed.slice(0, 500)}`);
  }
}

export function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}
