"use server";

import { cookies } from "next/headers";

export async function switchWorkspace(organizationId: string) {
  const cookieStore = await cookies();
  cookieStore.set("active_org_id", organizationId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}