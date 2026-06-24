import { db, eq } from "@repo/database";
import { sessionTable } from "@repo/database/schema";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";

export async function createContext({ req, res }: CreateExpressContextOptions) {
  const cookies = req.headers.cookie ?? "";
  // Parse session token from cookies
  const match = cookies.match(/(?:(?:__Secure-)?better-auth\.session_token)=([^;]+)/);
  const sessionToken = match ? match[1] : null;

  if (!sessionToken) {
    return { user: null };
  }

  try {
    const session = await db
      .select({ userId: sessionTable.userId })
      .from(sessionTable)
      .where(eq(sessionTable.token, sessionToken))
      .limit(1);

    if (!session.length || !session[0]) {
      return { user: null };
    }

    return {
      user: {
        id: session[0].userId,
      },
    };
  } catch (error) {
    console.error("tRPC context auth error:", error);
    return { user: null };
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>;
