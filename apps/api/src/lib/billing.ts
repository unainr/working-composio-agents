import { eq, sql } from "drizzle-orm";
import { getDb } from "../db";
import { userCredits, agents, creditTransactions } from "../db/schema";
import { PLAN_LIMITS, type PlanTier } from "./utils";
import type { CloudflareBindings } from "../types";

type Db = ReturnType<typeof getDb>;

/**
 * Gets the user's credit row, creating a free-tier row on first access.
 * Takes the raw env bindings rather than a Hono Context — these functions
 * only ever need db access, and depending on the full Context generic here
 * made every call site fight Hono's Variables typing whenever middleware
 * added its own userId shape. Passing c.env instead sidesteps that entirely.
 */
export async function getOrCreateCredits(env: CloudflareBindings, userId: string) {
  const db = getDb(env);

  // Try insert first — if user already exists, do nothing
  await db
    .insert(userCredits)
    .values({ userId, credits: PLAN_LIMITS.free.credits, plan: "free" })
    .onConflictDoNothing();

  // Always fetch and return the row (whether just created or already existed)
  const [row] = await db
    .select()
    .from(userCredits)
    .where(eq(userCredits.userId, userId));

  return row;
}

export async function deductCreditsClamped(
  env: CloudflareBindings,
  userId: string,
  amount: number,
  description = "Conversation usage",
) {
  const db = getDb(env);
  await getOrCreateCredits(env, userId);

  const [updated] = await db
    .update(userCredits)
    .set({
      credits: sql`GREATEST(${userCredits.credits} - ${amount}, 0)`,
      updatedAt: new Date(),
    })
    .where(eq(userCredits.userId, userId))
    .returning();

  await db.insert(creditTransactions).values({
    userId,
    type: "usage",
    amount: -amount,
    description,
  });

  return updated;
}

export async function hasMinimumCredits(env: CloudflareBindings, userId: string, minimum: number) {
  const row = await getOrCreateCredits(env, userId);
  return row.credits >= minimum;
}

export async function canCreateAgent(env: CloudflareBindings, userId: string) {
  const db = getDb(env);
  const row = await getOrCreateCredits(env, userId);
  const plan = row.plan as PlanTier;

  const userAgents = await db.select({ id: agents.id }).from(agents).where(eq(agents.userId, userId));

  return {
    allowed: userAgents.length < PLAN_LIMITS[plan].maxAgents,
    current: userAgents.length,
    max: PLAN_LIMITS[plan].maxAgents,
    plan,
  };
}

export async function grantPlanCredits(db: Db, userId: string, plan: PlanTier) {
  await db
    .insert(userCredits)
    .values({ userId, plan, credits: PLAN_LIMITS[plan].credits })
    .onConflictDoUpdate({
      target: userCredits.userId,
      set: { plan, credits: PLAN_LIMITS[plan].credits, updatedAt: new Date() },
    });

  await db.insert(creditTransactions).values({
    userId,
    type: "monthly_grant",
    amount: PLAN_LIMITS[plan].credits,
    description: `${plan === "pro" ? "Pro" : "Free"} plan — credits reset`,
  });
}