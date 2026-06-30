import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // Use relative pathing on the client-side to leverage Next.js rewrite proxies.
  // This ensures cookies are set on the frontend domain itself, which resolves cookie visibility in middleware.
  baseURL: typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_API_URL,
});

export const { signIn, signOut, useSession } = authClient;

