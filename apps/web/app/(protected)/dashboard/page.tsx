import { OverviewContent } from "~/features/dashboard/components/overview-content";
import { getGitHubConnectionStatus } from "~/features/github/server/installation";

export default async function DashboardPage() {
  const isGitHubConnected = await getGitHubConnectionStatus();
  return <OverviewContent isGitHubConnected={isGitHubConnected} />;
}
