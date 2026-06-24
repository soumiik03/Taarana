import { createAuthClient } from "better-auth/react";

function getBaseURL(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    try {
      const url = new URL(apiUrl);
      return url.origin; // e.g. "https://vagabond-pretty-rift.ngrok-free.dev"
    } catch {
      // fallback: strip /api/trpc or /trpc suffix
      return apiUrl.replace(/\/api\/trpc$/, "").replace(/\/trpc$/, "");
    }
  }
  return "http://localhost:8000";
}

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
});

export const { signIn, signOut, useSession } = authClient;
