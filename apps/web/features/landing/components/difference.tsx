"use client";

import { Check, Minus } from "lucide-react";

export function Difference() {
  const comparisonItems = [
    {
      label: "Code syntax & formatting analysis",
      other: true,
      taarana: true,
    },
    {
      label: "Common bugs & security vulnerabilities",
      other: true,
      taarana: true,
    },
    {
      label: "Integrates with PRD specification context",
      other: false,
      taarana: true,
    },
    {
      label: "Validates functional acceptance criteria",
      other: false,
      taarana: true,
    },
    {
      label: "Flags missing feature implementations",
      other: false,
      taarana: true,
    },
    {
      label: "Continuous validation on code updates",
      other: false,
      taarana: true,
    },
  ];

  return (
    <section id="difference" className="py-20 md:py-32 border-t border-[#E5E4E0]/60 bg-[#F7F6F3]">
      <div className="max-w-5xl mx-auto px-6 sm:px-8">

        {/* Header */}
        <div className="max-w-3xl mb-16 md:mb-24">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-2">Capability Mapping</span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#1A1A1A]">
            We check if code does <br />
            <span className="text-zinc-400 font-normal">what you said it would.</span>
          </h2>
          <p className="mt-4 text-sm md:text-base text-zinc-500 leading-relaxed max-w-xl">
            There is a difference between syntactically correct code and code that actually fulfills the requirements. Taarana validates the logic.
          </p>
        </div>

        {/* Side-by-Side Table Comparison */}
        <div className="border border-[#E5E4E0] rounded-2xl bg-white shadow-sm overflow-hidden">
          {/* Header Row */}
          <div className="grid grid-cols-3 bg-[#FAF9F7] border-b border-[#E5E4E0] p-4 md:p-6 text-xs md:text-sm font-bold text-[#1A1A1A]">
            <div className="col-span-1">Features</div>
            <div className="text-center text-zinc-400">Traditional Linters</div>
            <div className="text-center text-zinc-800">Taarana Engine</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-[#E5E4E0]/60">
            {comparisonItems.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-3 p-4 md:p-6 text-xs md:text-sm items-center hover:bg-[#FAF9F7]/45 transition-colors"
              >
                <div className="col-span-1 font-semibold text-[#1A1A1A]">{item.label}</div>

                {/* Other Tools Column */}
                <div className="flex justify-center">
                  {item.other ? (
                    <Check className="h-4.5 w-4.5 text-zinc-400" />
                  ) : (
                    <Minus className="h-4.5 w-4.5 text-zinc-200" />
                  )}
                </div>

                {/* Taarana Column */}
                <div className="flex justify-center">
                  {item.taarana ? (
                    <Check className="h-5 w-5 text-emerald-600 font-extrabold" />
                  ) : (
                    <Minus className="h-4.5 w-4.5 text-zinc-200" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
