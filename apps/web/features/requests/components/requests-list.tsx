"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { trpc } from "~/trpc/client";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { ArrowRight, Clock, MessageSquarePlus, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";

type FeatureRequest = {
  id: string;
  title: string;
  status: string;
  source: string;
  createdAt: string | Date | null;
};

function RequestCard({ request }: { request: FeatureRequest }) {
  const { data: prd } = trpc.prd.getByFeatureRequest.useQuery(
    { featureRequestId: request.id },
    {
      enabled: request.status === "ready",
      refetchInterval: (query) => (query.state.data ? false : 3000),
    }
  );

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const utils = trpc.useContext();
  const deleteMutation = trpc.featureRequests.delete.useMutation({
    onSuccess: () => {
      utils.featureRequests.getByOrg.invalidate();
      utils.pullRequest.getOverview.invalidate();
      setIsConfirmOpen(false);
    },
  });

  const createdAt = useMemo(() => {
    if (!request.createdAt) return "-";
    const date = new Date(request.createdAt);
    return Number.isNaN(date.getTime())
      ? "-"
      : date.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
  }, [request.createdAt]);

  const canViewPrd = request.status === "ready" && !!prd?.id;
  const canViewTasks = prd?.status === "approved" && !!prd.id;

  const statusClass = (() => {
    switch (request.status) {
      case "ready":
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
      case "clarifying":
        return "border-indigo-500/30 bg-indigo-500/10 text-indigo-400";
      case "rejected":
        return "border-red-500/30 bg-red-500/10 text-red-400";
      default:
        return "border-zinc-500/30 bg-zinc-500/10 text-zinc-400";
    }
  })();

  return (
    <Card className="border-zinc-800 bg-zinc-900 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20">
      <CardHeader className="border-b border-zinc-800/80 px-4 py-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={`capitalize ${statusClass}`}>
                {request.status}
              </Badge>
              <Badge variant="outline" className="border-zinc-700 bg-zinc-950 text-zinc-300 capitalize">
                {request.source}
              </Badge>
            </div>
            
            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
              <AlertDialogTrigger
                render={
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setIsConfirmOpen(true);
                    }}
                    disabled={deleteMutation.isPending}
                    className="text-zinc-500 hover:text-red-400 p-1.5 rounded transition-colors"
                    title="Delete request"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                }
              />
              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Delete Feature Request</AlertDialogTitle>
                  <AlertDialogDescription className="text-zinc-400">
                    Are you sure you want to delete this feature request? This will permanently delete its PRD, acceptance criteria, and all generated tasks. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setIsConfirmOpen(false)} className="border-zinc-800 bg-zinc-900 text-white hover:bg-zinc-800">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-650 text-white hover:bg-red-700"
                    disabled={deleteMutation.isPending}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMutation.mutate({ id: request.id });
                    }}
                  >
                    {deleteMutation.isPending ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <Link
            href={`/dashboard/feature-requests/${request.id}`}
            className="text-left text-base font-semibold text-white transition-colors hover:text-zinc-200"
          >
            {request.title}
          </Link>
          <div className="text-xs text-zinc-500">Created {createdAt}</div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2 px-4 py-4">
        {canViewPrd && (
          <Button
            size="sm"
            variant="outline"
            render={<Link href={`/dashboard/prds/${prd.id}`} />}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            View PRD
          </Button>
        )}
        {canViewTasks && (
          <Button
            size="sm"
            variant="outline"
            render={<Link href={`/dashboard/tasks/${prd.id}`} />}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            View Tasks
          </Button>
        )}
        {request.status === "ready-for-approval" && (
          <Link
            href={`/dashboard/approval/${request.id}`}
            className="text-xs px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20"
          >
            Review & Approve →
          </Link>
        )}
        <Button
          size="sm"
          variant="ghost"
          render={<Link href={`/dashboard/feature-requests/${request.id}`} />}
          className="text-zinc-400 hover:bg-zinc-800 hover:text-white"
        >
          Open Request
        </Button>
      </CardContent>
    </Card>
  );
}

function RequestsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-48 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900"
        />
      ))}
    </div>
  );
}

export function FeatureRequestsList({ organizationId }: { organizationId: string }) {
  const { data: requests, isLoading } = trpc.featureRequests.getByOrg.useQuery({
    organizationId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
          <div className="space-y-3">
            <div className="h-8 w-56 animate-pulse rounded bg-zinc-800" />
            <div className="h-4 w-96 animate-pulse rounded bg-zinc-800" />
          </div>
          <div className="h-10 w-36 animate-pulse rounded bg-zinc-800" />
        </div>
        <RequestsSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-zinc-800 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Feature Requests</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Review requests, open their PRDs, and jump into the task board once approved.
          </p>
        </div>
        <Link href="/dashboard/feature-requests/new">
          <Button className="flex items-center gap-2 bg-white font-semibold text-black hover:bg-zinc-200">
            <MessageSquarePlus className="h-4 w-4" />
            New Request
          </Button>
        </Link>
      </div>

      {!requests || requests.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-12 text-center shadow-sm">
          <Clock className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
          <h3 className="text-lg font-semibold text-white">No feature requests yet</h3>
          <p className="mt-1 mb-6 text-sm text-zinc-500">
            Create your first feature request to start the AI workflow.
          </p>
          <Link href="/dashboard/feature-requests/new">
            <Button className="bg-zinc-900 text-white hover:bg-zinc-800">
              Create your first feature request
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {requests.map((request) => (
            <RequestCard key={request.id} request={request as FeatureRequest} />
          ))}
        </div>
      )}
    </div>
  );
}
