"use client";

import { Check, ShieldCheck, Sparkles, CreditCard, Calendar, User, Zap } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "~/components/ui/card";
import { UpgradeButton } from "./upgrade-button";

interface BillingPageContentProps {
  organization: {
    id: string;
    name: string;
    plan: "FREE" | "PRO";
    subscriptionId: string | null;
    razorpayCustomerId: string | null;
    subscriptionStatus: string | null;
    subscriptionCurrentPeriodEnd: string | Date | null;
  };
}

export function BillingPageContent({ organization }: BillingPageContentProps) {
  const isPro = organization.plan === "PRO";

  const formatDate = (date: string | Date | null) => {
    if (!date) return "N/A";
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return "N/A";
    return parsedDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const freeFeatures = [
    "Basic Workspace access",
    "Up to 3 active PRD projects",
    "Basic AI assistant suggestions",
    "Standard PR reviews history tracking",
  ];

  const proFeatures = [
    "Unlimited active workspaces",
    "Unlimited PRD projects and drafts",
    "Premium context-aware AI suggestion assistant",
    "Direct GitHub App integration with live webhooks",
    "Automated PR review and analysis pipeline",
    "Priority support SLA and high-priority reviews queue",
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2D2D2D]/60 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#FFFFFF] flex items-center gap-2">
            Billing & Subscriptions
          </h1>
          <p className="text-sm text-[#9B9B9B] mt-1">
            Manage your workspace plan, upgrade to Pro, or review active billing details.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#9B9B9B] font-medium">Active Workspace:</span>
          <Badge className="bg-[#2D2D2D] text-[#E3E3E3] border border-[#3E3E3E] rounded-md px-2.5 py-1 text-xs">
            {organization.name}
          </Badge>
        </div>
      </div>

      {/* Subscription Status Card */}
      {isPro ? (
        <Card className="bg-gradient-to-br from-[#1E1E1E] via-[#202020] to-[#1E1E1E] border border-[#2D2D2D] text-[#E3E3E3] rounded-2xl shadow-xl overflow-hidden relative">
          {/* Subtle design accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-700/5 rounded-full blur-3xl pointer-events-none" />
          
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-[#2D2D2D]/60">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold text-[#FFFFFF] flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                Active Pro Subscription
              </CardTitle>
              <CardDescription className="text-xs text-[#9B9B9B]">
                Your organization is upgraded to Pro. Enjoy unlimited resources and features!
              </CardDescription>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 text-xs rounded-full">
              PRO ACTIVE
            </Badge>
          </CardHeader>
          
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 text-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-zinc-800 flex items-center justify-center border border-[#2D2D2D]">
                  <CreditCard className="h-4.5 w-4.5 text-[#9B9B9B]" />
                </div>
                <div>
                  <div className="text-xs text-[#9B9B9B]">Subscription ID</div>
                  <div className="font-mono text-xs text-[#E3E3E3] mt-0.5 select-all">
                    {organization.subscriptionId || "N/A"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-zinc-800 flex items-center justify-center border border-[#2D2D2D]">
                  <User className="h-4.5 w-4.5 text-[#9B9B9B]" />
                </div>
                <div>
                  <div className="text-xs text-[#9B9B9B]">Razorpay Customer ID</div>
                  <div className="font-mono text-xs text-[#E3E3E3] mt-0.5 select-all">
                    {organization.razorpayCustomerId || "N/A"}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-zinc-800 flex items-center justify-center border border-[#2D2D2D]">
                  <Zap className="h-4.5 w-4.5 text-[#9B9B9B]" />
                </div>
                <div>
                  <div className="text-xs text-[#9B9B9B]">Subscription Status</div>
                  <div className="text-xs font-semibold capitalize text-[#E3E3E3] mt-0.5">
                    {organization.subscriptionStatus || "N/A"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-zinc-800 flex items-center justify-center border border-[#2D2D2D]">
                  <Calendar className="h-4.5 w-4.5 text-[#9B9B9B]" />
                </div>
                <div>
                  <div className="text-xs text-[#9B9B9B]">Renews On</div>
                  <div className="text-xs text-[#E3E3E3] font-medium mt-0.5">
                    {formatDate(organization.subscriptionCurrentPeriodEnd)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-[#1E1E1E] border border-[#2D2D2D] text-[#E3E3E3] rounded-2xl shadow-md p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-[#FFFFFF] flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-amber-400" />
                You are currently on the Free Plan
              </h3>
              <p className="text-sm text-[#9B9B9B]">
                Upgrade to Pro to unlock automated PR code reviews, unlimited documents, and collaborative workspaces.
              </p>
            </div>
            <Badge className="bg-[#2D2D2D] text-[#9B9B9B] border border-[#2D2D2D] rounded-full px-3 py-1 text-xs">
              FREE TIER
            </Badge>
          </div>
        </Card>
      )}

      {/* Pricing Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        {/* Free Card */}
        <Card className="bg-[#1F1F1F] border border-[#2D2D2D] text-[#E3E3E3] rounded-2xl flex flex-col justify-between overflow-hidden shadow-lg transition-transform hover:translate-y-[-2px] duration-300">
          <div>
            <CardHeader className="border-b border-[#2D2D2D]/60 pb-6">
              <CardTitle className="text-xl font-bold text-[#FFFFFF]">Free Plan</CardTitle>
              <CardDescription className="text-xs text-[#9B9B9B]">For developers and hobbyists starting out</CardDescription>
              <div className="mt-4 flex items-baseline text-white">
                <span className="text-4xl font-extrabold tracking-tight">₹0</span>
                <span className="ml-1 text-sm text-[#9B9B9B]">/ month</span>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-4">
                {freeFeatures.map((feat) => (
                  <li key={feat} className="flex items-start gap-3 text-sm text-[#E3E3E3]">
                    <Check className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </div>
          <CardFooter className="pb-6 pt-2 border-t border-[#2D2D2D]/40">
            <Button
              disabled
              variant="outline"
              className="w-full border-[#2D2D2D] text-[#9B9B9B] bg-zinc-800/40 rounded-xl cursor-default py-6"
            >
              Current Plan
            </Button>
          </CardFooter>
        </Card>

        {/* Pro Card */}
        <Card className="bg-[#1F1F1F] border-2 border-zinc-500/30 text-[#E3E3E3] rounded-2xl flex flex-col justify-between overflow-hidden shadow-2xl relative transition-transform hover:translate-y-[-2px] duration-300">
          {/* Pro highlight badge */}
          <div className="absolute top-0 right-6 transform -translate-y-1/2 bg-[#E3E3E3] text-zinc-950 text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full border-2 border-zinc-950 shadow-md">
            RECOMMENDED
          </div>

          <div>
            <CardHeader className="border-b border-[#2D2D2D]/60 pb-6">
              <CardTitle className="text-xl font-bold text-[#FFFFFF] flex items-center gap-2">
                Pro Plan
                <Sparkles className="h-4.5 w-4.5 text-amber-400 animate-pulse" />
              </CardTitle>
              <CardDescription className="text-xs text-[#9B9B9B]">Complete engineering velocity suite</CardDescription>
              <div className="mt-4 flex items-baseline text-white">
                <span className="text-4xl font-extrabold tracking-tight">₹1,999</span>
                <span className="ml-1 text-sm text-[#9B9B9B]">/ month</span>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-4">
                {proFeatures.map((feat) => (
                  <li key={feat} className="flex items-start gap-3 text-sm text-[#E3E3E3]">
                    <Check className="h-4 w-4 text-[#FFFFFF] shrink-0 mt-0.5 bg-zinc-800 rounded p-0.5 border border-[#3E3E3E]" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </div>
          <CardFooter className="pb-6 pt-2 border-t border-[#2D2D2D]/40">
            {isPro ? (
              <Button
                disabled
                className="w-full bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 font-semibold py-6 rounded-xl cursor-default"
              >
                Active Subscription
              </Button>
            ) : (
              <UpgradeButton />
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
