console.log("[Startup] Step 1: Entering index.ts");
import http from "node:http";
import { logger } from "@repo/logger";
console.log("[Startup] Step 2: Importing server.ts");
import { app as expressApplication } from "./server";
console.log("[Startup] Step 3: Imported server.ts");

import { env } from "./env";

async function init() {
  console.log("[Startup] Step 4: Entering init()");
  try {
    console.log("[Startup] Step 5: Creating http server");
    const server = http.createServer(expressApplication);
    const PORT: number = env.PORT ? +env.PORT : 8000;
    console.log(`[Startup] Step 6: Starting to listen on PORT ${PORT} and host 0.0.0.0`);
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`[Startup] Step 7: Server started listening on PORT ${PORT}`);
      logger.info(`http server is running on PORT ${PORT}`);
    });
  } catch (err) {
    console.error(`[Startup] Error during init()`, err);
    logger.error(`Error creating http server`, { err });
    process.exit(1);
  }
}

init();
