"use client";

import { useState, useTransition } from "react";
import { Check, ShieldCheck, Sparkles, CreditCard, Calendar, User, Zap, AlertTriangle, Layers, GitBranch, Copy } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "~/components/ui/card";
import { UpgradeButton } from "~/features/billing/components/upgrade-button";
import { cancelSubscriptionAction } from "../server/subscription";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface BillingSettingsContentProps {
  billingData: {
    organizationId: string;
    plan: "FREE" | "PRO";
    subscriptionStatus: string;
    subscriptionId: string | null;
    razorpayCustomerId: string | null;
    subscriptionCurrentPeriodEnd: string | Date | null;
    monthlyFeatureRequestsUsage: number;
    freeLimit: number;
    remainingFreeUsage: number | string;
    connectedRepositoryCount: number;
  };
}

export function BillingSettingsContent({ billingData }: BillingSettingsContentProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isCopiedId, setIsCopiedId] = useState<string | null>(null);

  const isPro = billingData.plan === "PRO";

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

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopiedId(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setIsCopiedId(null), 2000);
  };

  const handleCancel = () => {
    if (!confirm("Are you absolutely sure you want to cancel your Pro subscription? Your plan will return to the Free Tier immediately.")) {
      return;
    }

    startTransition(async () => {
      try {
        const res = await cancelSubscriptionAction();
        if (res.success) {
          toast.success("Your subscription has been successfully cancelled.");
          router.refresh();
        } else {
          toast.error("Failed to cancel subscription. Please try again.");
        }
      } catch (error: any) {
        console.error("Cancel subscription error:", error);
        toast.error(error.message || "An error occurred while cancelling your subscription.");
      }
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2D2D2D]/60 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#FFFFFF] flex items-center gap-2">
            Billing Settings
          </h1>
          <p className="text-sm text-[#9B9B9B] mt-1">
            Review your resource usage, active plan metrics, and subscription credentials.
          </p>
        </div>
      </div>

      {/* Usage Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1: Monthly Usage */}
        <Card className="bg-[#1E1E1E] border border-[#2D2D2D] text-[#E3E3E3] rounded-2xl p-6 relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-800/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#9B9B9B] uppercase tracking-wider">Monthly Feature Requests</span>
            <Layers className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{billingData.monthlyFeatureRequestsUsage}</span>
            <span className="text-sm text-[#9B9B9B]">/ {isPro ? "∞" : billingData.freeLimit} requests</span>
          </div>
          <p className="text-xs text-[#9B9B9B] mt-2">
            Usage resets at the beginning of each calendar month.
          </p>
        </Card>

        {/* Metric 2: Remaining Free Usage */}
        <Card className="bg-[#1E1E1E] border border-[#2D2D2D] text-[#E3E3E3] rounded-2xl p-6 relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-800/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#9B9B9B] uppercase tracking-wider">Remaining Free Usage</span>
            <Sparkles className="h-5 w-5 text-amber-400" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white">
              {billingData.remainingFreeUsage}
            </span>
          </div>
          <p className="text-xs text-[#9B9B9B] mt-2">
            {isPro ? "Unlimited requests unlocked with Pro Plan" : "Upgrade to Pro to unlock unlimited usage."}
          </p>
        </Card>

        {/* Metric 3: Connected Repositories */}
        <Card className="bg-[#1E1E1E] border border-[#2D2D2D] text-[#E3E3E3] rounded-2xl p-6 relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-800/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#9B9B9B] uppercase tracking-wider">Connected Repositories</span>
            <GitBranch className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white">{billingData.connectedRepositoryCount}</span>
          </div>
          <p className="text-xs text-[#9B9B9B] mt-2">
            Synced active repositories via GitHub App integration.
          </p>
        </Card>
      </div>

      {/* Primary Plan Details Card */}
      <Card className="bg-gradient-to-br from-[#1E1E1E] via-[#202020] to-[#1E1E1E] border border-[#2D2D2D] text-[#E3E3E3] rounded-2xl shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-700/5 rounded-full blur-3xl pointer-events-none" />
        
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-[#2D2D2D]/60">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-[#FFFFFF] flex items-center gap-2">
              {isPro ? (
                <>
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  Active Pro Subscription
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-zinc-400" />
                  Free Tier Workspace
                </>
              )}
            </CardTitle>
            <CardDescription className="text-xs text-[#9B9B9B]">
              {isPro 
                ? "Your organization is currently on the Pro Plan. Enjoy priority support and unlimited code analysis."
                : "You are currently utilizing Free Plan features. Upgrade to unlock automated PR reviews."}
            </CardDescription>
          </div>
          <Badge className={`${
            isPro 
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
              : "bg-[#2D2D2D] text-[#9B9B9B] border-[#2D2D2D]"
          } border px-3 py-1 text-xs rounded-full uppercase tracking-wider`}>
            {billingData.plan} ACTIVE
          </Badge>
        </CardHeader>
        
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 text-sm">
          <div className="space-y-4">
            {/* Subscription ID */}
            <div className="flex items-start justify-between p-3 rounded-xl bg-zinc-950/40 border border-[#2D2D2D]/40">
              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-[#9B9B9B]" />
                <div>
                  <div className="text-[10px] text-[#9B9B9B] uppercase font-semibold">Subscription ID</div>
                  <div className="font-mono text-xs text-[#E3E3E3] mt-0.5">
                    {billingData.subscriptionId || "N/A"}
                  </div>
                </div>
              </div>
              {billingData.subscriptionId && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-zinc-400 hover:text-white"
                  onClick={() => handleCopy(billingData.subscriptionId!, "Subscription ID")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Customer ID */}
            <div className="flex items-start justify-between p-3 rounded-xl bg-zinc-950/40 border border-[#2D2D2D]/40">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-[#9B9B9B]" />
                <div>
                  <div className="text-[10px] text-[#9B9B9B] uppercase font-semibold">Razorpay Customer ID</div>
                  <div className="font-mono text-xs text-[#E3E3E3] mt-0.5">
                    {billingData.razorpayCustomerId || "N/A"}
                  </div>
                </div>
              </div>
              {billingData.razorpayCustomerId && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-zinc-400 hover:text-white"
                  onClick={() => handleCopy(billingData.razorpayCustomerId!, "Customer ID")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-start p-3 rounded-xl bg-zinc-950/40 border border-[#2D2D2D]/40">
              <div className="flex items-center gap-3">
                <Zap className="h-4 w-4 text-[#9B9B9B]" />
                <div>
                  <div className="text-[10px] text-[#9B9B9B] uppercase font-semibold">Subscription Status</div>
                  <div className="text-xs font-semibold capitalize text-[#E3E3E3] mt-0.5">
                    {billingData.subscriptionStatus}
                  </div>
                </div>
              </div>
            </div>

            {/* Renewal Date */}
            <div className="flex items-start p-3 rounded-xl bg-zinc-950/40 border border-[#2D2D2D]/40">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-[#9B9B9B]" />
                <div>
                  <div className="text-[10px] text-[#9B9B9B] uppercase font-semibold">
                    {isPro ? "Renews On" : "Billing Cycle Renewal"}
                  </div>
                  <div className="text-xs text-[#E3E3E3] font-medium mt-0.5">
                    {formatDate(billingData.subscriptionCurrentPeriodEnd)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pb-6 pt-2 border-t border-[#2D2D2D]/40 flex justify-end gap-3">
          {!isPro ? (
            <div className="w-full md:w-64 mt-4">
              <UpgradeButton />
            </div>
          ) : (
            <Button
              onClick={handleCancel}
              disabled={isPending}
              variant="destructive"
              className="w-full md:w-auto bg-rose-600 hover:bg-rose-500 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 shadow-lg"
            >
              {isPending ? "Cancelling Subscription..." : "Cancel Subscription"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
