import { serve } from "inngest/express";
import { inngest } from "../inngest/client";
import { clarifyFeatureRequest } from "../inngest/functions/clarify-request";

import { checkFeatureRequestContext } from "../inngest/functions/check-context";

export const inngestRoute = serve({
  client: inngest,
  functions: [
    clarifyFeatureRequest,
    checkFeatureRequestContext,
  ],
});
