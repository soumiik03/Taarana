"use client";

import Link from "next/link";
import { trpc } from "~/trpc/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { History, ExternalLink, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "~/lib/utils";

export default function ReviewHistoryPage() {
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
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-red-500/20 bg-red-500/5 max-w-xl mx-auto my-8">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Error loading review history</h3>
        <p className="text-zinc-400 mb-6 text-sm">
          {error.message || "Failed to load reviews from server."}
        </p>
        <Button onClick={() => refetch()} className="bg-white text-black hover:bg-zinc-100 font-semibold py-2 px-4 rounded-xl">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D2D2D]/60 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#E3E3E3] flex items-center gap-2">
            <History className="h-7 w-7 text-[#818CF8]" />
            Review History
          </h1>
          <p className="text-sm text-[#9B9B9B] mt-1">
            Audit log of all AI QA reviews run across your synchronized pull requests.
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
              <History className="h-6 w-6 text-[#9B9B9B]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold">No Reviews Run Yet</h3>
              <p className="text-sm text-[#9B9B9B] max-w-sm">
                Reviews will be recorded here automatically as soon as pull requests are opened or updated.
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
                  <TableHead className="text-[#9B9B9B] font-semibold text-xs py-3">Timestamp</TableHead>
                  <TableHead className="text-[#9B9B9B] font-semibold text-xs py-3">Pull Request</TableHead>
                  <TableHead className="text-[#9B9B9B] font-semibold text-xs py-3">Latest Commit</TableHead>
                  <TableHead className="text-[#9B9B9B] font-semibold text-xs py-3">Review Trigger</TableHead>
                  <TableHead className="text-[#9B9B9B] font-semibold text-xs py-3">Resolution</TableHead>
                  <TableHead className="text-[#9B9B9B] font-semibold text-xs py-3">Status</TableHead>
                  <TableHead className="text-[#9B9B9B] font-semibold text-xs py-3 text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prs.map((pr) => {
                  let resolutionBadge = {
                    bg: "bg-zinc-800/80 text-zinc-400 border border-zinc-700/50",
                    dot: "bg-zinc-500",
                    label: "Awaiting Commit",
                  };

                  if (pr.featureRequestId) {
                    switch (pr.featureRequestStatus) {
                      case "ready-for-approval":
                        resolutionBadge = {
                          bg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                          dot: "bg-emerald-500",
                          label: "Approved / Passed",
                        };
                        break;
                      case "fix-needed":
                        resolutionBadge = {
                          bg: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
                          dot: "bg-rose-500",
                          label: "Changes Requested",
                        };
                        break;
                      case "pending":
                        resolutionBadge = {
                          bg: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
                          dot: "bg-amber-500",
                          label: "AI Processing",
                        };
                        break;
                      case "clarifying":
                        resolutionBadge = {
                          bg: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
                          dot: "bg-indigo-500",
                          label: "Clarification Needed",
                        };
                        break;
                    }
                  }

                  const formattedDate = pr.updatedAt
                    ? new Date(pr.updatedAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—";

                  return (
                    <TableRow key={pr.id} className="border-b border-[#2D2D2D]/60 hover:bg-[#252525]/60 transition-colors">
                      <TableCell className="text-xs text-[#E3E3E3] py-4 whitespace-nowrap">
                        {formattedDate}
                      </TableCell>
                      <TableCell className="py-4 max-w-[200px] truncate">
                        <div className="font-semibold text-sm text-white">
                          {pr.title}
                        </div>
                        <div className="text-[10px] text-[#9B9B9B] font-mono mt-0.5">
                          {pr.repoOwner}/{pr.repoName} &middot; #{pr.prNumber}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-zinc-400 py-4">
                        {pr.headSha ? pr.headSha.slice(0, 7) : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-[#E3E3E3] py-4">
                        GitHub Webhook Push
                      </TableCell>
                      <TableCell className="py-4">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
                          resolutionBadge.bg
                        )}>
                          <span className={cn("h-1.5 w-1.5 rounded-full", resolutionBadge.dot)} />
                          {resolutionBadge.label}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="outline" className="text-[10px] font-bold bg-[#252525] text-white border-zinc-700/60 uppercase">
                          Completed
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-right py-4">
                        <Link href={`/dashboard/prs/${pr.id}`} className="text-[#38BDF8] hover:underline font-medium">
                          Audit Review &rarr;
                        </Link>
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
