import { App } from "octokit";

export async function postReviewComments(
    installationId: number,
    owner: string,
    repo: string,
    pullNumber: number,
    commitSha: string,
    overallAssessment: string,
    hasBlocking: boolean,
    issues: { filename: string; line: number | null; comment: string; type: string }[]
) {
    const app = new App({
        appId: process.env.GITHUB_APP_ID!,
        privateKey: process.env.GITHUB_APP_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    });

    const octokit = await app.getInstallationOctokit(installationId);

    // Prepare comments and review parameters
    const commentsList = issues
        .map((issue) => {
            const prefix = issue.type === "blocking" ? "🚨 **Blocking**" : "⚠️ **Non-blocking**";
            const body = `${prefix}\n\n${issue.comment}`;
            return {
                path: issue.filename,
                line: issue.line!,
                body,
            };
        })
        .filter((c) => c.path && c.line);

    const eventType = hasBlocking ? "REQUEST_CHANGES" : (issues.length > 0 ? "COMMENT" : "APPROVE");

    // Post the review
    try {
        console.log(`[GitHub Review] Attempting to submit a unified review for commit ${commitSha} with ${commentsList.length} comments...`);
        await octokit.rest.pulls.createReview({
            owner,
            repo,
            pull_number: pullNumber,
            commit_id: commitSha,
            event: eventType,
            body: overallAssessment,
            comments: commentsList,
        });
        console.log("[GitHub Review] Unified review with comments posted successfully!");
    } catch (unifiedErr) {
        console.warn("[GitHub Review] Failed to submit unified review with comments (likely due to invalid lines in diff). Retrying without inline comments in the review request...", unifiedErr);
        
        // Retrying: Submit review with just overall assessment
        try {
            await octokit.rest.pulls.createReview({
                owner,
                repo,
                pull_number: pullNumber,
                commit_id: commitSha,
                event: eventType,
                body: overallAssessment,
            });
            console.log("[GitHub Review] Review body posted successfully!");
        } catch (bodyErr) {
            console.error("[GitHub Review] Failed to post review body:", bodyErr);
        }

        // Post comments individually so they are try-caught individually
        for (const issue of issues) {
            const prefix = issue.type === "blocking" ? "🚨 **Blocking**" : "⚠️ **Non-blocking**";
            const body = `${prefix}\n\n${issue.comment}`;

            try {
                if (issue.line) {
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
                    await octokit.rest.issues.createComment({
                        owner,
                        repo,
                        issue_number: pullNumber,
                        body,
                    });
                }
            } catch (err) {
                console.error(`[GitHub Review] Failed to post comment on ${issue.filename}:${issue.line}`, err);
            }
        }
    }
}