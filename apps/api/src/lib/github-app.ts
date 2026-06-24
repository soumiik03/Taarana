import { App } from "@octokit/app";
import { env } from "../env";

export const githubApp = new App({
  appId: env.GITHUB_APP_ID,
  privateKey: env.GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, "\n"),
  webhooks: {
    secret: env.GITHUB_WEBHOOK_SECRET,
  },
  oauth: {
    clientId: env.GITHUB_CLIENT_ID,
    clientSecret: env.GITHUB_CLIENT_SECRET,
  },
});

export async function getInstallationOctokit(installationId: number) {
  return githubApp.getInstallationOctokit(installationId);
}