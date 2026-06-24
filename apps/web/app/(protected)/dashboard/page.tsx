import { OverviewContent } from "~/features/dashboard/components/overview-content";
import { getGitHubConnectionStatus } from "~/features/github/server/installation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Taarana AI",
  description: "View active feature requests, pull reviews status, and manage workspace integrations.",
};

export default async function DashboardPage() {
  const isGitHubConnected = await getGitHubConnectionStatus();
  return <OverviewContent isGitHubConnected={isGitHubConnected} />;
}
