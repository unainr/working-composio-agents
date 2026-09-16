import { Hono } from "hono";
import { requireUser } from "../middleware/auth";

import { google } from "@ai-sdk/google";
import { convertToModelMessages, stepCountIs, streamText, UIMessage } from "ai";
import { getOrCreateSession } from "../lib/session";
import type { CloudflareBindings } from "../types";
import { agents, chatMessages, chats } from "../db/schema";
import { getDb } from "../db";
import { eq, desc, and } from "drizzle-orm";
import { buildSystemPrompt, calculateCreditsForUsage, CREDIT_CONVERSION } from "../lib/utils";

import { deductCreditsClamped, hasMinimumCredits } from "../lib/billing";

type ChatRequest = {
	chatId?: string;
	agentId?: string;
	messages?: UIMessage[];
};

const app = new Hono<{ Bindings: CloudflareBindings }>()
	.use("*", requireUser)
	.post("/", async (c) => {
		const db = getDb(c.env);

		const userId = c.get("userId");
		const body = await c.req.json<ChatRequest>();
		const uiMessages = body.messages ?? [];
		const agentId = body.agentId;
		const isNewChat = !body.chatId;

		let session;
		try {
			session = await getOrCreateSession(userId, c.env);
		} catch (err) {
			console.error("[chat] failed to get/create Composio session:", err);
			return c.json(
				{ error: "Could not connect to session store. Try again shortly." },
				503,
			);
		}

		if (isNewChat) {
			const canAfford = await hasMinimumCredits(
				c.env,
				userId,
				CREDIT_CONVERSION.minCreditsPerConversation,
			);
			if (!canAfford) {
				return c.json(
					{
						error: "insufficient_credits",
						required: CREDIT_CONVERSION.minCreditsPerConversation,
					},
					402,
				);
			}
		}

		let chatId = body.chatId;
		if (!chatId) {
			const [newChat] = await db
				.insert(chats)
				.values({ userId, agentId })
				.returning({ id: chats.id });
			chatId = newChat.id;
		}

		const latestUserMessage = uiMessages.at(-1);
		if (latestUserMessage?.role === "user") {
			await db.insert(chatMessages).values({
				chatId,
				role: "user",
				parts: latestUserMessage.parts,
			});
		}

		let agentContext = { name: "AI Agent", description: null as string | null };
		if (agentId) {
			const [agent] = await db
				.select({ name: agents.name, description: agents.description })
				.from(agents)
				.where(eq(agents.id, agentId));
			if (agent) agentContext = agent;
		}

		const tools = await session.tools();

		const result = streamText({
			model: google("gemini-2.5-flash"),
			system: buildSystemPrompt(agentContext),
			tools,
			messages: await convertToModelMessages(uiMessages),
			stopWhen: stepCountIs(15),
			onError: (error) => {
				console.error("[chat] streamText error:", error);
			},
			onFinish: async ({ response, usage }) => {
				try {
					const assistantMessages = response.messages.filter(
						(m) => m.role === "assistant",
					);

					for (const msg of assistantMessages) {
						const parts =
							typeof msg.content === "string"
								? [{ type: "text", text: msg.content }]
								: msg.content.map((part) => {
										if (part.type === "text") {
											return { type: "text", text: part.text };
										}
										return part;
									});

						await db.insert(chatMessages).values({
							chatId,
							role: "assistant",
							parts,
						});
					}

					await db
						.update(chats)
						.set({ updatedAt: new Date() })
						.where(eq(chats.id, chatId));

					if (isNewChat) {
						const creditsToCharge = calculateCreditsForUsage(usage);
						await deductCreditsClamped(c.env, userId, creditsToCharge);
					}
				} catch (err) {
					console.error("[chat] failed to persist assistant message or deduct credits:", err);
				}
			},
		});

		return result.toUIMessageStreamResponse({
			headers: { "X-Chat-Id": chatId },
		});
	})

	.get("/", requireUser, async (c) => {
		const userId = c.get("userId");
		const agentId = c.req.query("agentId");
		const db = getDb(c.env);

		const conditions = [eq(chats.userId, userId)];
		if (agentId) conditions.push(eq(chats.agentId, agentId));

		const userChats = await db
			.select({
				id: chats.id,
				agentId: chats.agentId,
				updatedAt: chats.updatedAt,
				createdAt: chats.createdAt,
			})
			.from(chats)
			.where(and(...conditions))
			.orderBy(desc(chats.updatedAt));

		return c.json({ chats: userChats });
	})

	.get("/:chatId/messages", async (c) => {
		const userId = c.get("userId");
		const chatId = c.req.param("chatId");
		const db = getDb(c.env);

		const [chat] = await db.select().from(chats).where(eq(chats.id, chatId));
		if (!chat || chat.userId !== userId) {
			return c.json({ error: "Not found" }, 404);
		}

		const messages = await db
			.select()
			.from(chatMessages)
			.where(eq(chatMessages.chatId, chatId))
			.orderBy(chatMessages.createdAt);

		const uiMessages = messages.map((m) => ({
			id: m.id,
			role: m.role as "user" | "assistant",
			parts: m.parts as { type: string; text?: string }[],
		}));

		return c.json({ chatId, messages: uiMessages });
	})

	.delete("/:chatId", async (c) => {
		const userId = c.get("userId");
		const chatId = c.req.param("chatId");
		const db = getDb(c.env);

		const [chat] = await db.select().from(chats).where(eq(chats.id, chatId));
		if (!chat || chat.userId !== userId) {
			return c.json({ error: "Not found" }, 404);
		}

		await db.delete(chats).where(eq(chats.id, chatId));
		return c.json({ success: true });
	});

export default app;