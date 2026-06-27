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
    const authRes = await fetch("http://127.0.0.1:8000/api/auth/get-session", {
      headers: { cookie: cookies },
    });

    if (authRes.ok) {
      const session = await authRes.json();
      if (session?.user?.id) {
        return {
          user: {
            id: session.user.id,
          },
        };
      }
    }
    
    return { user: null };
  } catch (error) {
    console.error("tRPC context auth error:", error);
    return { user: null };
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>;
