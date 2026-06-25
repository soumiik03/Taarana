"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { trpc } from "~/trpc/client";
import type { SelectPrd } from "@repo/database/schema";

function EditableList({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-zinc-400">{label}</label>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-zinc-600"
            value={item}
            onChange={(e) => {
              const updated = [...items];
              updated[i] = e.target.value;
              onChange(updated);
            }}
          />
          <button
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            className="text-zinc-500 hover:text-red-400 text-sm px-2"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...items, ""])}
        className="text-sm text-zinc-500 hover:text-white text-left"
      >
        + Add item
      </button>
    </div>
  );
}

export function PrdEditor({ prd }: { prd: SelectPrd }) {
  const router = useRouter();
  const [problemStatement, setProblemStatement] = useState(
    prd.problemStatement ?? ""
  );
  const [goals, setGoals] = useState<string[]>((prd.goals as string[]) ?? []);
  const [nonGoals, setNonGoals] = useState<string[]>((prd.nonGoals as string[]) ?? []);
  const [userStories, setUserStories] = useState<string[]>((prd.userStories as string[]) ?? []);
  const [acceptanceCriteria, setAcceptanceCriteria] = useState<string[]>((prd.acceptanceCriteria as string[]) ?? []);
  const [edgeCases, setEdgeCases] = useState<string[]>((prd.edgeCases as string[]) ?? []);
  const [successMetrics, setSuccessMetrics] = useState<string[]>((prd.successMetrics as string[]) ?? []);

  const update = trpc.prd.update.useMutation();
  const approve = trpc.prd.approve.useMutation({
    onSuccess: (data) => {
      router.push(`/dashboard/tasks/${data.id}`);
    },
  });

  const handleSave = () => {
    update.mutate({
      id: prd.id,
      problemStatement,
      goals,
      nonGoals,
      userStories,
      acceptanceCriteria,
      edgeCases,
      successMetrics,
    });
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Status banner */}
      <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-3">
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              prd.status === "approved" ? "bg-green-500" : "bg-yellow-500"
            }`}
          />
          <span className="text-sm text-zinc-400 capitalize">{prd.status}</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={update.isPending}
            className="border-zinc-700 text-zinc-300"
          >
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
          {prd.status === "draft" && (
            <Button
              onClick={() => approve.mutate({ id: prd.id })}
              disabled={approve.isPending}
              className="bg-white text-black hover:bg-zinc-100"
            >
              {approve.isPending ? "Approving..." : "Approve PRD"}
            </Button>
          )}
        </div>
      </div>

      {/* Problem Statement */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-zinc-400">
          Problem Statement
        </label>
        <textarea
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-zinc-600 min-h-[100px] resize-none text-sm"
          value={problemStatement}
          onChange={(e) => setProblemStatement(e.target.value)}
        />
      </div>

      <EditableList label="Goals" items={goals} onChange={setGoals} />
      <EditableList label="Non-Goals" items={nonGoals} onChange={setNonGoals} />
      <EditableList
        label="User Stories"
        items={userStories}
        onChange={setUserStories}
      />
      <EditableList
        label="Acceptance Criteria"
        items={acceptanceCriteria}
        onChange={setAcceptanceCriteria}
      />
      <EditableList
        label="Edge Cases"
        items={edgeCases}
        onChange={setEdgeCases}
      />
      <EditableList
        label="Success Metrics"
        items={successMetrics}
        onChange={setSuccessMetrics}
      />
    </div>
  );
}
