"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleScrollToHowItWorks = () => {
    const element = document.getElementById("features");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-[90vh] flex flex-col lg:flex-row items-center justify-between px-6 md:px-12 lg:px-20 pt-32 pb-20 gap-16 bg-transparent">
      {/* Background glow specific to hero */}
      <div className="absolute inset-0 bg-[radial-gradient(#00000004_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

      <div className="max-w-2xl space-y-10 relative z-10">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-white border border-[#E5E5E5]/60 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="font-sans text-[11px] font-medium text-[#737373] tracking-tight">
              Taarana Engine v1.8 Active
            </span>
          </div>
          <h1
            className={`font-sans text-5xl sm:text-6xl md:text-7xl lg:text-[76px] font-semibold tracking-tighter text-[#111111] leading-[0.95] transition-all duration-1000 transform ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
          >
            Autonomous
            <br />
            <span className="text-[#737373]">Product Delivery.</span>
          </h1>
          <p className="max-w-lg font-sans text-base text-[#737373] leading-relaxed">
            The autonomous layer for product execution. Submit plain English requests, draft complete specifications, build Kanban task lists, and perform requirements-based code reviews on every push.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link href="/sign-in" className="w-full sm:w-auto">
            <button className="group relative isolate overflow-hidden bg-[#111111] text-white text-sm font-semibold px-8 py-3.5 rounded shadow-[0_1px_2px_rgba(0,0,0,0.08)] ring-1 ring-white/10 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:scale-[1.03] hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.3)] hover:ring-white/20 active:scale-[0.98] flex items-center justify-center gap-2">
              <div className="shimmer-layer absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent z-0 pointer-events-none"></div>
              <span className="relative z-10">Get started free</span>
              <ArrowRight className="h-4 w-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </Link>
          <button
            onClick={handleScrollToHowItWorks}
            className="w-full sm:w-auto px-8 py-3.5 bg-white text-[#111111] border border-[#E5E5E5] text-sm font-medium rounded shadow-sm transition-all duration-300 ease-out hover:bg-gray-50 hover:border-[#111111]/40 hover:text-black hover:shadow-md active:scale-[0.97]"
          >
            See how it works
          </button>
        </div>
      </div>

      {/* Visual Workflow Graph */}
      <div className="relative w-full max-w-lg aspect-square lg:aspect-[4/3] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#FAFAFA] via-white to-[#FAFAFA] opacity-50 blur-3xl"></div>
        <div className="premium-card w-full h-full p-6 relative overflow-hidden rounded-xl border border-[#EAEAEC] bg-white shadow-md">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#111111] to-transparent"></div>

          <div className="h-full w-full flex flex-col">
            <div className="flex justify-between items-center mb-8 border-b border-[#E5E5E5]/50 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#E5E5E5]"></div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#737373]">
                  Product Delivery Trace
                </span>
              </div>
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="w-12 h-1.5 rounded-full bg-[#E5E5E5]/50"></span>
              </div>
            </div>

            <div className="flex-1 relative">
              {/* SVG Graph specific to Taarana */}
              <svg className="w-full h-full" viewBox="0 0 400 300">
                <style>{`
                  .signal-path {
                    stroke-dasharray: 60 400;
                    stroke-dashoffset: 60;
                    animation: signal-flow-trace 6s linear infinite;
                  }
                  @keyframes signal-flow-trace {
                    0% { stroke-dashoffset: 60; opacity: 0; }
                    5% { opacity: 1; }
                    90% { stroke-dashoffset: -360; opacity: 1; }
                    95% { opacity: 0; }
                    100% { stroke-dashoffset: -360; opacity: 0; }
                  }

                  .node-req { animation: pulse-req 6s infinite ease-out; transform-origin: 50px 150px; }
                  @keyframes pulse-req {
                    0% { transform: scale(1); fill: #111; }
                    5% { transform: scale(1.3); fill: #000; }
                    15% { transform: scale(1); fill: #111; }
                  }

                  .node-prd { animation: pulse-prd 6s infinite ease-out; transform-origin: 170px 80px; }
                  @keyframes pulse-prd {
                    25% { stroke-width: 1.5; transform: scale(1); }
                    30% { stroke-width: 2.5; transform: scale(1.05); stroke: #000; }
                    40% { stroke-width: 1.5; transform: scale(1); stroke: #111; }
                  }

                  .node-qa { animation: pulse-qa 6s infinite ease-out; transform-origin: 270px 120px; }
                  @keyframes pulse-qa {
                    55% { stroke-width: 1.5; transform: scale(1); }
                    60% { stroke-width: 2.5; transform: scale(1.05); stroke: #000; }
                    70% { stroke-width: 1.5; transform: scale(1); stroke: #111; }
                  }

                  .node-ship { animation: pulse-ship 6s infinite ease-out; transform-origin: 340px 150px; }
                  @keyframes pulse-ship {
                    85% { transform: scale(1); fill: #111; }
                    90% { transform: scale(1.25); fill: #000; }
                    100% { transform: scale(1); fill: #111; }
                  }

                  .check-draw {
                    stroke-dasharray: 12;
                    stroke-dashoffset: 12;
                    animation: check-draw-anim 6s linear infinite;
                  }
                  @keyframes check-draw-anim {
                    0%, 88% { stroke-dashoffset: 12; opacity: 0; }
                    92% { stroke-dashoffset: 0; opacity: 1; }
                    100% { stroke-dashoffset: 0; opacity: 0; }
                  }
                `}</style>

                {/* Static Background Connections */}
                <path d="M50,150 C100,150 100,80 170,80" fill="none" stroke="#E5E5E5" strokeWidth="2"></path>
                <path d="M50,150 C100,150 100,220 170,220" fill="none" stroke="#E5E5E5" strokeWidth="2"></path>
                <path d="M170,80 C220,80 220,120 270,120" fill="none" stroke="#E5E5E5" strokeWidth="2"></path>
                <path d="M170,220 C220,220 220,180 270,180" fill="none" stroke="#E5E5E5" strokeWidth="2"></path>
                <path d="M270,120 L340,150" fill="none" stroke="#E5E5E5" strokeWidth="2"></path>
                <path d="M270,180 L340,150" fill="none" stroke="#E5E5E5" strokeWidth="2"></path>

                {/* Animated active flow path */}
                <path d="M50,150 C100,150 100,80 170,80 C220,80 220,120 270,120 L340,150" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" className="signal-path"></path>

                {/* Request Node */}
                <circle cx="50" cy="150" r="6" fill="#111" className="node-req"></circle>
                <text x="50" y="175" textAnchor="middle" fontFamily="sans-serif" fontSize="10" fontWeight="600" fill="#111">
                  1. Request
                </text>

                {/* PRD Spec Node */}
                <rect x="130" y="70" width="80" height="20" rx="4" fill="white" stroke="#111" strokeWidth="1.5" className="node-prd"></rect>
                <text x="170" y="83" textAnchor="middle" fontFamily="sans-serif" fontSize="9" fontWeight="600" fill="#111" dy="1">
                  PRD Spec
                </text>

                {/* Kanban Tasks Node (inactive background) */}
                <rect x="130" y="210" width="80" height="20" rx="4" fill="white" stroke="#E5E5E5"></rect>
                <text x="170" y="223" textAnchor="middle" fontFamily="sans-serif" fontSize="9" fontWeight="500" fill="#737373" dy="1">
                  Kanban Tasks
                </text>

                {/* Code Diff Node (inactive background) */}
                <rect x="240" y="170" width="60" height="20" rx="4" fill="#F5F5F7" stroke="#E5E5E5"></rect>
                <text x="270" y="183" textAnchor="middle" fontFamily="sans-serif" fontSize="9" fontWeight="500" fill="#737373" dy="1">
                  Code Diff
                </text>

                {/* QA Review Node */}
                <rect x="240" y="110" width="60" height="20" rx="4" fill="white" stroke="#111" strokeWidth="1.5" className="node-qa"></rect>
                <text x="270" y="123" textAnchor="middle" fontFamily="sans-serif" fontSize="9" fontWeight="600" fill="#111" dy="1">
                  QA Review
                </text>

                {/* Shipped Node */}
                <circle cx="340" cy="150" r="12" fill="#111" className="node-ship"></circle>
                <path d="M336 150l3 3 5-5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="check-draw"></path>
                <text x="340" y="178" textAnchor="middle" fontFamily="sans-serif" fontSize="10" fontWeight="600" fill="#111">
                  Shipped
                </text>
              </svg>

              {/* Floating Status Label */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#111111] text-white text-[10px] font-mono px-3 py-1.5 rounded shadow-xl tracking-tight select-none">
                Compliance: 100% Verified
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
