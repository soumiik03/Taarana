"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

export function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState("pricing-pro");

  const plans = [
    {
      id: "pricing-hobby",
      name: "Free",
      price: "₹0",
      description: "For individual developers and small teams starting out.",
      features: [
        "1 connected GitHub repository",
        "5 feature requests per month",
        "Conversational spec editor",
        "Basic automated QA review",
      ],
      buttonText: "Start for free",
      href: "/sign-in",
    },
    {
      id: "pricing-pro",
      name: "Pro",
      price: "₹999",
      description: "For scaling engineering teams requiring unlimited capacity.",
      features: [
        "Unlimited connected repositories",
        "Unlimited feature requests",
        "Priority requirements-based code reviews",
        "Custom acceptance criteria validation",
        "Continuous re-review loops",
      ],
      buttonText: "Start trial",
      href: "/sign-in",
    },
  ];

  return (
    <section id="pricing" className="py-20 md:py-32 bg-[#FAFAFA] border-b border-[#E5E5E5]/60">
      <div className="max-w-5xl mx-auto px-6 sm:px-8">

        {/* Header */}
        <div className="max-w-3xl mb-16 md:mb-24 text-center md:text-left">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-2">Pricing</span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#1A1A1A]">
            Transparent pricing. <br />
            <span className="text-zinc-400 font-normal">Scoped for teams of all sizes.</span>
          </h2>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto items-center">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;

            return (
              <div
                key={plan.id}
                id={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedPlan(plan.id);
                  }
                }}
                tabIndex={0}
                className={`pricing-transition cursor-pointer bg-white p-8 rounded-2xl border text-left flex flex-col justify-between h-[450px] relative select-none ${isSelected
                    ? "scale-[1.02] shadow-2xl z-10 border-[#111111] ring-1 ring-[#111111]/5 opacity-100"
                    : "border-[#E5E5E5] opacity-60 scale-[0.98] hover:opacity-90"
                  }`}
              >
                {/* Visual Accent for selected Pro plan */}
                {isSelected && plan.id === "pricing-pro" && (
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#111111] via-[#737373] to-transparent rounded-t-2xl"></div>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-[#111111]">
                      {plan.name}
                    </h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold tracking-tight text-[#111111]">
                        {plan.price}
                      </span>
                      <span className="text-xs font-semibold text-[#737373]">
                        /month
                      </span>
                    </div>
                    <p className="text-xs text-[#737373] mt-2 leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  {/* Feature list */}
                  <ul className="space-y-2.5">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5 text-xs text-[#111111]">
                        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <Link href={plan.href} className="w-full block">
                    <button
                      className={`w-full text-xs font-bold py-3 rounded-lg transition-all ${isSelected
                          ? "bg-[#111111] text-white hover:bg-zinc-800"
                          : "bg-transparent text-[#111111] border border-[#E5E5E5] hover:bg-zinc-50"
                        }`}
                    >
                      {plan.buttonText}
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
