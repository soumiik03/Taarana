"use client";

import Link from "next/link";
import { statusStyles, type StatusType } from "../lib/status-styles";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Skeleton } from "~/components/ui/skeleton";
import { ScrollArea } from "~/components/ui/scroll-area";
import { MessageSquarePlus, FileText, GitPullRequest, Ship, ExternalLink, Sparkles, FolderKanban, Activity, AlertCircle } from "lucide-react";
import { useSession } from "~/lib/auth-client";
import { cn } from "~/lib/utils";
import { GitHubConnectCard } from "./github-connect-card";
import { trpc } from "~/trpc/client";

interface OverviewContentProps {
  isGitHubConnected?: boolean;
}

function OverviewSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Welcome Banner */}
      <div className="border-b border-[#2D2D2D] pb-6">
        <Skeleton className="h-9 w-64 bg-zinc-800 rounded mb-2" />
        <Skeleton className="h-4 w-96 bg-zinc-800 rounded" />
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-[#202020] border-[#2D2D2D]">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <Skeleton className="h-4 w-28 bg-zinc-800 rounded" />
              <Skeleton className="h-5 w-5 bg-zinc-800 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 bg-zinc-800 rounded mb-2" />
              <Skeleton className="h-3.5 w-32 bg-zinc-800 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-[#2D2D2D] bg-[#202020] p-6 h-96">
          <Skeleton className="h-6 w-48 bg-zinc-800 rounded mb-4" />
          <Skeleton className="h-4 w-full bg-zinc-800 rounded mb-3" />
          <div className="space-y-3 mt-6">
            <Skeleton className="h-10 w-full bg-zinc-850 rounded" />
            <Skeleton className="h-10 w-full bg-zinc-850 rounded" />
            <Skeleton className="h-10 w-full bg-zinc-850 rounded" />
          </div>
        </div>
        <div className="space-y-6">
          <Card className="bg-[#202020] border-[#2D2D2D] h-48">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-32 bg-zinc-800 rounded mb-4" />
              <Skeleton className="h-4 w-full bg-zinc-800 rounded mb-2" />
              <Skeleton className="h-10 w-full bg-zinc-800 rounded mt-6" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function OverviewContent({ isGitHubConnected = false }: OverviewContentProps) {
  const { data: session } = useSession();
  const userName = session?.user?.name || "Developer";

  const { data: overview, isLoading, error } = trpc.pullRequest.getOverview.useQuery(undefined, {
    refetchInterval: 5000,
  });

  if (isLoading) {
    return <OverviewSkeleton />;
  }

  if (error || !overview) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-red-500/20 bg-red-500/5 max-w-xl mx-auto my-8">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Error loading dashboard</h3>
        <p className="text-zinc-400 mb-6 text-sm">
          {error?.message || "Something went wrong while fetching dashboard analytics. Please verify your connection."}
        </p>
      </div>
    );
  }

  const metrics = [
    {
      title: "Total Feature Requests",
      value: overview.metrics.totalFeatures.toString(),
      description: `${overview.metrics.totalFeatures} requested total`,
      icon: MessageSquarePlus,
      color: "text-[#38BDF8]",
    },
    {
      title: "PRDs Generated",
      value: overview.metrics.prdsGenerated.toString(),
      description: `${overview.metrics.readyForApproval} approved`,
      icon: FileText,
      color: "text-[#F59E0B]",
    },
    {
      title: "PRs Reviewed",
      value: overview.metrics.prsReviewed.toString(),
      description: `${overview.metrics.openPrs} open review pipeline`,
      icon: GitPullRequest,
      color: "text-[#818CF8]",
    },
    {
      title: "Features Shipped",
      value: overview.metrics.shippedFeatures.toString(),
      description: "Merged branches",
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
        <div className="rounded-xl border border-[#2D2D2D] bg-[#202020] p-6 shadow-md lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#E3E3E3]">Active Feature Requests</h2>
              <p className="text-xs text-[#9B9B9B] mt-0.5">
                A list of feature requests that require review or action.
              </p>
            </div>
            <Link href="/dashboard/feature-requests/new" className="text-xs text-[#38BDF8] hover:underline font-medium">
              Create New
            </Link>
          </div>

          <div className="overflow-x-auto">
            {overview.featureRequests.length === 0 ? (
              <div className="text-center py-12 text-sm text-[#9B9B9B] border border-dashed border-[#2D2D2D] rounded-lg">
                No active feature requests found.
              </div>
            ) : (
              <Table className="min-w-full">
                <TableHeader className="border-b border-[#2D2D2D]">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[#9B9B9B] font-semibold text-xs py-3">Title</TableHead>
                    <TableHead className="text-[#9B9B9B] font-semibold text-xs py-3">Status</TableHead>
                    <TableHead className="text-[#9B9B9B] font-semibold text-xs py-3">Source</TableHead>
                    <TableHead className="text-[#9B9B9B] font-semibold text-xs py-3 text-right">PR Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overview.featureRequests.map((req) => {
                    const badge = statusStyles[req.status as StatusType] || {
                      bg: "bg-zinc-800/80",
                      text: "text-zinc-400",
                      dot: "bg-zinc-500",
                      label: req.status,
                    };
                    return (
                      <TableRow key={req.id} className="border-b border-[#2D2D2D]/60 hover:bg-[#252525]/60 transition-colors">
                        <TableCell className="text-sm font-semibold text-[#E3E3E3] py-3.5 max-w-[200px] truncate">
                          <Link href={`/dashboard/feature-requests/${req.id}`} className="hover:underline">
                            {req.title}
                          </Link>
                        </TableCell>
                        <TableCell className="py-3.5">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
                            badge.bg,
                            badge.text
                          )}>
                            <span className={cn("h-1.5 w-1.5 rounded-full", badge.dot)} />
                            {badge.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-[#E3E3E3] py-3.5 capitalize">
                          {req.source}
                        </TableCell>
                        <TableCell className="text-xs text-[#38BDF8] text-right font-medium py-3.5">
                          {req.githubPr ? (
                            <a href={req.githubPrUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 cursor-pointer hover:underline">
                              {req.githubPr}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-[#9B9B9B]/40">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        {/* GitHub integration, projects list & activity stream */}
        <div className="lg:col-span-1 space-y-6">
          <GitHubConnectCard isConnected={isGitHubConnected} />

          {/* Projects Card */}
          <Card className="bg-[#202020] border-[#2D2D2D] text-[#E3E3E3] shadow-md">
            <CardHeader className="pb-3 border-b border-[#2D2D2D]/60 flex flex-row items-center gap-2.5">
              <FolderKanban className="h-4.5 w-4.5 text-[#F59E0B]" />
              <div>
                <CardTitle className="text-sm font-bold">Active Projects</CardTitle>
                <CardDescription className="text-[10px] text-[#9B9B9B]">Engineering workspace projects</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-4 px-4 pb-4">
              {overview.projects.length === 0 ? (
                <div className="text-center py-4 text-xs text-[#9B9B9B]">No active projects.</div>
              ) : (
                <div className="space-y-3">
                  {overview.projects.map((proj) => (
                    <div key={proj.id} className="flex items-center justify-between p-2 rounded-lg bg-[#252525] border border-[#2D2D2D]/60">
                      <div>
                        <div className="text-xs font-semibold text-[#E3E3E3]">{proj.name}</div>
                        <div className="text-[10px] text-[#9B9B9B] max-w-[200px] truncate">{proj.description || "No description."}</div>
                      </div>
                      <Link href={`/dashboard/tasks`} className="text-[10px] text-[#38BDF8] hover:underline flex items-center gap-0.5">
                        Board <ExternalLink className="h-2.5 w-2.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity Card */}
          <Card className="bg-[#202020] border-[#2D2D2D] text-[#E3E3E3] shadow-md">
            <CardHeader className="pb-3 border-b border-[#2D2D2D]/60 flex flex-row items-center gap-2.5">
              <Activity className="h-4.5 w-4.5 text-[#818CF8]" />
              <div>
                <CardTitle className="text-sm font-bold">Recent Activity</CardTitle>
                <CardDescription className="text-[10px] text-[#9B9B9B]">Real-time review actions feed</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {overview.recentActivity.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#9B9B9B]">No recent activity.</div>
              ) : (
                <ScrollArea className="h-64">
                  <div className="divide-y divide-[#2D2D2D]/60 px-4">
                    {overview.recentActivity.map((act) => (
                      <div key={act.id} className="py-3 flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded",
                            act.type === "pr" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                            act.type === "feature" ? "bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20" :
                            "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          )}>
                            {act.title}
                          </span>
                          <span className="text-[9px] text-[#9B9B9B]">
                            {new Date(act.timestamp).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-xs text-[#E3E3E3] leading-relaxed">
                          {act.description}
                        </p>
                        <Link href={act.href} className="text-[10px] text-[#38BDF8] hover:underline self-start mt-1">
                          View details &rarr;
                        </Link>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
