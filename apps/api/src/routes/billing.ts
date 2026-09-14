// routes/billing.ts
import { Hono } from "hono";
import { requireUser } from "../middleware/auth";
import { getOrCreateCredits, canCreateAgent } from "../lib/billing";

import type { CloudflareBindings } from "../types";
import { PLAN_LIMITS } from "../lib/utils";

const app = new Hono<{ Bindings: CloudflareBindings }>()
  .use("*", requireUser)
  .get("/", async (c) => {
    const userId = c.get("userId");
    const [credits, agentLimit] = await Promise.all([
      getOrCreateCredits(c, userId),
      canCreateAgent(c, userId),
    ]);

    return c.json({
      plan: credits.plan,
      credits: credits.credits,
      maxCredits: PLAN_LIMITS[credits.plan as keyof typeof PLAN_LIMITS].credits,
      agents: { current: agentLimit.current, max: agentLimit.max },
    });
  });

export default app;