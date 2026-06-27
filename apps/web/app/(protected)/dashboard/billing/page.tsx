import { redirect } from "next/navigation";
import { BillingSettingsContent } from "~/features/settings/components/billing-settings-content";
import { getBillingData } from "~/features/settings/server/subscription";
import { getServerSession } from "~/lib/auth-server";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing Settings | Taarana AI",
  description: "Manage subscription plans, track resource usage, and update billing configurations.",
};

export default async function BillingPage() {
  const session = await getServerSession();

  if (!session || !session.user) {
    redirect("/sign-in?callbackUrl=/dashboard/billing");
  }

  let billingData;
  try {
    billingData = await getBillingData();
  } catch (error) {
    console.error("Failed to load billing settings:", error);
    // If no organization exists, redirect to onboarding
    redirect("/create-workspace");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 animate-fade-in">
      <BillingSettingsContent billingData={billingData} />
    </div>
  );
}
