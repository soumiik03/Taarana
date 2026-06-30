import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().describe("DB URL"),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) {
    console.error("=== Database Environment Variable Validation Failed ===");
    console.error(JSON.stringify(safeParseResult.error.format(), null, 2));
    throw new Error(safeParseResult.error.message);
  }
  return safeParseResult.data;
}

export const env = createEnv(process.env);
