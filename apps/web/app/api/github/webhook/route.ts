import { NextResponse } from "next/server";
import crypto from "crypto";
import { webhookHandler } from "../../../../features/github/server/webhook-handler";

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

export async function POST(req: Request) {
  if (!WEBHOOK_SECRET) {
    console.error("GITHUB_WEBHOOK_SECRET is not set.");
    return NextResponse.json({ error: "Configuration error" }, { status: 500 });
  }

  const signature = req.headers.get("x-hub-signature-256");
  const event = req.headers.get("x-github-event");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  const textBody = await req.text();

  // Verify signature
  const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
  const digest = "sha256=" + hmac.update(textBody).digest("hex");

  if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest)) === false) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (event !== "pull_request") {
    // We only care about pull_request events, but return 200 so GitHub knows we received it
    return NextResponse.json({ success: true, message: "Event ignored" });
  }

  try {
    const payload = JSON.parse(textBody);
    await webhookHandler(payload);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[GitHub Webhook] Error processing payload:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
