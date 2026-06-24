"use client";

import { useState } from "react";
import { Github, CheckCircle2, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useSearchParams } from "next/navigation";
import { cn } from "~/lib/utils";

// GitHub App slug — derived from the app name "Taarana AI" → "taarana-ai"
const GITHUB_APP_SLUG = "taarana-ai";

interface GitHubConnectCardProps {
  /** Whether GitHub is already connected (installation exists) */
  isConnected?: boolean;
}

export function GitHubConnectCard({ isConnected = false }: GitHubConnectCardProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const searchParams = useSearchParams();
  const justConnected = searchParams.get("github") === "connected";
  const error = searchParams.get("error");

  const connected = isConnected || justConnected;

  const handleInstall = () => {
    setIsRedirecting(true);
    // Redirect to GitHub App installation page
    window.location.href = `https://github.com/apps/${GITHUB_APP_SLUG}/installations/new`;
  };

  return (
    <Card className="bg-[#202020] border-[#2D2D2D] text-[#E3E3E3] shadow-md overflow-hidden relative group">
      {/* Subtle glow effect on hover */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/[0.02] rounded-full blur-3xl pointer-events-none group-hover:bg-white/[0.05] transition-all duration-700" />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-semibold text-[#E3E3E3] flex items-center gap-2">
          <Github className="h-5 w-5" />
          GitHub Integration
        </CardTitle>
        {connected && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            Connected
          </span>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {connected ? (
          <div className="space-y-3">
            <p className="text-sm text-[#9B9B9B]">
              Your GitHub App is installed and connected to this workspace.
              Repositories are synced and ready for PR reviews.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                window.open(
                  `https://github.com/apps/${GITHUB_APP_SLUG}/installations/new`,
                  "_blank"
                )
              }
              className="bg-transparent border-[#2D2D2D] text-[#9B9B9B] hover:bg-[#252525] hover:text-[#E3E3E3] hover:border-zinc-600 cursor-pointer transition-all duration-200"
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              Manage Installation
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-[#9B9B9B] leading-relaxed">
              Connect your GitHub account to enable automated PR reviews,
              repository syncing, and code analysis for your workspace.
            </p>

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/20">
                {error === "missing_installation_id"
                  ? "Installation was not completed. Please try again."
                  : error === "install_failed"
                    ? "Failed to save installation. Please try again."
                    : "Something went wrong. Please try again."}
              </p>
            )}

            <Button
              onClick={handleInstall}
              disabled={isRedirecting}
              className={cn(
                "w-full flex items-center justify-center gap-2.5 rounded-xl py-5 text-sm font-semibold transition-all duration-300 cursor-pointer",
                "bg-white text-black hover:bg-zinc-100 active:scale-[0.98]",
                "shadow-[0_4px_20px_rgba(255,255,255,0.06)] hover:shadow-[0_4px_25px_rgba(255,255,255,0.12)]",
                "border border-zinc-200 disabled:opacity-50"
              )}
            >
              {isRedirecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Github className="h-4 w-4" />
              )}
              {isRedirecting ? "Redirecting to GitHub..." : "Install GitHub App"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
