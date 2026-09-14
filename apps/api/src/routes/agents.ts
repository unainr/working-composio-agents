import { Hono } from "hono";
import { requireUser } from "../middleware/auth";

import type { CloudflareBindings } from "../types";
import { agents } from "../db/schema";
import { getDb } from "../db";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { and, eq } from "drizzle-orm";
import { canCreateAgent } from "../lib/billing";

const agentSchame = z.object({
	name: z.string().min(2).max(100),
	description: z.string().max(256).optional(),
	avatarUrl: z.string().url().optional(),
});

const app = new Hono<{ Bindings: CloudflareBindings }>()
	.use("*", requireUser)

	.post("/", requireUser, zValidator("json", agentSchame), async (c) => {
		const db = getDb(c.env);
		const userId = c.get("userId");
		const { name, description, avatarUrl } = c.req.valid("json");
const limit = await canCreateAgent(c, userId);
  if (!limit.allowed) {
    return c.json(
      { error: "agent_limit_reached", current: limit.current, max: limit.max, plan: limit.plan },
      403
    );
  }
		// Create a new agent
		const [newAgent] = await db
			.insert(agents)
			.values({
				userId,
				name,
				description,
				avatarUrl,
			})
			.returning();
		return c.json(newAgent, 201);
	})

	.get("/", requireUser, async (c) => {
		const userId = c.get("userId");
		const db = getDb(c.env);
		const userAgents = await db
			.select()
			.from(agents)
			.where(eq(agents.userId, userId));
		return c.json(userAgents);
	})

	.get(
		"/:agentId",
		requireUser,
		zValidator("param", z.object({ agentId: z.string() })),
		async (c) => {
			const userId = c.get("userId");
			const db = getDb(c.env);
			const { agentId } = c.req.valid("param");
			const agent = await db
				.select()
				.from(agents)
				.where(and(eq(agents.userId, userId), eq(agents.id, agentId)));
			if (!agent) {
				return c.json({ error: "Agent not found" }, 404);
			}
			return c.json(agent);
		},
	)

			// DELETE /:id — delete agents
	.delete(
		"/:id",
		zValidator("param", z.object({ id: z.string() })),
		requireUser,
		async (c) => {
			const ownerId = c.get("userId");
			const { id } = c.req.valid("param");
			const db = getDb(c.env);

			const [existing] = await db
				.select()
				.from(agents)
				.where(and(eq(agents.id, id), eq(agents.userId, ownerId)));

			if (!existing) {
				return c.json({ error: "Salon not found" }, 404);
			}

			await db
				.delete(agents)
				.where(and(eq(agents.id, id), eq(agents.userId, ownerId)));

			return c.json({ success: true });
		},
	);

export default app;
