import { ReposList } from "~/features/dashboard/components/repos-list";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "GitHub Integration | Taarana AI",
  description: "Configure and sync your GitHub repositories to authorize code review processes.",
};

export default function GitHubPage() {
  return <ReposList />;
}
