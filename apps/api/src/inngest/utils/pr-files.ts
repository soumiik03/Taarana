import { App } from "octokit";

export async function getPRDiff(
  installationId: number,
  owner: string,
  repo: string,
  pullNumber: number
) {
  const app = new App({
    appId: process.env.GITHUB_APP_ID!,
    privateKey: process.env.GITHUB_APP_PRIVATE_KEY!.replace(/\\n/g, "\n"),
  });

  const octokit = await app.getInstallationOctokit(installationId);

  const { data: files } = await octokit.rest.pulls.listFiles({
    owner,
    repo,
    pull_number: pullNumber,
  });

  return files
    .filter((f: any) => f.patch)
    .map((f: any) => ({
      filename: f.filename,
      patch: f.patch!,
      status: f.status,
    }));
}
