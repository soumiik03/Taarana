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
            className="flex items-center gap-2 w-full justify-between px-3"
          />
        }
      >
        <span className="font-semibold truncate">{currentWorkspace.name}</span>
        <ChevronDown className="h-4 w-4 text-zinc-400 shrink-0" />
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