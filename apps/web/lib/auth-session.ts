import { authClient } from "./auth-client";

export async function getSession() {
  const session = await authClient.getSession();
  return session;
}
