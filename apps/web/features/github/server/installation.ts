import { db, eq } from "@repo/database";
import { organizationsTable, workspaceMembersTable, sessionTable } from "@repo/database/schema";

/**
 * Saves the GitHub App installation ID against the user's organization.
 * Looks up the user's first organization via workspace_members and updates it.
 */
export async function saveInstallationId(
  userId: string,
  installationId: number
): Promise<{ success: boolean; organizationId?: string; error?: string }> {
  try {
    // Find the user's organization through workspace membership
    const membership = await db
      .select({ organizationId: workspaceMembersTable.organizationId })
      .from(workspaceMembersTable)
      .where(eq(workspaceMembersTable.userId, userId))
      .limit(1);

    if (!membership.length || !membership[0]) {
      return { success: false, error: "No organization found for this user" };
    }

    const organizationId = membership[0].organizationId;

    // Update the organization with the GitHub installation ID
    await db
      .update(organizationsTable)
      .set({ githubInstallationId: installationId })
      .where(eq(organizationsTable.id, organizationId));

    return { success: true, organizationId };
  } catch (error) {
    console.error("Failed to save GitHub installation ID:", error);
    return { success: false, error: "Failed to save installation" };
  }
}

/**
 * Gets the GitHub installation ID for a user's organization.
 */
export async function getInstallationId(
  userId: string
): Promise<number | null> {
  try {
    const result = await db
      .select({
        organizationId: workspaceMembersTable.organizationId,
        githubInstallationId: organizationsTable.githubInstallationId,
      })
      .from(workspaceMembersTable)
      .innerJoin(
        organizationsTable,
        eq(workspaceMembersTable.organizationId, organizationsTable.id)
      )
      .where(eq(workspaceMembersTable.userId, userId))
      .limit(1);

    return result[0]?.githubInstallationId ?? null;
  } catch (error) {
    console.error("Failed to get GitHub installation ID:", error);
    return null;
  }
}

/**
 * Checks if the current session's organization has a GitHub installation ID.
 */
export async function getGitHubConnectionStatus(): Promise<boolean> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const sessionToken =
    cookieStore.get("better-auth.session_token")?.value ??
    cookieStore.get("__Secure-better-auth.session_token")?.value;

  if (!sessionToken) return false;

  try {
    const session = await db
      .select({ userId: sessionTable.userId })
      .from(sessionTable)
      .where(eq(sessionTable.token, sessionToken))
      .limit(1);

    if (!session.length || !session[0]) return false;

    const userId = session[0].userId;
    const installationId = await getInstallationId(userId);
    return installationId !== null;
  } catch (error) {
    console.error("Failed to check github connection status:", error);
    return false;
  }
}
