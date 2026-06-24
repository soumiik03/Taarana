import { headers } from "next/headers";

export async function getServerSession() {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie") ?? "";

    if (!cookieHeader) return null;

    const res = await fetch("http://localhost:8000/api/auth/get-session", {
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
