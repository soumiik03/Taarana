"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { trpc } from "~/trpc/client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

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
    onError: (error) => {
      console.error("Browser Console - tRPC createRequest error:", error);
    },
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-zinc-200 font-medium">Title</label>
        <input
          className="rounded-lg border border-[#2D2D2D] bg-[#151516] px-4 py-2.5 text-white outline-none focus:border-white/40 transition-colors placeholder:text-zinc-600 text-sm"
          placeholder="e.g. Add Google login"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-zinc-200 font-medium">Description</label>
        <textarea
          className="rounded-lg border border-[#2D2D2D] bg-[#151516] px-4 py-2.5 text-white outline-none focus:border-white/40 transition-colors placeholder:text-zinc-600 min-h-[120px] resize-none text-sm"
          placeholder="Describe what you want to build and why..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Source */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-zinc-200 font-medium">Source</label>
        <Select value={source} onValueChange={(val) => setSource(val as any)}>
          <SelectTrigger className="w-full h-10 border border-[#2D2D2D] bg-[#151516] text-white rounded-lg px-4 py-2.5 text-sm focus:border-white/40 transition-colors outline-none flex items-center justify-between">
            <SelectValue placeholder="Select a source" />
          </SelectTrigger>
          <SelectContent className="bg-[#151516] border border-[#2D2D2D] text-white rounded-lg p-1">
            {SOURCE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-zinc-300 hover:text-white hover:bg-[#252525] focus:bg-[#252525] focus:text-white rounded-md py-2 px-3 text-sm cursor-pointer select-none outline-none">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          {createRequest.error?.message || "Something went wrong. Please try again."}
        </p>
      )}
    </div>
  );
}