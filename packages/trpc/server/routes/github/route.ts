import { router, protectedProcedure } from "../../trpc";
import { db, eq } from "@repo/database";
import { organizationsTable, workspaceMembersTable } from "@repo/database/schema";
import { TRPCError } from "@trpc/server";

async function getOctokitApp() {
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const clientId = process.env.GITHUB_CLIENT_ID;

  if (!appId || !privateKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "GitHub App configuration is missing on the server",
    });
  }

  const { App } = await import("@octokit/app");
  return new App({
    appId,
    privateKey: privateKey.replace(/\\n/g, "\n"),
    oauth: {
      clientId: clientId || "",
      clientSecret: clientSecret || "",
    },
  });
}

export const githubRouter = router({
  getRepos: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    try {
      // 1. Find user's organization
      const membership = await db
        .select({ organizationId: workspaceMembersTable.organizationId })
        .from(workspaceMembersTable)
        .where(eq(workspaceMembersTable.userId, userId))
        .limit(1);

      let organizationId: string;

      if (!membership.length || !membership[0]) {
        const allOrgs = await db.select().from(organizationsTable).limit(1);
        if (allOrgs.length && allOrgs[0]) {
          organizationId = allOrgs[0].id;
          await db.insert(workspaceMembersTable).values({
            organizationId,
            userId,
            role: "admin",
          });
        } else {
          return { connected: false, error: "No organization found for this user", repos: [] };
        }
      } else {
        organizationId = membership[0].organizationId;
      }

      // 2. Fetch githubInstallationId
      const org = await db
        .select({ githubInstallationId: organizationsTable.githubInstallationId })
        .from(organizationsTable)
        .where(eq(organizationsTable.id, organizationId))
        .limit(1);

      if (!org.length || !org[0] || !org[0].githubInstallationId) {
        return { connected: false, repos: [] };
      }

      const installationId = org[0].githubInstallationId;

      // 3. Create installation-scoped Octokit client
      const app = await getOctokitApp();
      const octokit = await app.getInstallationOctokit(installationId);

      // 4. Fetch list of repositories
      const response = await octokit.request("GET /installation/repositories", {
        per_page: 100,
      });

      const repos = response.data.repositories.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        private: repo.private,
        htmlUrl: repo.html_url,
        description: repo.description ?? "",
        updatedAt: repo.updated_at ?? "",
      }));

      return {
        connected: true,
        repos,
      };
    } catch (error: any) {
      console.error("Failed to fetch GitHub repositories:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "Failed to fetch repositories from GitHub",
      });
    }
  }),
});
