import { Hono } from "hono";
import { requireUser } from "../middleware/auth";
import { getDb } from "../db";
import {
  userCredits,
  agents,
  chats,
  creditTransactions,
} from "../db/schema";
import { eq, desc, count } from "drizzle-orm";
import type { CloudflareBindings } from "../types";

const MAX_AGENTS = 10;
const RECENT_TRANSACTIONS_LIMIT = 10;
const RECENT_CHATS_LIMIT = 5;

const app = new Hono<{ Bindings: CloudflareBindings }>()
  .use("*", requireUser)

  .get("/", async (c) => {
    const userId = c.get("userId");
    const db = getDb(c.env);

    const [
      creditsResult,
      agentsResult,
      chatsResult,
      recentTransactions,
      recentChats,
    ] = await Promise.all([
      // User credits
      db
        .select({
          credits: userCredits.credits,
        })
        .from(userCredits)
        .where(eq(userCredits.userId, userId))
        .limit(1),

      // Total agents
      db
        .select({
          count: count(),
        })
        .from(agents)
        .where(eq(agents.userId, userId)),

      // Total chats
      db
        .select({
          count: count(),
        })
        .from(chats)
        .where(eq(chats.userId, userId)),

      // Recent credit transactions
      db
        .select({
          id: creditTransactions.id,
          amount: creditTransactions.amount,
          type: creditTransactions.type,
          createdAt: creditTransactions.createdAt,
        })
        .from(creditTransactions)
        .where(eq(creditTransactions.userId, userId))
        .orderBy(desc(creditTransactions.createdAt))
        .limit(RECENT_TRANSACTIONS_LIMIT),

      // Recent chats
      db
        .select({
          id: chats.id,
          agentId: chats.agentId,
          createdAt: chats.createdAt,
          updatedAt: chats.updatedAt,
        })
        .from(chats)
        .where(eq(chats.userId, userId))
        .orderBy(desc(chats.updatedAt))
        .limit(RECENT_CHATS_LIMIT),
    ]);

    return c.json({
      credits: {
        remaining: creditsResult[0]?.credits ?? 0,
      },

      agents: {
        total: agentsResult[0]?.count ?? 0,
        max: MAX_AGENTS,
      },

      chats: {
        total: chatsResult[0]?.count ?? 0,
      },

      recentTransactions,
      recentChats,
    });
  });

export default app