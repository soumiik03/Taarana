"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { trpc } from "~/trpc/client";

const SOURCE_OPTIONS = [
  { value: "manual", label: "Manual" },
  { value: "email", label: "Email" },
  { value: "ticket", label: "Support Ticket" },
  { value: "call", label: "Customer Call" },
];

export function RequestForm({ organizationId }: { organizationId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [source, setSource] = useState<"email" | "ticket" | "call" | "manual">(
    "manual"
  );

  const createRequest = trpc.featureRequests.create.useMutation({
    onSuccess: (data) => {
      if (data?.id) {
        router.push(`/dashboard/feature-requests/${data.id}`);
      }
    },
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-zinc-400">Title</label>
        <input
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-white outline-none focus:border-zinc-600 placeholder:text-zinc-600"
          placeholder="e.g. Add Google login"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-zinc-400">Description</label>
        <textarea
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-white outline-none focus:border-zinc-600 placeholder:text-zinc-600 min-h-[120px] resize-none"
          placeholder="Describe what you want to build and why..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Source */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-zinc-400">Source</label>
        <select
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-white outline-none focus:border-zinc-600"
          value={source}
          onChange={(e) =>
            setSource(e.target.value as "email" | "ticket" | "call" | "manual")
          }
        >
          {SOURCE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <Button
        onClick={() =>
          createRequest.mutate({ organizationId, title, description, source })
        }
        disabled={!title || !description || createRequest.isPending}
        className="mt-2 w-full bg-white text-black hover:bg-zinc-100"
      >
        {createRequest.isPending ? "Submitting..." : "Submit Feature Request"}
      </Button>

      {createRequest.isError && (
        <p className="text-sm text-red-400">
          Something went wrong. Please try again.
        </p>
      )}
    </div>
  );
}