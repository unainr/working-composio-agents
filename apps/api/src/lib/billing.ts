
import type { Context } from "hono";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { userCredits, agents } from "../db/schema";
import type { CloudflareBindings } from "../types";
import { getAuth } from "@clerk/hono";
import { PLAN_LIMITS, PlanTier } from "./utils";
type Ctx = Context<{
  Bindings: CloudflareBindings;
  Variables: {
    userId: string;
  };
}>;

/**
 * Reads the user's plan from the Clerk session token — no DB or network call.
 * IMPORTANT: 'pro' must match the exact Plan slug you created in the Clerk
 * Dashboard. If yours is named differently, change the string below.
 */
export function getPlanTier(c: Ctx): PlanTier {
  const auth = getAuth(c);
  const isPro = auth?.has?.({ plan: "pro" }) ?? false;
  return isPro ? "pro" : "free";
}

/**
 * Gets the user's credit row, creating it (seeded to their plan's allowance)
 * on first access. If Clerk now reports a different plan than what's cached
 * (typically: they just upgraded), tops the balance up to the new plan's amount.
 *
 * This top-up-on-mismatch approach is simple but not a real billing-cycle reset —
 * for production you'll eventually want a Clerk webhook (subscription.updated)
 * to reset credits monthly rather than only on the user's next request.
 */
export async function getOrCreateCredits(c: Ctx, userId: string) {
  const db = getDb(c.env);
  const plan = getPlanTier(c);

  const [existing] = await db
    .select()
    .from(userCredits)
    .where(eq(userCredits.userId, userId));

  if (!existing) {
    const [created] = await db
      .insert(userCredits)
      .values({ userId, credits: PLAN_LIMITS[plan].credits, plan })
      .returning();
    return created;
  }

  if (existing.plan !== plan) {
    const [updated] = await db
      .update(userCredits)
      .set({ plan, credits: PLAN_LIMITS[plan].credits, updatedAt: new Date() })
      .where(eq(userCredits.userId, userId))
      .returning();
    return updated;
  }

  return existing;
}

export async function deductCredits(c: Ctx, userId: string, amount: number) {
  const db = getDb(c.env);
  const row = await getOrCreateCredits(c, userId);

  if (row.credits < amount) {
    return { ok: false as const, credits: row.credits };
  }

  const [updated] = await db
    .update(userCredits)
    .set({ credits: row.credits - amount, updatedAt: new Date() })
    .where(eq(userCredits.userId, userId))
    .returning();

  return { ok: true as const, credits: updated.credits };
}

export async function canCreateAgent(c: Ctx, userId: string) {
  const db = getDb(c.env);
  const plan = getPlanTier(c);

  const userAgents = await db
    .select({ id: agents.id })
    .from(agents)
    .where(eq(agents.userId, userId));

  return {
    allowed: userAgents.length < PLAN_LIMITS[plan].maxAgents,
    current: userAgents.length,
    max: PLAN_LIMITS[plan].maxAgents,
    plan,
  };
}


export async function deductCreditsClamped(c: Ctx, userId: string, amount: number) {
  const db = getDb(c.env);
  const row = await getOrCreateCredits(c, userId);

  const newBalance = Math.max(0, row.credits - amount);

  const [updated] = await db
    .update(userCredits)
    .set({ credits: newBalance, updatedAt: new Date() })
    .where(eq(userCredits.userId, userId))
    .returning();

  return updated;
}

// A lightweight pre-check before starting a new conversation — confirms the
// user has at least the minimum possible charge available, so someone at 0
// credits can't start a chat they can never afford, without needing to
// guess the exchange's eventual real cost upfront.
export async function hasMinimumCredits(c: Ctx, userId: string, minimum: number) {
  const row = await getOrCreateCredits(c, userId);
  return row.credits >= minimum;
}