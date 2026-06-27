"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquare, GitBranch, Terminal, ShieldAlert, CheckCircle2, History } from "lucide-react";

export function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(false);

  const steps = [
    {
      threshold: 0.15,
      num: "01",
      phase: "Discovery",
      title: "Feature Request",
      desc: "Describe what you want to build in plain English.",
      icon: MessageSquare,
      detail: "Add role-based member invitation flows",
    },
    {
      threshold: 0.3,
      num: "02",
      phase: "Planning",
      title: "Core Specifications",
      desc: "AI clarifies requirements and generates a structured PRD.",
      icon: Terminal,
      detail: "Acceptance Criteria: Enforce Admin scope check",
    },
    {
      threshold: 0.45,
      num: "03",
      phase: "Development",
      title: "Code Integrations",
      desc: "Sync your GitHub repository. Developers commit code to PRs.",
      icon: GitBranch,
      detail: "Branch sync: feat/auth-invite active",
    },
    {
      threshold: 0.6,
      num: "04",
      phase: "Review",
      title: "AI QA Verification",
      desc: "AI reviews changes against specification requirements.",
      icon: ShieldAlert,
      detail: "Checking: PRD requirement compliance",
    },
    {
      threshold: 0.75,
      num: "05",
      phase: "Approval",
      title: "Human Approval Gate",
      desc: "Merge with one click after inspecting compliance logs.",
      icon: CheckCircle2,
      detail: "Compliance check status: 100% verified",
    },
    {
      threshold: 0.9,
      num: "06",
      phase: "Audit",
      title: "Immutable Timeline",
      desc: "Every step is logged on an audit timeline for tracking.",
      icon: History,
      detail: "Build timeline: SHA-8f2a...9c1 logged",
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const viewH = window.innerHeight;
      const travelDistance = rect.height - viewH;
      const scrolled = -rect.top;

      let p = scrolled / travelDistance;
      p = Math.max(0, Math.min(1, p));
      setProgress(p);

      if (p > 0.02) {
        setHeaderVisible(true);
      } else {
        setHeaderVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative w-full bg-[#FAFAFA] border-b border-[#E5E5E5]/60"
      style={{ height: "320vh" }}
    >
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(#00000004_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>
        
        <div className="max-w-4xl w-full px-6 md:px-12 relative z-10 flex flex-col items-center h-full pt-28 pb-12 justify-start gap-4">
          
          {/* Header */}
          <div
            className={`text-center shrink-0 transition-opacity duration-700 ${
              headerVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <h2 className="font-sans text-2xl md:text-3xl font-semibold text-[#111111] tracking-tight mb-2">
              Product Delivery Lifecycle
            </h2>
            <p className="text-[#737373] text-sm max-w-md mx-auto">
              From user feature request to verified production release.
            </p>
          </div>

          {/* Timeline Center Box */}
          <div className="relative w-full max-w-2xl flex-1 flex flex-col justify-start mt-6 min-h-[380px]">
            {/* Step list container */}
            <div className="space-y-6 md:space-y-8 relative py-6 w-full">
              {/* Timeline base track */}
              <div className="absolute left-1/2 top-6 bottom-6 w-px bg-[#E5E5E5]/60 -translate-x-1/2"></div>
              
              {/* Animated progress track line */}
              <div
                className="absolute left-1/2 top-6 w-px bg-[#111111] -translate-x-1/2 transition-all duration-75 ease-linear"
                style={{
                  height: `${progress * 100}%`,
                  maxHeight: "calc(100% - 3rem)",
                }}
              ></div>

              {steps.map((step, idx) => {
                const isActive = progress >= step.threshold;
                const isPast = progress > step.threshold + 0.12;
                const Icon = step.icon;

                // Alternate left/right cards layout
                const isLeftCard = idx % 2 === 0;

                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between w-full transition-all duration-500 transform ${
                      isActive ? (isPast ? "opacity-40 scale-100" : "opacity-100 scale-105") : "opacity-20 scale-100"
                    }`}
                  >
                    {/* Left Panel */}
                    <div className="w-[42%] text-right pr-6 md:pr-8">
                      {isLeftCard ? (
                        <div className="bg-white border border-[#E5E5E5] p-3 rounded shadow-sm inline-block text-left max-w-full">
                          <div className="flex items-center gap-2">
                            <Icon className="h-3.5 w-3.5 text-[#737373]" />
                            <span className="text-[10px] font-bold text-[#111111] truncate max-w-[150px]">
                              {step.detail}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="font-mono text-[9px] text-[#737373] uppercase tracking-wider block mb-1">
                            {step.num} {step.phase}
                          </span>
                          <h3 className="font-sans text-xs md:text-sm font-semibold text-[#111111]">
                            {step.title}
                          </h3>
                          <p className="text-[10px] text-[#737373] mt-0.5 hidden md:block">
                            {step.desc}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Node Dot */}
                    <div className="relative shrink-0 z-10">
                      <div
                        className={`w-3 h-3 rounded-full border transition-colors duration-300 ${
                          isActive ? "border-[#111111] bg-[#111111]" : "border-[#E5E5E5] bg-[#FAFAFA]"
                        }`}
                      ></div>
                    </div>

                    {/* Right Panel */}
                    <div className="w-[42%] pl-6 md:pl-8">
                      {!isLeftCard ? (
                        <div className="bg-white border border-[#E5E5E5] p-3 rounded shadow-sm inline-block text-left max-w-full">
                          <div className="flex items-center gap-2">
                            <Icon className="h-3.5 w-3.5 text-[#737373]" />
                            <span className="text-[10px] font-bold text-[#111111] truncate max-w-[150px]">
                              {step.detail}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="font-mono text-[9px] text-[#737373] uppercase tracking-wider block mb-1">
                            {step.num} {step.phase}
                          </span>
                          <h3 className="font-sans text-xs md:text-sm font-semibold text-[#111111]">
                            {step.title}
                          </h3>
                          <p className="text-[10px] text-[#737373] mt-0.5 hidden md:block">
                            {step.desc}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="h-6" /> {/* spacer */}
        </div>
      </div>
    </section>
  );
}
