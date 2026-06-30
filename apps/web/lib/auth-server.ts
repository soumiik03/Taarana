import { headers } from "next/headers";
import { getBackendUrl } from "~/lib/api-url";

export async function getServerSession() {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie") ?? "";

    if (!cookieHeader) return null;

    const res = await fetch(`${getBackendUrl()}/api/auth/get-session`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });

    if (res.ok) {
      const session = await res.json();
      return session?.user ? session : null;
    }
  } catch (e) {
    console.error("Failed to get server session:", e);
  }
  return null;
}
