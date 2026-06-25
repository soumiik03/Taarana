import { serve } from "inngest/next";
import { inngest } from "../../../features/inngest/client";

// Define an empty array for functions for now. 
// We will add the AI review function in Chapter 12.
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [],
});
