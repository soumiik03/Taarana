import { db, eq } from "@repo/database";
import { organizationsTable } from "@repo/database/schema";
import { logger } from "@repo/logger";

export async function handleRazorpayWebhook(eventPayload: {
  event: string;
  payload: {
    subscription?: {
      entity: {
        id: string;
        status: string;
        current_end?: number;
      };
    };
  };
}) {
  const eventType = eventPayload.event;
  const subscriptionEntity = eventPayload.payload.subscription?.entity;

  if (!subscriptionEntity) {
    logger.warn(`Razorpay Webhook: No subscription entity found in payload for event ${eventType}`);
    return { success: false, message: "No subscription entity in payload" };
  }

  const subscriptionId = subscriptionEntity.id;
  const status = subscriptionEntity.status;
  const currentEndSec = subscriptionEntity.current_end;

  logger.info(`Processing Razorpay Webhook Event: ${eventType} for subscription: ${subscriptionId} (status: ${status})`);

  // Verify that the event is one of the requested events
  const allowedEvents = [
    "subscription.activated",
    "subscription.charged",
    "subscription.cancelled",
    "subscription.halted",
    "subscription.completed",
  ];

  if (!allowedEvents.includes(eventType)) {
    logger.info(`Razorpay Webhook: Event ${eventType} ignored`);
    return { success: true, message: `Event ${eventType} ignored` };
  }

  // Find organization by subscriptionId
  const organization = await db
    .select()
    .from(organizationsTable)
    .where(eq(organizationsTable.subscriptionId, subscriptionId))
    .limit(1)
    .then((res) => res[0]);

  if (!organization) {
    logger.warn(`Razorpay Webhook: Organization not found for subscription ID: ${subscriptionId}`);
    return { success: false, message: "Organization not found" };
  }

  const newPeriodEnd = currentEndSec ? new Date(currentEndSec * 1000) : null;

  // Determine target plan:
  // - active / authenticated -> PRO
  // - cancelled / halted / completed / expired -> FREE
  let targetPlan: "FREE" | "PRO" = "FREE";
  if (["active", "authenticated"].includes(status)) {
    targetPlan = "PRO";
  }

  // Check if we should update or ignore as duplicate/redundant
  const isStatusSame = organization.subscriptionStatus === status;
  const isPeriodEndSame =
    (!organization.subscriptionCurrentPeriodEnd && !newPeriodEnd) ||
    (organization.subscriptionCurrentPeriodEnd &&
      newPeriodEnd &&
      organization.subscriptionCurrentPeriodEnd.getTime() === newPeriodEnd.getTime());
  const isPlanSame = organization.plan === targetPlan;

  if (isStatusSame && isPeriodEndSame && isPlanSame) {
    logger.info(`Razorpay Webhook: Duplicate event ignored for subscription: ${subscriptionId}`);
    return { success: true, message: "Duplicate event ignored" };
  }

  // Perform update
  await db
    .update(organizationsTable)
    .set({
      plan: targetPlan,
      subscriptionStatus: status,
      subscriptionCurrentPeriodEnd: newPeriodEnd,
    })
    .where(eq(organizationsTable.id, organization.id));

  logger.info(
    `Razorpay Webhook: Updated organization ${organization.id} -> Plan: ${targetPlan}, Status: ${status}, PeriodEnd: ${newPeriodEnd}`
  );

  return { success: true };
}
