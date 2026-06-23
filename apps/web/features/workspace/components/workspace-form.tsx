"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { trpc } from "~/trpc/client";

export function WorkspaceForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const createWorkspace = trpc.workspace.create.useMutation({
    onSuccess: () => {
      router.push("/dashboard");
    },
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-zinc-400">Workspace name</label>
        <input
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-white outline-none focus:border-zinc-600"
          placeholder="Acme Inc"
          value={name}
          onChange={handleNameChange}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-zinc-400">Workspace URL</label>
        <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5">
          <span className="text-zinc-500 text-sm">taarana.com/</span>
          <input
            className="flex-1 bg-transparent text-white outline-none text-sm"
            placeholder="acme-inc"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </div>
      </div>
      <Button
        onClick={() => createWorkspace.mutate({ name, slug })}
        disabled={!name || !slug || createWorkspace.isPending}
        className="mt-2 w-full bg-white text-black hover:bg-zinc-100"
      >
        {createWorkspace.isPending ? "Creating..." : "Create workspace"}
      </Button>
    </div>
  );
}