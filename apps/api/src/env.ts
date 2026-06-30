import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  BASE_URL: z.string().default("http://localhost:8000"),
  GITHUB_APP_ID: z.string(),
  GITHUB_APP_PRIVATE_KEY: z.string(),
  GITHUB_WEBHOOK_SECRET: z.string(),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  OPENROUTER_API_KEY: z.string(),
  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) {
    console.error("=== API Environment Variable Validation Failed ===");
    console.error(JSON.stringify(safeParseResult.error.format(), null, 2));
    throw new Error(safeParseResult.error.message);
  }
  return safeParseResult.data;
}

export const env = createEnv(process.env);
