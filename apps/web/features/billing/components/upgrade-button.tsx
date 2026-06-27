"use client";

import { useState } from "react";
import { useSession } from "~/lib/auth-client";
import { Button } from "~/components/ui/button";
import { createCheckoutSession } from "../server/actions";
import { toast } from "sonner";
import { Loader2, ArrowRight } from "lucide-react";

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function UpgradeButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      // 1. Dynamically load the Razorpay checkout script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load Razorpay SDK. Please check your internet connection.");
        setIsLoading(false);
        return;
      }

      // 2. Call backend Server Action to generate subscription
      const result = await createCheckoutSession();
      if (!result || !result.subscriptionId) {
        toast.error("Failed to initiate subscription. Please try again.");
        setIsLoading(false);
        return;
      }

      const { subscriptionId, razorpayKeyId } = result;

      // 3. Configure and open Razorpay checkout
      const options = {
        key: razorpayKeyId,
        subscription_id: subscriptionId,
        name: "Taarana AI",
        description: "Upgrade Workspace to Pro Plan",
        prefill: {
          name: session?.user?.name || "",
          email: session?.user?.email || "",
        },
        handler: function (response: any) {
          toast.success("Payment successful. Activating your subscription...");
        },
        modal: {
          ondismiss: function () {
            toast.error("Checkout was cancelled.");
          },
        },
        theme: {
          color: "#09090b", // Sleek dark zinc/black theme color
        },
      };

      console.log("Passing subscription_id to Razorpay Checkout:", subscriptionId);

      const rzp = new (window as any).Razorpay(options);

      rzp.on("payment.failed", function (response: any) {
        const err = response.error || {};
        console.error("=== Razorpay Payment Failed ===");
        console.error("Subscription ID:", subscriptionId);
        console.error("Error Code:", err.code);
        console.error("Error Description:", err.description);
        console.error("Error Source:", err.source);
        console.error("Error Step:", err.step);
        console.error("Error Reason:", err.reason);
        console.error("Error Metadata:", err.metadata);
        console.error("Full Error Object JSON:", JSON.stringify(err, null, 2));

        toast.error(
          `Payment Failed: ${err.description || "Subscription payment failed."} (Reason: ${err.reason || "unknown"}, Step: ${err.step || "unknown"})`
        );
      });

      rzp.open();
    } catch (error: any) {
      console.error("Subscription Checkout error:", error);
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleUpgrade}
      disabled={isLoading}
      className="w-full bg-[#E3E3E3] hover:bg-[#FFFFFF] text-zinc-950 font-semibold py-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-zinc-700/20 flex items-center justify-center gap-2 text-sm"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
          Processing Upgrade...
        </>
      ) : (
        <>
          Upgrade to Pro
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </>
      )}
    </Button>
  );
}
