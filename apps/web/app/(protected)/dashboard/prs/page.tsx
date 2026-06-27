"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { GitPullRequest, ExternalLink, RefreshCw, AlertCircle, Inbox } from "lucide-react";
import { cn } from "~/lib/utils";

export default function PullRequestsPage() {
  const router = useRouter();
  const { data: prs, isLoading, error, refetch, isRefetching } = trpc.pullRequest.getAll.useQuery(undefined, {
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#2D2D2D]/60 pb-6">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-zinc-800 rounded animate-pulse" />
            <div className="h-4 w-72 bg-zinc-800 rounded animate-pulse" />
          </div>
          <div className="h-9 w-24 bg-zinc-800 rounded animate-pulse" />
        </div>
        <div className="border border-[#2D2D2D] rounded-xl bg-[#202020] p-6 space-y-4 animate-pulse">
          <div className="h-8 w-full bg-zinc-850 rounded" />
          <div className="h-8 w-full bg-zinc-850 rounded" />
          <div className="h-8 w-full bg-zinc-850 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-red-500/20 bg-red-500/5 max-w-xl mx-auto my-8">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Error loading pull requests</h3>
        <p className="text-zinc-400 mb-6 text-sm">
          {error.message || "Failed to load pull requests from server."}
        </p>
        <Button onClick={() => refetch()} className="bg-white text-black hover:bg-zinc-100 font-semibold py-2 px-4 rounded-xl cursor-pointer">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D2D2D]/60 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#E3E3E3]">Pull Requests</h1>
          <p className="text-sm text-[#9B9B9B] mt-1">
            Monitor incoming pull requests, linked feature requests, and their AI review statuses.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="bg-[#202020] border-[#2D2D2D] text-[#E3E3E3] hover:bg-[#252525] hover:text-[#FFFFFF] cursor-pointer"
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", isRefetching && "animate-spin")} />
          {isRefetching ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {!prs || prs.length === 0 ? (
        <Card className="bg-[#202020] border-[#2D2D2D] text-[#E3E3E3] shadow-md p-12 text-center max-w-lg mx-auto">
          <CardContent className="flex flex-col items-center pt-6 space-y-4">
            <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center">
              <Inbox className="h-6 w-6 text-[#9B9B9B]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold">No Pull Requests Yet</h3>
              <p className="text-sm text-[#9B9B9B] max-w-sm">
                Open a pull request on your connected GitHub repository to trigger the AI review pipeline.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl border border-[#2D2D2D] bg-[#202020] p-6 shadow-md">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader className="border-b border-[#2D2D2D]">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[#9B9B9B] font-semibold text-xs py-3">PR Number</TableHead>
                  <TableHead className="text-[#9B9B9B] font-semibold text-xs py-3">Title</TableHead>
                  <TableHead className="text-[#9B9B9B] font-semibold text-xs py-3">Repository</TableHead>
                  <TableHead className="text-[#9B9B9B] font-semibold text-xs py-3">Branch</TableHead>
                  <TableHead className="text-[#9B9B9B] font-semibold text-xs py-3">Feature Link</TableHead>
                  <TableHead className="text-[#9B9B9B] font-semibold text-xs py-3">Review Status</TableHead>
                  <TableHead className="text-[#9B9B9B] font-semibold text-xs py-3 text-right">GitHub</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prs.map((pr) => {
                  let reviewBadge = {
                    bg: "bg-zinc-800/80 text-zinc-400 border border-zinc-700/50",
                    dot: "bg-zinc-500",
                    label: "No Linked Feature",
                  };

                  if (pr.featureRequestId) {
                    switch (pr.featureRequestStatus) {
                      case "ready-for-approval":
                        reviewBadge = {
                          bg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                          dot: "bg-emerald-500",
                          label: "Ready for Approval",
                        };
                        break;
                      case "fix-needed":
                        reviewBadge = {
                          bg: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
                          dot: "bg-rose-500",
                          label: "Fix Needed",
                        };
                        break;
                      case "pending":
                        reviewBadge = {
                          bg: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
                          dot: "bg-amber-500",
                          label: "AI Reviewing...",
                        };
                        break;
                      case "clarifying":
                        reviewBadge = {
                          bg: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
                          dot: "bg-indigo-500",
                          label: "Clarifying Request",
                        };
                        break;
                      default:
                        reviewBadge = {
                          bg: "bg-zinc-800/80 text-zinc-400 border border-zinc-700/50",
                          dot: "bg-zinc-500",
                          label: pr.featureRequestStatus || "Pending",
                        };
                    }
                  }

                  return (
                    <TableRow
                      key={pr.id}
                      onClick={() => router.push(`/dashboard/prs/${pr.id}`)}
                      className="border-b border-[#2D2D2D]/60 hover:bg-[#252525]/60 transition-colors cursor-pointer"
                    >
                      <TableCell className="font-mono text-xs text-[#9B9B9B] font-medium py-4">
                        #{pr.prNumber}
                      </TableCell>
                      <TableCell className="text-sm font-semibold text-[#E3E3E3] py-4 max-w-[200px] truncate">
                        {pr.title}
                      </TableCell>
                      <TableCell className="text-xs text-[#E3E3E3] py-4">
                        {pr.repoOwner}/{pr.repoName}
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-zinc-400 py-4 max-w-[120px] truncate">
                        {pr.branch}
                      </TableCell>
                      <TableCell className="text-xs text-[#E3E3E3] py-4 max-w-[180px] truncate">
                        {pr.featureRequestTitle ? (
                          <span className="font-medium hover:underline text-[#38BDF8]">
                            {pr.featureRequestTitle}
                          </span>
                        ) : (
                          <span className="text-[#9B9B9B]/40">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-4">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
                          reviewBadge.bg
                        )}>
                          <span className={cn("h-1.5 w-1.5 rounded-full", reviewBadge.dot)} />
                          {reviewBadge.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-[#38BDF8] text-right font-medium py-4" onClick={(e) => e.stopPropagation()}>
                        <a href={pr.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline cursor-pointer">
                          Link
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
