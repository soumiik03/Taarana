"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { ChevronDown, Plus } from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  slug: string;
}

interface WorkspaceSwitcherProps {
  workspaces: Workspace[];
  currentWorkspace: Workspace;
}

export function WorkspaceSwitcher({
  workspaces,
  currentWorkspace,
}: WorkspaceSwitcherProps) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="flex items-center gap-2 w-full px-2.5 py-5 hover:bg-[#252525] hover:text-[#FFFFFF] text-[#E3E3E3] rounded-lg transition-colors focus:ring-0 justify-start"
          />
        }
      >
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-zinc-800 text-[10px] font-bold text-zinc-300 border border-zinc-700/60 shrink-0 uppercase">
            {currentWorkspace.name[0]}
          </div>
          <span className="font-semibold text-sm truncate tracking-tight text-left">
            {currentWorkspace.name}
          </span>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-[#9B9B9B] shrink-0 ml-auto" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        {workspaces.map((ws) => (
          <DropdownMenuItem
            key={ws.id}
            onClick={() => router.push(`/dashboard`)}
            className="cursor-pointer"
          >
            {ws.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem
          onClick={() => router.push("/create-workspace")}
          className="cursor-pointer text-zinc-400"
        >
          <Plus className="h-4 w-4 mr-2" />
          New workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}