export interface GitHubPullRequestPayload {
  action: string;
  number: number;
  pull_request: {
    id: number;
    number: number;
    title: string;
    body: string | null;
    html_url: string;
    state: string;
    head: {
      ref: string;
    };
  };
  repository: {
    id: number;
    full_name: string;
  };
}
