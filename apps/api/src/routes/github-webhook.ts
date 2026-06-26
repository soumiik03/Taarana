import express from "express";
import crypto from "crypto";
import { env } from "../env";
import { savePullRequestAndLinkFeature } from "../lib/save-pull-request";

export const githubWebhookRoute = express.Router();

githubWebhookRoute.post("/", express.text({ type: "application/json" }), async (req, res) => {
  const WEBHOOK_SECRET = env.GITHUB_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("GITHUB_WEBHOOK_SECRET is not set.");
    return res.status(500).json({ error: "Configuration error" });
  }

  const signature = req.headers["x-hub-signature-256"] as string;
  const event = req.headers["x-github-event"] as string;

  if (!signature) {
    return res.status(401).json({ error: "Missing signature" });
  }

  const textBody = req.body as string;

  // Verify signature
  const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
  const digest = "sha256=" + hmac.update(textBody).digest("hex");

  if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest)) === false) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  if (event !== "pull_request") {
    // We only care about pull_request events, but return 200 so GitHub knows we received it
    return res.status(200).json({ success: true, message: "Event ignored" });
  }

  try {
    const payload = JSON.parse(textBody);
    const action = payload.action;

    if (["opened", "synchronize", "reopened"].includes(action)) {
      await savePullRequestAndLinkFeature(payload);
    } else {
      console.log(`[GitHub Webhook] Ignoring pull_request action: ${action}`);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("[GitHub Webhook] Error processing payload:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
