import { serve } from "inngest/express";
import { inngest } from "../inngest/client";
import { clarifyFeatureRequest } from "../inngest/functions/clarify-request";
import { generatePrdFunction } from "../inngest/functions/generate-prd";
import { checkFeatureRequestContext } from "../inngest/functions/check-context";
import { generateTasksFunction } from "../inngest/functions/generate-tasks";
import { reviewPRFunction } from "../inngest/functions/review-pr";

export const inngestRoute = serve({
  client: inngest,
  functions: [
    clarifyFeatureRequest,
    checkFeatureRequestContext,
    generatePrdFunction,
    generateTasksFunction,
    reviewPRFunction,
  ],
});
