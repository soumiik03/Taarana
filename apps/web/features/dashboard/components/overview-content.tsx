"use client";

import { statusStyles, type StatusType } from "../lib/status-styles";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { MessageSquarePlus, FileText, GitPullRequest, Ship, ExternalLink, Sparkles } from "lucide-react";
import { useSession } from "~/lib/auth-client";
import { cn } from "~/lib/utils";
import { GitHubConnectCard } from "./github-connect-card";

interface MockRequest {
  id: string;
  title: string;
  status: StatusType;
  author: string;
  date: string;
  githubPr?: string;
}

const mockRequests: MockRequest[] = [
  {
    id: "REQ-101",
    title: "Implement Multi-Region AWS Deployment",
    status: "in_progress",
    author: "Soumik Talukder",
    date: "June 23, 2026",
    githubPr: "#412",
  },
  {
    id: "REQ-102",
    title: "Draft PRD for AI Auto-Summarize Features",
    status: "under_review",
    author: "Piyush Garg",
    date: "June 22, 2026",
    githubPr: "#408",
  },
  {
    id: "REQ-103",
    title: "Refactor Database Foreign Keys to Text IDs",
    status: "approved",
    author: "Soumik Talukder",
    date: "June 21, 2026",
    githubPr: "#399",
  },
  {
    id: "REQ-104",
    title: "Create Glassmorphism Welcome Auth UI Card",
    status: "shipped",
    author: "Soumik Talukder",
    date: "June 20, 2026",
    githubPr: "#385",
  },
  {
    id: "REQ-105",
    title: "Next.js 16.1 Proxy/Middleware Migration",
    status: "draft",
    author: "AI Copilot",
    date: "June 19, 2026",
  },
];

interface OverviewContentProps {
  isGitHubConnected?: boolean;
}

export function OverviewContent({ isGitHubConnected = false }: OverviewContentProps) {
  const { data: session } = useSession();
  const userName = session?.user?.name || "Developer";

  const metrics = [
    {
      title: "Total Feature Requests",
      value: "42",
      description: "+8 this week",
      icon: MessageSquarePlus,
      color: "text-[#38BDF8]",
    },
    {
      title: "PRDs Generated",
      value: "18",
      description: "15 approved",
      icon: FileText,
      color: "text-[#F59E0B]",
    },
    {
      title: "PRs Reviewed",
      value: "156",
      description: "+23 merged",
      icon: GitPullRequest,
      color: "text-[#818CF8]",
    },
    {
      title: "Features Shipped",
      value: "31",
      description: "Goal: 40/month",
      icon: Ship,
      color: "text-[#4ADE80]",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2D2D2D] pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#E3E3E3] flex items-center gap-2">
            Welcome back, {userName} <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
          </h1>
          <p className="mt-1 text-sm text-[#9B9B9B]">
            Here is a snapshot of your workspace's current health and activity.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <Card key={i} className="bg-[#202020] border-[#2D2D2D] text-[#E3E3E3] shadow-md hover:border-zinc-700 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[#9B9B9B]">
                  {metric.title}
                </CardTitle>
                <Icon className={cn("h-5 w-5", metric.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tracking-tight">{metric.value}</div>
                <p className="text-[11px] text-[#9B9B9B] mt-1">{metric.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dashboard Grid Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Feature Requests List View */}
        <div className="rounded-xl border border-[#2D2D2D] bg-[#202020] p-6 shadow-md lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#E3E3E3]">Active Feature Requests</h2>
              <p className="text-xs text-[#9B9B9B] mt-0.5">
                A list of feature requests that require review or action.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader className="border-b border-[#2D2D2D]">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[#9B9B9B] font-semibold text-xs py-3">ID</TableHead>
                  <TableHead className="text-[#9B9B9B] font-semibold text-xs py-3">Title</TableHead>
                  <TableHead className="text-[#9B9B9B] font-semibold text-xs py-3">Status</TableHead>
                  <TableHead className="text-[#9B9B9B] font-semibold text-xs py-3">Author</TableHead>
                  <TableHead className="text-[#9B9B9B] font-semibold text-xs py-3">Date</TableHead>
                  <TableHead className="text-[#9B9B9B] font-semibold text-xs py-3 text-right">PR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockRequests.map((req) => {
                  const badge = statusStyles[req.status];
                  return (
                    <TableRow key={req.id} className="border-b border-[#2D2D2D]/60 hover:bg-[#252525]/60 transition-colors">
                      <TableCell className="font-mono text-xs text-[#9B9B9B] font-medium py-3.5">
                        {req.id}
                      </TableCell>
                      <TableCell className="text-sm font-semibold text-[#E3E3E3] py-3.5">
                        {req.title}
                      </TableCell>
                      <TableCell className="py-3.5">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          badge.bg,
                          badge.text
                        )}>
                          <span className={cn("h-1.5 w-1.5 rounded-full", badge.dot)} />
                          {badge.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-[#E3E3E3] py-3.5">
                        {req.author}
                      </TableCell>
                      <TableCell className="text-xs text-[#9B9B9B] py-3.5">
                        {req.date}
                      </TableCell>
                      <TableCell className="text-xs text-[#38BDF8] text-right font-medium py-3.5">
                        {req.githubPr ? (
                          <span className="inline-flex items-center gap-1 cursor-pointer hover:underline">
                            {req.githubPr}
                            <ExternalLink className="h-3 w-3" />
                          </span>
                        ) : (
                          <span className="text-[#9B9B9B]/40">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* GitHub integration card */}
        <div className="lg:col-span-1 space-y-6">
          <GitHubConnectCard isConnected={isGitHubConnected} />
        </div>
      </div>
    </div>
  );
}
