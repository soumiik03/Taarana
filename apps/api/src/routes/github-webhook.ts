import express from "express";
import crypto from "crypto";
import { env } from "../env";
import { savePullRequestAndLinkFeature } from "../lib/save-pull-request";
import { logger } from "@repo/logger";

export const githubWebhookRoute = express.Router();

// GET handler to confirm the endpoint is mounted and reachable.
// Without this, GET requests fall through to the tRPC OpenAPI middleware
// which returns {"message":"Not found","code":"NOT_FOUND"}.
githubWebhookRoute.get("/", (_req, res) => {
  return res.status(200).json({ ok: true, endpoint: "/api/github/webhook", methods: ["POST"] });
});

githubWebhookRoute.post("/", express.text({ type: "application/json" }), async (req, res) => {
  logger.info("=== Webhook received ===");
  const WEBHOOK_SECRET = env.GITHUB_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    logger.error("GITHUB_WEBHOOK_SECRET is not set.");
    return res.status(500).json({ error: "Configuration error" });
  }

  const signature = req.headers["x-hub-signature-256"] as string;
  const event = req.headers["x-github-event"] as string;
  logger.info(`Event type: ${event}`);

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
  logger.info("Signature verified");

  if (event !== "pull_request") {
    return res.status(200).json({ success: true, message: "Event ignored" });
  }

  try {
    const payload = JSON.parse(textBody);
    logger.info("Payload parsed");
    
    const action = payload.action;
    const installationId = payload.installation?.id;
    const repoOwner = payload.repository?.owner?.login;
    const repoName = payload.repository?.name;
    const prNumber = payload.pull_request?.number;

    logger.info(`Action: ${action}`);
    logger.info(`Repository: ${repoOwner}/${repoName}`);
    logger.info(`Installation ID: ${installationId}`);
    logger.info(`Pull request number: ${prNumber}`);

    if (["opened", "synchronize", "reopened"].includes(action)) {
      logger.info("Entering savePullRequestAndLinkFeature");
      await savePullRequestAndLinkFeature(payload);
      logger.info("Finished savePullRequestAndLinkFeature");
    } else {
      logger.info(`Ignoring pull_request action: ${action}`);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    logger.error(error);
    if (error instanceof Error) {
      logger.error(error.stack);
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});
