import { router } from "./trpc";
import { healthRouter } from "./routes/health/route";
import { authRouter } from "./routes/auth/route";
import { workspaceRouter } from "./routes/workspace/route";
import { githubRouter } from "./routes/github/route";
import { featureRequestsRouter } from "./routes/feature-requests/route";
import { prdRouter } from "./routes/prd/route";
import { tasksRouter } from "./routes/tasks/route";

export const serverRouter = router({
  health: healthRouter,
  auth: authRouter,
  workspace: workspaceRouter,
  github: githubRouter,
  featureRequests: featureRequestsRouter,
  prd: prdRouter,
  tasks:tasksRouter
});

export { createContext } from "./context";
export type ServerRouter = typeof serverRouter;
