console.log("[Startup] [server.ts] 1: Starting server.ts file");
import express from "express";
import { logger } from "@repo/logger";
import cors from "cors";
console.log("[Startup] [server.ts] 2: Importing better-auth Node handler and auth");
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
console.log("[Startup] [server.ts] 3: Imported auth");






import * as trpcExpress from "@trpc/server/adapters/express";
import { generateOpenApiDocument, createOpenApiExpressMiddleware } from "trpc-to-openapi";
import { apiReference } from "@scalar/express-api-reference";

console.log("[Startup] [server.ts] 4: Importing serverRouter");
import { serverRouter, createContext } from "@repo/trpc/server";
console.log("[Startup] [server.ts] 5: Imported serverRouter");

import { env } from "./env";

export const app = express();
app.set("trust proxy", 1);
const openApiDocument = generateOpenApiDocument(serverRouter, {
  title: "Streamyst OpenAPI",
  version: "1.0.0",
  baseUrl: env.BASE_URL.concat("/api"),
});

const allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];
if (process.env.BETTER_AUTH_URL) {
  allowedOrigins.push(process.env.BETTER_AUTH_URL.replace(/\/$/, ""));
}
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ""));
}

// CORS must run in ALL environments (including production) so the browser
// frontend on a different origin can reach the API.
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, curl, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Allow any vercel.app subdomain for preview deployments
      if (origin.endsWith(".vercel.app")) return callback(null, true);
      return callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
  }),
);

import { inngestRoute } from "./routes/inngest";
import { githubWebhookRoute } from "./routes/github-webhook";
import { razorpayWebhookRoute } from "./routes/razorpay-webhook";

// Mount Better Auth handler BEFORE body-parsing middleware
app.all("/api/auth/{*path}", toNodeHandler(auth));

// Mount Webhook handler BEFORE body-parsing middleware so it can read raw text body
app.use("/api/github/webhook", githubWebhookRoute);
app.use("/api/razorpay/webhook", razorpayWebhookRoute);

app.use(express.json());

// Mount Inngest handler
app.use("/api/inngest", inngestRoute);

app.get("/", (req, res) => {
  return res.json({ message: "Streamyst is up and running..." });
});

app.get("/health", (req, res) => {
  return res.json({ message: "Streamyst server is healthy", healthy: true, headers: req.headers, protocol: req.protocol, hostname: req.hostname, url: req.url });
});

logger.debug(`openapi.json: ${env.BASE_URL}/openapi.json`);
app.get("/openapi.json", (req, res) => {
  return res.json(openApiDocument);
});

logger.debug(`docs: ${env.BASE_URL}/docs`);
app.use("/docs", apiReference({ url: "/openapi.json" }));

app.use(
  "/api",
  createOpenApiExpressMiddleware({
    router: serverRouter,
    createContext,
  }),
);

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: serverRouter,
    createContext,
    onError({ error, path }) {
      console.error(`=== tRPC Error at path "${path}" ===`);
      console.error(error);
    },
  }),
);
export default app;
