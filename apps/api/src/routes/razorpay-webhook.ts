import express from "express";
import crypto from "crypto";
import { env } from "../env";
import { logger } from "@repo/logger";
import { handleRazorpayWebhook } from "../features/billing/server/webhook-handler";

export const razorpayWebhookRoute = express.Router();

// Use express.text to get the raw body string required for signature verification
razorpayWebhookRoute.post(
  "/",
  express.text({ type: "application/json" }),
  async (req, res) => {
    logger.info("=== Razorpay Webhook Received ===");

    const expectedSignature = req.headers["x-razorpay-signature"] as string;
    const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      logger.error("RAZORPAY_WEBHOOK_SECRET is not configured.");
      return res.status(500).json({ error: "Configuration error" });
    }

    if (!expectedSignature) {
      logger.warn("Razorpay Webhook: Missing signature header");
      return res.status(401).json({ error: "Missing signature" });
    }

    const rawBody = req.body as string;

    // Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    let isSignatureValid = false;
    try {
      isSignatureValid = crypto.timingSafeEqual(
        Buffer.from(generatedSignature, "utf-8"),
        Buffer.from(expectedSignature, "utf-8")
      );
    } catch (e) {
      isSignatureValid = false;
    }

    if (!isSignatureValid) {
      logger.warn("Razorpay Webhook: Signature verification failed");
      return res.status(401).json({ error: "Invalid signature" });
    }

    logger.info("Razorpay Webhook: Signature verified successfully");

    try {
      const payload = JSON.parse(rawBody);
      const result = await handleRazorpayWebhook(payload);
      return res.status(200).json(result);
    } catch (error) {
      logger.error("Error processing Razorpay Webhook:", error);
      if (error instanceof Error) {
        logger.error(error.stack);
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);
