"use client";

import { use, useEffect, useRef } from "react";
import type { SelectPrd } from "@repo/database/schema";
import { Button } from "~/components/ui/button";
import { PrdEditor } from "~/features/prd/components/prd-editor";
import { trpc } from "~/trpc/client";

type PrdContent = Pick<
  SelectPrd,
  | "problemStatement"
  | "goals"
  | "nonGoals"
  | "userStories"
  | "acceptanceCriteria"
  | "edgeCases"
  | "successMetrics"
>;

function hasGeneratedContent(prd: PrdContent) {
  return Boolean(
    prd.problemStatement ||
      (Array.isArray(prd.goals) && prd.goals.length > 0) ||
      (Array.isArray(prd.nonGoals) && prd.nonGoals.length > 0) ||
      (Array.isArray(prd.userStories) && prd.userStories.length > 0) ||
      (Array.isArray(prd.acceptanceCriteria) && prd.acceptanceCriteria.length > 0) ||
      (Array.isArray(prd.edgeCases) && prd.edgeCases.length > 0) ||
      (Array.isArray(prd.successMetrics) && prd.successMetrics.length > 0)
  );
}

function LoadingPrd({ isRetrying }: { isRetrying?: boolean }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <div className="h-8 w-72 animate-pulse rounded bg-zinc-800" />
        <div className="mt-3 h-4 w-full max-w-lg animate-pulse rounded bg-zinc-900" />
      </div>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <div className="text-sm font-medium text-zinc-300">
          {isRetrying ? "Restarting PRD generation..." : "Generating PRD..."}
        </div>
        <p className="mt-2 text-sm text-zinc-500">
          Taarana is turning the clarified request into a product requirements document.
        </p>
        <div className="mt-6 space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-zinc-900" />
          <div className="h-4 w-11/12 animate-pulse rounded bg-zinc-900" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-zinc-900" />
        </div>
      </div>
    </div>
  );
}

export default function PrdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const retriggeredRef = useRef(false);
  const utils = trpc.useUtils();

  const { data: prd, isLoading } = trpc.prd.getById.useQuery(
    { id },
    {
      refetchInterval: (query) => {
        const prd = query.state.data;
        return prd && hasGeneratedContent(prd) ? false : 3000;
      },
    }
  );

  const triggerGeneration = trpc.prd.trigger.useMutation({
    onSuccess: () => {
      utils.prd.getById.invalidate({ id });
    },
  });

  useEffect(() => {
    if (!prd || hasGeneratedContent(prd) || retriggeredRef.current) {
      return;
    }

    retriggeredRef.current = true;
    triggerGeneration.mutate({ featureRequestId: prd.featureRequestId });
  }, [prd, triggerGeneration]);

  if (isLoading) {
    return <LoadingPrd />;
  }

  if (!prd) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-bold text-white">PRD not found</h1>
        <p className="mt-2 text-sm text-zinc-400">
          This PRD may not have been created yet.
        </p>
      </div>
    );
  }

  if (!hasGeneratedContent(prd)) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <LoadingPrd isRetrying={triggerGeneration.isPending} />
        {triggerGeneration.isError && (
          <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            <div className="font-medium">PRD generation could not be started.</div>
            <p className="mt-1 text-red-200/80">{triggerGeneration.error.message}</p>
            <Button
              className="mt-4 bg-white text-black hover:bg-zinc-100"
              onClick={() => triggerGeneration.mutate({ featureRequestId: prd.featureRequestId })}
            >
              Try again
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Product Requirements Document</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Review and edit the AI-generated PRD. Approve it when ready to move
          to engineering tasks.
        </p>
      </div>
      <PrdEditor prd={prd as unknown as SelectPrd} />
    </div>
  );
}
