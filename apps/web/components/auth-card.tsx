"use client";

import Image from "next/image";
import { useState } from "react";
import { signIn } from "~/lib/auth-client";
import { Button } from "~/components/ui/button";
import { useSearchParams } from "next/navigation";

export function AuthCard() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [error, setError] = useState<string | null>(null);

  const handleGitHubSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signIn.social({
        provider: "github",
        callbackURL: callbackUrl,
      });
      // If signIn.social returns an error instead of redirecting
      if (result?.error) {
        console.error("Sign in error:", result.error);
        setError(result.error.message || "Sign in failed. Please try again.");
        setIsLoading(false);
      }
      // If we reach here without redirect, something went wrong
    } catch (err) {
      console.error("Sign in failed:", err);
      setError("Failed to connect to authentication server. Please try again.");
      setIsLoading(false);
    }
  };
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-black px-4 text-white overflow-hidden selection:bg-white selection:text-black">
      {/* Premium Minimal Dotted Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1f1f23_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_65%,transparent_100%)] opacity-70 pointer-events-none" />

      {/* Subtle top/center soft glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-zinc-900/30 rounded-full blur-[140px] pointer-events-none" />

      {/* Ambient background glow directly behind the card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-white/[0.03] rounded-full blur-[100px] pointer-events-none" />

      <div className="z-10 w-full max-w-[420px] flex flex-col items-center">
        {/* Card Component - High Contrast Glassmorphism / Notion-inspired Dark Mode */}
        <div className="w-full rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-8 shadow-[0_0_50px_rgba(0,0,0,0.8),0_0_1px_rgba(255,255,255,0.1)_inset] backdrop-blur-xl relative overflow-hidden group">
          {/* Subtle inside interactive glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none group-hover:bg-white/10 transition-all duration-700" />

          {/* Logo Container - Integrated cleanly inside the card at the top */}
          <div className="flex justify-center mt-4 mb-6 transition-transform duration-500 hover:scale-105">
            <div className="relative h-24 w-52 overflow-visible">
              <Image
                src="/logo.png"
                alt="Taarana Logo"
                fill
                className="object-contain filter invert opacity-95 group-hover:opacity-100 transition-opacity duration-300 scale-[1.75]"
                priority
              />
            </div>
          </div>

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Welcome
            </h1>
            <p className="mt-2.5 text-sm text-zinc-400 font-medium">
              Sign in with GitHub to review and manage your code.
            </p>
          </div>

           {/* Action Button */}
          <div className="space-y-4">
            <Button
              onClick={handleGitHubSignIn}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-white py-6 text-base font-semibold text-black hover:bg-zinc-100 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-[0_4px_20px_rgba(255,255,255,0.08)] hover:shadow-[0_4px_25px_rgba(255,255,255,0.15)] border border-zinc-200"
            >
              {isLoading ? (
                <svg
                  className="h-5 w-5 animate-spin text-black"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5 fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
              )}
              Continue with GitHub
            </Button>
            {error && (
              <p className="text-center text-sm text-red-400 font-medium animate-in fade-in duration-300">
                {error}
              </p>
            )}
          </div>

          {/* Footnote - centered and beautifully constrained */}
          <p className="mt-8 text-center text-[11px] leading-relaxed text-zinc-500 font-normal max-w-[280px] mx-auto">
            We only request the permissions needed to identify your account. You
            can revoke access anytime from GitHub settings.
          </p>
        </div>
      </div>
    </div>
  );
}
