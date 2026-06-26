import { savePullRequestAndLinkFeature } from "./src/lib/save-pull-request";

const payload = {
  action: "opened",
  pull_request: {
    id: 3000000000,
    number: 42,
    title: "Test PR",
    body: "This is a test description",
    head: {
      ref: "test-branch",
      sha: "abcdef123456"
    },
    state: "open",
    html_url: "https://github.com/test/test/pull/42"
  },
  repository: {
    name: "test-repo",
    owner: {
      login: "test-owner"
    }
  },
  installation: {
    id: 987654
  }
};

async function run() {
  try {
    await savePullRequestAndLinkFeature(payload);
    console.log("Success!");
    process.exit(0);
  } catch (err: any) {
    console.error("Caught error:");
    console.error(err);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
}

run();
