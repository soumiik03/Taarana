import { headers } from "next/headers";
import { getBackendUrl } from "~/lib/api-url";

export async function getServerSession() {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie") ?? "";

    console.log("[auth-server] 1. incoming Cookie header:", cookieHeader);

    if (!cookieHeader) {
      console.log("[auth-server] 2. session is considered invalid: cookieHeader is empty");
      return null;
    }

    const url = `${getBackendUrl()}/api/auth/get-session`;
    console.log("[auth-server] 3. backend URL being called:", url);

    const res = await fetch(url, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });

    console.log("[auth-server] 4. response status from /api/auth/get-session:", res.status);

    if (res.ok) {
      const session = await res.json();
      console.log("[auth-server] 5. response body (JSON):", JSON.stringify(session));
      if (session?.user) {
        console.log("[auth-server] 6. session is valid (not null)");
        return session;
      } else {
        console.log("[auth-server] 7. session is considered invalid: session.user is falsy");
        return null;
      }
    } else {
      const text = await res.text();
      console.log("[auth-server] 5. response body (text error):", text);
      console.log("[auth-server] 7. session is considered invalid: res.ok is false");
    }
  } catch (e) {
    console.error("[auth-server] Failed to get server session:", e);
  }
  
  console.log("[auth-server] 8. whether session is null: true (returning null)");
  return null;
}
