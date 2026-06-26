import express from "express";
import crypto from "crypto";
import { env } from "../env";
import { savePullRequestAndLinkFeature } from "../lib/save-pull-request";

export const githubWebhookRoute = express.Router();

githubWebhookRoute.post("/", express.text({ type: "application/json" }), async (req, res) => {
  console.log("=== Webhook received ===");
  const WEBHOOK_SECRET = env.GITHUB_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("GITHUB_WEBHOOK_SECRET is not set.");
    return res.status(500).json({ error: "Configuration error" });
  }

  const signature = req.headers["x-hub-signature-256"] as string;
  const event = req.headers["x-github-event"] as string;
  console.log(`Event type: ${event}`);

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
  console.log("Signature verified");

  if (event !== "pull_request") {
    return res.status(200).json({ success: true, message: "Event ignored" });
  }

  try {
    const payload = JSON.parse(textBody);
    console.log("Payload parsed");
    
    const action = payload.action;
    const installationId = payload.installation?.id;
    const repoOwner = payload.repository?.owner?.login;
    const repoName = payload.repository?.name;
    const prNumber = payload.pull_request?.number;

    console.log(`Action: ${action}`);
    console.log(`Repository: ${repoOwner}/${repoName}`);
    console.log(`Installation ID: ${installationId}`);
    console.log(`Pull request number: ${prNumber}`);

    if (["opened", "synchronize", "reopened"].includes(action)) {
      console.log("Entering savePullRequestAndLinkFeature");
      await savePullRequestAndLinkFeature(payload);
      console.log("Finished savePullRequestAndLinkFeature");
    } else {
      console.log(`Ignoring pull_request action: ${action}`);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});
