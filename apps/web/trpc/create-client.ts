import { httpLink, httpBatchStreamLink } from "@repo/trpc/client";
import { env } from "~/env.js";
import { getBackendUrl } from "~/lib/api-url";

interface CreateTRPCHttpBatchClientClientOpts {
  enableStreaming?: boolean;
}

export const createTRPCHttpBatchClientClient = (opts?: CreateTRPCHttpBatchClientClientOpts) => {
  const c = opts?.enableStreaming ? httpBatchStreamLink : httpLink;
  let url = env.NEXT_PUBLIC_API_URL ?? "/api/trpc";
  if (typeof window === "undefined") {
    url = `${getBackendUrl()}/trpc`;
  }

  return c({
    url,
    fetch(url, options) {
      return fetch(url, {
        ...options,
        credentials: "include",
      });
    },
  });
};
