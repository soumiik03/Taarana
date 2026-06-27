"use server";

import { cookies } from "next/headers";
import { db, eq, and } from "@repo/database";
import { organizationsTable, workspaceMembersTable, usersTable } from "@repo/database/schema";
import { getServerSession } from "~/lib/auth-server";
import { getRazorpayClient } from "../lib/razorpay";

export async function createCheckoutSession() {
  const session = await getServerSession();
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // Resolve the active organization from cookies or fallback to membership
  const cookieStore = await cookies();
  const activeOrgId = cookieStore.get("active_org_id")?.value;

  let organizationId: string;
  if (activeOrgId) {
    // Verify membership of the active organization
    const membership = await db
      .select()
      .from(workspaceMembersTable)
      .where(
        and(
          eq(workspaceMembersTable.userId, userId),
          eq(workspaceMembersTable.organizationId, activeOrgId)
        )
      )
      .limit(1);

    if (membership.length > 0) {
      organizationId = activeOrgId;
    } else {
      // Fallback to the first workspace membership
      const fallbackMembership = await db
        .select({ organizationId: workspaceMembersTable.organizationId })
        .from(workspaceMembersTable)
        .where(eq(workspaceMembersTable.userId, userId))
        .limit(1);

      if (!fallbackMembership.length || !fallbackMembership[0]) {
        throw new Error("No organization membership found.");
      }
      organizationId = fallbackMembership[0].organizationId;
    }
  } else {
    // Fallback to the first workspace membership
    const fallbackMembership = await db
      .select({ organizationId: workspaceMembersTable.organizationId })
      .from(workspaceMembersTable)
      .where(eq(workspaceMembersTable.userId, userId))
      .limit(1);

    if (!fallbackMembership.length || !fallbackMembership[0]) {
      throw new Error("No organization membership found.");
    }
    organizationId = fallbackMembership[0].organizationId;
  }

  // Fetch the organization and user details
  const [userRecord, orgRecord] = await Promise.all([
    db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1).then((res) => res[0]),
    db.select().from(organizationsTable).where(eq(organizationsTable.id, organizationId)).limit(1).then((res) => res[0]),
  ]);

  if (!userRecord) {
    throw new Error("User record not found.");
  }
  if (!orgRecord) {
    throw new Error("Organization record not found.");
  }

  const razorpay = getRazorpayClient();
  let razorpayCustomerId = orgRecord.razorpayCustomerId;

  // Create Razorpay Customer if one doesn't exist yet
  if (!razorpayCustomerId) {
    const customer = await razorpay.customers.create({
      name: userRecord.fullName || userRecord.email || "Customer",
      email: userRecord.email,
    });
    razorpayCustomerId = customer.id;

    // Save the customer ID to the organization
    await db
      .update(organizationsTable)
      .set({ razorpayCustomerId })
      .where(eq(organizationsTable.id, organizationId));
  }

  const planId = process.env.RAZORPAY_PLAN_ID;
  if (!planId) {
    throw new Error("RAZORPAY_PLAN_ID is not configured in the environment variables.");
  }

  // Retrieve total_count from env or default to 12. Not hardcoded as 120.
  const totalCount = process.env.RAZORPAY_TOTAL_COUNT
    ? parseInt(process.env.RAZORPAY_TOTAL_COUNT, 10)
    : 12;

  // Create Subscription in Razorpay
  const subscription = (await razorpay.subscriptions.create({
    plan_id: planId,
    customer_id: razorpayCustomerId,
    total_count: totalCount,
    customer_notify: true,
  } as any)) as any;

  // Store the subscription info on the organization.
  // Note: We do NOT set plan to "PRO" yet; that will be handled by the webhook.
  await db
    .update(organizationsTable)
    .set({
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
    })
    .where(eq(organizationsTable.id, organizationId));

  return {
    subscriptionId: subscription.id,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
  };
}
