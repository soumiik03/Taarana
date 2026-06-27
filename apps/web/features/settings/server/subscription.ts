"use server";

import { db, eq, and, gte, sql } from "@repo/database";
import { organizationsTable, workspaceMembersTable, featureRequestsTable } from "@repo/database/schema";
import { FREE_FEATURE_REQUEST_LIMIT } from "@repo/trpc/server/utils/limits";
import { getServerSession } from "~/lib/auth-server";
import { getConnectedRepositories } from "~/features/github/server/repos";
import { getRazorpayClient } from "~/features/billing/lib/razorpay";
import { revalidatePath } from "next/cache";

export async function getBillingData() {
  const session = await getServerSession();
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // Get active organization membership
  const membership = await db
    .select({ organizationId: workspaceMembersTable.organizationId })
    .from(workspaceMembersTable)
    .where(eq(workspaceMembersTable.userId, userId))
    .limit(1);

  const organizationId = membership[0]?.organizationId;
  if (!organizationId) {
    throw new Error("No organization found");
  }

  // Fetch full organization details
  const orgResult = await db
    .select()
    .from(organizationsTable)
    .where(eq(organizationsTable.id, organizationId))
    .limit(1);

  const organization = orgResult[0];
  if (!organization) {
    throw new Error("Organization record not found");
  }

  // Count monthly feature requests
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const usageResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(featureRequestsTable)
    .where(
      and(
        eq(featureRequestsTable.organizationId, organizationId),
        gte(featureRequestsTable.createdAt, startOfMonth)
      )
    )
    .limit(1);

  const monthlyUsage = Number(usageResult[0]?.count ?? 0);
  const freeLimit = FREE_FEATURE_REQUEST_LIMIT;
  const remainingFreeUsage = organization.plan === "PRO" ? "Unlimited" : Math.max(0, freeLimit - monthlyUsage);

  // Get connected repository count
  const reposResult = await getConnectedRepositories();
  const connectedRepositoryCount = reposResult?.repos?.length ?? 0;

  return {
    organizationId: organization.id,
    plan: organization.plan,
    subscriptionStatus: organization.subscriptionStatus || "inactive",
    subscriptionId: organization.subscriptionId,
    razorpayCustomerId: organization.razorpayCustomerId,
    subscriptionCurrentPeriodEnd: organization.subscriptionCurrentPeriodEnd,
    monthlyFeatureRequestsUsage: monthlyUsage,
    freeLimit,
    remainingFreeUsage,
    connectedRepositoryCount,
  };
}

export async function cancelSubscriptionAction() {
  const session = await getServerSession();
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // Get active organization membership
  const membership = await db
    .select({ organizationId: workspaceMembersTable.organizationId })
    .from(workspaceMembersTable)
    .where(eq(workspaceMembersTable.userId, userId))
    .limit(1);

  const organizationId = membership[0]?.organizationId;
  if (!organizationId) {
    throw new Error("No organization found");
  }

  // Fetch organization
  const orgResult = await db
    .select()
    .from(organizationsTable)
    .where(eq(organizationsTable.id, organizationId))
    .limit(1);

  const organization = orgResult[0];
  if (!organization || !organization.subscriptionId) {
    throw new Error("No active subscription to cancel");
  }

  const razorpay = getRazorpayClient();

  // Cancel subscription immediately in Razorpay
  const response = (await razorpay.subscriptions.cancel(organization.subscriptionId, false)) as any;

  // Update subscription status in the database
  await db
    .update(organizationsTable)
    .set({
      plan: "FREE",
      subscriptionStatus: response.status || "cancelled",
    })
    .where(eq(organizationsTable.id, organizationId));

  revalidatePath("/dashboard/billing");
  return { success: true, status: response.status || "cancelled" };
}
