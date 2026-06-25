import { App } from "octokit";

export async function postReviewComments(
    installationId: number,
    owner: string,
    repo: string,
    pullNumber: number,
    commitSha: string,
    issues: { filename: string; line: number | null; comment: string; type: string }[]
) {
    const app = new App({
        appId: process.env.GITHUB_APP_ID!,
        privateKey: process.env.GITHUB_APP_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    });

    const octokit = await app.getInstallationOctokit(installationId);

    for (const issue of issues) {
        const prefix = issue.type === "blocking" ? "🚨 **Blocking**" : "⚠️ **Non-blocking**";
        const body = `${prefix}\n\n${issue.comment}`;

        try {
            if (issue.line) {
                // Inline comment on specific line
                await octokit.rest.pulls.createReviewComment({
                    owner,
                    repo,
                    pull_number: pullNumber,
                    commit_id: commitSha,
                    path: issue.filename,
                    line: issue.line,
                    body,
                });
            } else {
                // General PR comment if no line number
                await octokit.rest.issues.createComment({
                    owner,
                    repo,
                    issue_number: pullNumber,
                    body,
                });
            }
        } catch (err) {
            // Don't let one bad comment kill the whole review
            console.error(`[Comment] Failed to post on ${issue.filename}:${issue.line}`, err);
        }
    }
}