"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";

export function CTA() {
  return (
    <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-[#FAF9F7]/60 border border-[#E5E4E0] rounded-3xl p-8 md:p-16 text-center max-w-5xl mx-auto space-y-6 relative overflow-hidden shadow-sm">
        {/* Decorative background accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-400/5 rounded-full blur-3xl pointer-events-none" />

        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#1A1A1A]">
          Ready to ship faster?
        </h2>

        <p className="text-base md:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
          Connect your GitHub repository and start reviewing PRs against real requirements in minutes.
        </p>

        <div className="pt-4 flex flex-col items-center gap-3">
          <Link href="/sign-in" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto rounded-full bg-[#18181B] text-white hover:bg-[#2D2D30] font-semibold text-base px-8 py-6 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
              Get started free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <span className="text-xs text-zinc-400 font-medium">
            No credit card required. Free plan available.
          </span>
        </div>
      </div>
    </section>
  );
}
