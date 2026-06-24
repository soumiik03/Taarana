import { createTRPCProxyClient, httpLink } from "@repo/trpc/client";
import { cookies } from "next/headers";
import { env } from "~/env.js";
import type { ServerRouter } from "@repo/trpc/client";

/**
 * Server-side helper to fetch connected repositories.
 * Forwards current request cookies to ensure session authentication at the tRPC backend.
 */
export async function getConnectedRepositories() {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const client = createTRPCProxyClient<ServerRouter>({
      links: [
        httpLink({
          url: env.NEXT_PUBLIC_API_URL ?? "/trpc",
          headers() {
            return {
              cookie: cookieHeader,
            };
          },
        }),
      ],
    });

    return await client.github.getRepos.query();
  } catch (error) {
    console.error("Failed to fetch connected repositories on server:", error);
    return { connected: false, repos: [] };
  }
}
