import { inngest } from "../client";
import { db, eq } from "@repo/database";
import { tasksTable, prdsTable } from "@repo/database/schema";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { buildTaskPrompt } from "../utils/task-prompt";
import { OPENROUTER_MODEL, parseJsonFromText } from "../utils/ai";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const generateTasksFunction = inngest.createFunction(
  { id: "generate-tasks", triggers: [{ event: "tasks/generate" }] },
  async ({ event, step }) => {
    const { prdId } = event.data;

    // Step 1 — fetch the approved PRD
    const prd = await step.run("fetch-prd", async () => {
      const result = await db
        .select()
        .from(prdsTable)
        .where(eq(prdsTable.id, prdId));
      return result[0];
    });

    if (!prd) throw new Error("PRD not found");
    if (prd.status !== "approved") throw new Error("PRD is not approved yet");

    // Step 2 — call OpenRouter to generate tasks
    const tasks = await step.run("generate-tasks-ai", async () => {
      if (!process.env.OPENROUTER_API_KEY) {
        throw new Error("OPENROUTER_API_KEY is not configured");
      }

      const prompt = buildTaskPrompt(prd as any);

      const { text } = await generateText({
        model: openrouter(OPENROUTER_MODEL),
        prompt,
        temperature: 0.2,
      });

      try {
        // Strip markdown code blocks if model wraps response in them
        const cleaned = text
          .replace(/^```json\n?/, "")
          .replace(/^```\n?/, "")
          .replace(/\n?```$/, "")
          .trim();
        return JSON.parse(cleaned);
      } catch (e) {
        try {
          return parseJsonFromText(text);
        } catch (innerError) {
          console.error("Failed to parse AI response:", text);
          throw new Error("AI returned invalid JSON: " + text.slice(0, 200));
        }
      }
    });

    // Step 3 — save all tasks to DB
    const savedTasks = await step.run("save-tasks", async () => {
      const values = tasks.map((task: any, index: number) => ({
        prdId,
        title: task.title,
        description: task.description ?? "",
        priority: (["high", "medium", "low"].includes(task.priority)
          ? task.priority
          : "medium") as "high" | "medium" | "low",
        status: "todo" as const,
        order: index,
      }));

      return db.insert(tasksTable).values(values).returning();
    });

    return { taskCount: savedTasks.length, prdId };
  }
);