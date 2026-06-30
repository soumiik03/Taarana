import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "./env";

import pg from "pg";

console.log(`[Database Init] Connecting to: ${env.DATABASE_URL}`);
console.log(`[Database Init] Calling drizzle()`);

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  connectionTimeoutMillis: 10000, // 10s connection timeout
});

export const db = drizzle(pool);
console.log(`[Database Init] drizzle() returned successfully`);
export * from "drizzle-orm";
export default db;
