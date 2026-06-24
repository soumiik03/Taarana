"use client";

import { use } from "react";
import { trpc } from "~/trpc/client";
import { ClarificationChat } from "~/features/requests/components/clarification-chat";
import { Badge } from "~/components/ui/badge";

export default function FeatureRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: request, isLoading } = trpc.featureRequests.getById.useQuery(
    { id },
    { refetchInterval: 5000 } // Poll every 5s to check if status changes from pending to clarifying/ready
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 animate-pulse">
        <div className="h-8 bg-zinc-800 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-zinc-800 rounded w-2/3 mb-8"></div>
        <div className="h-32 bg-zinc-900 rounded-2xl border border-zinc-800"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-zinc-400">Feature request not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* Status Banner */}
      <div
        className={`mb-6 rounded-lg border p-4 text-sm font-medium ${
          request.status === "ready"
            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
            : request.status === "clarifying"
            ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-400"
            : request.status === "rejected"
            ? "border-red-500/50 bg-red-500/10 text-red-400"
            : "border-zinc-500/50 bg-zinc-500/10 text-zinc-400"
        }`}
      >
        <div className="flex items-center justify-between">
          <span>Status: {request.status.toUpperCase()}</span>
          {request.status === "pending" && <span>AI is analyzing...</span>}
          {request.status === "clarifying" && <span>Needs more information</span>}
          {request.status === "ready" && <span>Ready for development</span>}
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">{request.title}</h1>
          <Badge variant="outline" className="text-zinc-400 capitalize">
            {request.source}
          </Badge>
        </div>
        <p className="mt-4 text-zinc-300 whitespace-pre-wrap leading-relaxed">
          {request.description}
        </p>
      </div>

      {request.status !== "pending" && request.status !== "rejected" && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
          <ClarificationChat featureRequestId={request.id} />
        </div>
      )}
    </div>
  );
}
