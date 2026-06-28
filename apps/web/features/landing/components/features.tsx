"use client";

import { GitBranch, History, FileText } from "lucide-react";

export function Features() {
  return (
    <section id="features" className="py-32 px-6 md:px-12 lg:px-20 bg-white border-b border-[#E5E5E5]/60">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-xl">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-2">Capabilities</span>
            <h2 className="font-sans text-4xl md:text-5xl font-semibold text-[#111111] tracking-tight mb-6 leading-[1.1]">
              Structured verification.
              <span className="text-[#737373] block">Not just syntax linting.</span>
            </h2>
            <p className="text-[#737373] text-lg leading-relaxed">
              Bridge the gap between business specifications and code implementations with a platform designed for verifiable shipping.
            </p>
          </div>
          <a
            href="#how-it-works"
            className="pb-1 border-b border-[#111111] text-xs font-bold hover:opacity-70 transition-opacity mb-2 uppercase tracking-wider"
          >
            Explore Platform Flow
          </a>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Card 1: Requirement Lineage (md:col-span-8) */}
          <div className="md:col-span-8 group relative bg-white border border-[#E5E5E5] rounded-xl overflow-hidden hover:border-[#111111]/30 transition-all duration-500">
            {/* Grid background effect */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000004_1px,transparent_1px),linear-gradient(to_bottom,#00000004_1px,transparent_1px)] bg-[size:24px_24px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

            <div className="relative z-10 p-10 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="max-w-md">
                  <div className="w-10 h-10 bg-[#FAFAFA] border border-[#E5E5E5] rounded flex items-center justify-center mb-6 text-[#111111] shadow-sm">
                    <GitBranch className="h-5 w-5" />
                  </div>
                  <h3 className="text-2xl font-semibold text-[#111111] mb-3">
                    Requirement Lineage
                  </h3>
                  <p className="text-[#737373] leading-relaxed text-sm">
                    Traverse the verification graph from pull request line changes back to the original PRD acceptance criteria. Every code path is traceable.
                  </p>
                </div>
                <div className="hidden lg:block">
                  <div className="px-3 py-1 bg-[#FAFAFA] border border-[#E5E5E5] rounded text-[10px] font-mono text-[#737373] uppercase tracking-wider group-hover:text-[#111111] group-hover:border-[#111111]/30 transition-colors">
                    Lineage Trace
                  </div>
                </div>
              </div>

              {/* Animated SVG Path Visual */}
              <div className="mt-12 h-32 w-full relative flex items-center border-t border-[#E5E5E5]/40 pt-6 overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 600 100" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <marker id="arrow-head-trace" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
                      <path d="M0,0 L4,2 L0,4" fill="#111"></path>
                    </marker>
                  </defs>

                  {/* Faint base path */}
                  <path d="M20,50 C100,50 120,20 200,20 C280,20 300,80 380,80 C460,80 480,50 560,50" fill="none" stroke="#E5E5E5" strokeWidth="1.5" strokeDasharray="4 4"></path>

                  {/* Highlight animated path on hover */}
                  <path
                    d="M20,50 C100,50 120,20 200,20 C280,20 300,80 380,80 C460,80 480,50 560,50"
                    fill="none"
                    stroke="#111"
                    strokeWidth="1.5"
                    strokeDasharray="600"
                    strokeDashoffset="600"
                    className="transition-all duration-[1500ms] ease-in-out group-hover:stroke-dashoffset-0"
                    markerEnd="url(#arrow-head-trace)"
                  ></path>

                  {/* Interactive node dots */}
                  <g className="transition-all duration-500 delay-0 opacity-100 group-hover:scale-110 origin-center">
                    <circle cx="20" cy="50" r="4" fill="#111"></circle>
                    <text x="20" y="70" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="#737373" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      REQUEST
                    </text>
                  </g>
                  <g className="transition-all duration-500 delay-[400ms] opacity-50 scale-75 group-hover:opacity-100 group-hover:scale-100 origin-center">
                    <circle cx="200" cy="20" r="4" fill="#fff" stroke="#111" strokeWidth="1.5"></circle>
                    <text x="200" y="40" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="#737373" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      SPEC
                    </text>
                  </g>
                  <g className="transition-all duration-500 delay-[800ms] opacity-50 scale-75 group-hover:opacity-100 group-hover:scale-100 origin-center">
                    <circle cx="380" cy="80" r="4" fill="#fff" stroke="#111" strokeWidth="1.5"></circle>
                    <text x="380" y="100" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="#737373" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      QA REVIEW
                    </text>
                  </g>
                  <g className="transition-all duration-500 delay-[1200ms] opacity-50 scale-75 group-hover:opacity-100 group-hover:scale-100 origin-center">
                    <circle cx="560" cy="50" r="4" fill="#111"></circle>
                    <text x="560" y="70" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="#111" fontWeight="bold" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      MERGED
                    </text>
                  </g>
                </svg>
              </div>
            </div>
          </div>

          {/* Card 2: Immutable Audits (md:col-span-4) */}
          <div className="md:col-span-4 group relative bg-white border border-[#E5E5E5] rounded-xl overflow-hidden hover:border-[#111111]/30 transition-all duration-500 flex flex-col justify-between">
            <div className="p-10 relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="w-10 h-10 bg-[#FAFAFA] border border-[#E5E5E5] rounded flex items-center justify-center mb-6 text-[#111111] shadow-sm">
                  <History className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold text-[#111111] mb-3">
                  Immutable Audits
                </h3>
                <p className="text-xs text-[#737373] leading-relaxed">
                  Every feature has an immutable audit log mapping original goals to merged code changes. Inspect historical iterations without ambiguity.
                </p>
              </div>

              {/* Stacked cards visual lift effect on hover */}
              <div className="mt-8 relative w-full h-24 flex flex-col justify-end items-center">
                {/* Back card */}
                <div className="absolute w-[80%] h-10 bg-[#E5E5E5]/30 border border-[#E5E5E5] rounded-t-md top-4 scale-90 opacity-0 group-hover:opacity-100 group-hover:top-0 transition-all duration-500 ease-out"></div>
                {/* Middle card */}
                <div className="absolute w-[90%] h-10 bg-[#FAFAFA] border border-[#E5E5E5] rounded-t-md top-8 scale-95 opacity-50 group-hover:opacity-80 group-hover:top-6 transition-all duration-500 ease-out delay-75"></div>

                {/* Front card */}
                <div className="relative w-full h-12 bg-white border border-[#E5E5E5] rounded shadow-sm flex items-center px-3 gap-3 z-10 transition-transform duration-300 group-hover:translate-y-[-5px] group-hover:shadow-md">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0 animate-pulse"></span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold text-[#111111] uppercase tracking-wide">
                        Audit Log
                      </span>
                      <span className="text-[8px] font-mono text-[#737373]">
                        v1.8.0
                      </span>
                    </div>
                    <div className="h-1 w-full bg-[#FAFAFA] rounded overflow-hidden mt-1">
                      <div className="h-full w-4/5 bg-[#111111]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Automated Synthesis (md:col-span-12) */}
          <div className="md:col-span-12 group relative bg-white border border-[#E5E5E5] rounded-xl overflow-hidden hover:border-[#111111]/30 transition-all duration-500">
            <div className="p-10 flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 max-w-lg space-y-4">
                <div className="w-10 h-10 bg-[#FAFAFA] border border-[#E5E5E5] rounded flex items-center justify-center text-[#111111] shadow-sm">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold text-[#111111]">
                  Pull Request Compliance Synthesis
                </h3>
                <p className="text-sm text-[#737373] leading-relaxed">
                  Automatically translate raw diff files and code updates into human-readable QA status updates. Instantly understand which business goals are met, and pinpoint outstanding gaps in plain English.
                </p>
              </div>

              {/* Code visual panel */}
              <div className="flex-1 w-full bg-[#FAF9F7] border border-[#E5E5E5] rounded-xl p-6 font-mono text-[11px] text-[#737373] space-y-3 shadow-inner">
                <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2">
                  <span className="font-bold text-[#111111]">Review Analysis: invite-user.ts</span>
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">PASS</span>
                </div>
                <div className="space-y-1">
                  <div>
                    <span className="text-zinc-400 font-bold">Requirements Checked:</span>
                    <span className="text-[#111111] font-semibold ml-1">AC-03 Invite Permissions Scope</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">Synthesis:</span>
                    <span className="text-zinc-700 ml-1">Verified invite permissions block user roles below admin scope. Integration meets specification requirements.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
