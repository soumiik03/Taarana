"use client";

import { RefreshCw, GitBranch, Lock, Globe, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { trpc } from "~/trpc/client";
import { cn } from "~/lib/utils";

// GITHUB App slug — derived from the app name "Taarana AI" → "taarana-ai"
const GITHUB_APP_SLUG = "taarana-ai";

export function ReposList() {
  const { data, isLoading, error, refetch, isRefetching } = trpc.github.getRepos.useQuery(undefined, {
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const handleInstallRedirect = () => {
    window.location.href = `https://github.com/apps/${GITHUB_APP_SLUG}/installations/new`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-zinc-800 rounded animate-pulse" />
            <div className="h-4 w-72 bg-zinc-800 rounded animate-pulse" />
          </div>
          <div className="h-9 w-24 bg-zinc-800 rounded animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-[#202020] border-[#2D2D2D] shadow-md">
              <CardHeader className="pb-2">
                <div className="h-5 w-40 bg-zinc-800 rounded animate-pulse" />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="h-4 w-full bg-zinc-800 rounded animate-pulse" />
                <div className="h-3 w-24 bg-zinc-800 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="bg-[#202020] border-[#2D2D2D] text-[#E3E3E3] shadow-md max-w-lg mx-auto mt-8">
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Connection Error
          </CardTitle>
          <CardDescription className="text-[#9B9B9B]">
            Failed to fetch repositories from the server.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[#9B9B9B]">
            {error?.message || "There was a problem loading your repositories. Please try again."}
          </p>
          <Button onClick={() => refetch()} className="w-full bg-white text-black hover:bg-zinc-100 font-semibold py-5 rounded-xl cursor-pointer">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Not connected state
  if (!data.connected) {
    return (
      <Card className="bg-[#202020] border-[#2D2D2D] text-[#E3E3E3] shadow-md max-w-xl mx-auto mt-8 text-center p-6">
        <CardHeader className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
            <GitBranch className="h-6 w-6 text-[#9B9B9B]" />
          </div>
          <CardTitle className="text-xl font-bold">Connect GitHub Repositories</CardTitle>
          <CardDescription className="text-[#9B9B9B] max-w-sm mt-2">
            Install the Taarana GitHub App on your account or organization to start syncing your codebase.
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-4">
          <Button onClick={handleInstallRedirect} className="w-full bg-white text-black hover:bg-zinc-100 font-semibold py-5 rounded-xl cursor-pointer shadow-[0_4px_20px_rgba(255,255,255,0.08)]">
            Install GitHub App
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D2D2D]/60 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#E3E3E3]">Connected Repositories</h1>
          <p className="text-sm text-[#9B9B9B] mt-1">
            Managing {data.repos.length} synchronized repositories for code analysis and pull requests.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="bg-[#202020] border-[#2D2D2D] text-[#E3E3E3] hover:bg-[#252525] hover:text-[#FFFFFF] cursor-pointer"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefetching && "animate-spin")} />
            {isRefetching ? "Syncing..." : "Sync Repos"}
          </Button>
          <Button
            variant="outline"
            onClick={handleInstallRedirect}
            className="bg-transparent border-[#2D2D2D] text-[#9B9B9B] hover:bg-[#202020] hover:text-[#E3E3E3] cursor-pointer"
          >
            Manage on GitHub
          </Button>
        </div>
      </div>

      {/* Repositories grid list */}
      {data.repos.length === 0 ? (
        <Card className="bg-[#202020] border-[#2D2D2D] text-[#E3E3E3] shadow-md p-8 text-center max-w-lg mx-auto">
          <CardContent className="space-y-4 pt-6">
            <p className="text-sm text-[#9B9B9B]">
              No repositories found. Make sure you selected repositories during the GitHub App installation.
            </p>
            <Button onClick={handleInstallRedirect} className="w-full bg-white text-black hover:bg-zinc-100 font-semibold py-5 rounded-xl cursor-pointer">
              Configure Repositories
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.repos.map((repo) => (
            <Card
              key={repo.id}
              className="bg-[#202020] border-[#2D2D2D] text-[#E3E3E3] hover:border-zinc-700 transition-all duration-300 shadow-md group relative overflow-hidden"
            >
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/[0.01] rounded-full blur-3xl pointer-events-none group-hover:bg-white/[0.03] transition-all duration-700" />
              <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                <div className="space-y-1 pr-6">
                  <a
                    href={repo.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-base text-[#E3E3E3] hover:text-white flex items-center gap-1.5 break-all cursor-pointer"
                  >
                    {repo.name}
                    <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </a>
                  <p className="text-[11px] font-mono text-[#9B9B9B]">{repo.fullName}</p>
                </div>
                <div>
                  {repo.private ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
                      <Lock className="h-2.5 w-2.5" />
                      Private
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/20">
                      <Globe className="h-2.5 w-2.5" />
                      Public
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-[#9B9B9B] line-clamp-2 h-10 leading-relaxed">
                  {repo.description || "No description provided."}
                </p>
                <div className="text-[10px] text-[#9B9B9B] flex items-center justify-between border-t border-[#2D2D2D]/60 pt-2">
                  <span>Last Synced: {repo.updatedAt ? new Date(repo.updatedAt).toLocaleDateString() : "Never"}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
