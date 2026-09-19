import { eq, sql } from "drizzle-orm";
import { getDb } from "../db";
import { userCredits, agents, creditTransactions } from "../db/schema";
import { PLAN_LIMITS, type PlanTier } from "./utils";
import type { CloudflareBindings } from "../types";

type Db = ReturnType<typeof getDb>;

export async function getOrCreateCredits(env: CloudflareBindings, userId: string) {
  const db = getDb(env);

  await db
    .insert(userCredits)
    .values({ userId, credits: 40 }) // ← no plan
    .onConflictDoNothing();

  const [row] = await db
    .select()
    .from(userCredits)
    .where(eq(userCredits.userId, userId));

  return row;
}

// Add credits on top of existing balance (for credit pack purchases)
export async function addCredits(db: Db, userId: string, amount: number, description: string) {
  const [updated] = await db
    .insert(userCredits)
    .values({ userId, credits: amount }) // ← no plan here
    .onConflictDoUpdate({
      target: userCredits.userId,
      set: {
        credits: sql`${userCredits.credits} + ${amount}`,
        updatedAt: new Date(),
      },
    })
    .returning();

  await db.insert(creditTransactions).values({
    userId,
    type: "purchase",
    amount,
    description,
  });

  return updated;
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

// billing.ts
export async function canCreateAgent(env: CloudflareBindings, userId: string) {
  const db = getDb(env);
  const row = await getOrCreateCredits(env, userId);

  const userAgents = await db
    .select({ id: agents.id })
    .from(agents)
    .where(eq(agents.userId, userId));

  return {
    allowed: userAgents.length < 10,
    current: userAgents.length,
    max: 10,
  };
}