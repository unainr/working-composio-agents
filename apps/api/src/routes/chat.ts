import { Hono } from "hono";
import { requireUser } from "../middleware/auth";

import { google } from "@ai-sdk/google";
import { convertToModelMessages, stepCountIs, streamText, UIMessage } from "ai";
import { getOrCreateSession } from "../lib/session";
import type { CloudflareBindings } from "../types";
import { chatMessages, chats } from "../db/schema";
import { getDb } from "../db";
import { eq, desc, and } from "drizzle-orm";
import { CREDITS_PER_CONVERSATION, SYSTEM_PROMPT } from "../lib/utils";
import { deductCredits } from "../lib/billing";

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
		// Charge credits only for starting a NEW conversation — replying within
		// an existing chat is free under this model. Checked/deducted before the
		// chat row is created so a failed charge never leaves an orphaned chat.
		if (isNewChat) {
			const charge = await deductCredits(c, userId, CREDITS_PER_CONVERSATION);
			if (!charge.ok) {
				return c.json(
					{
						error: "insufficient_credits",
						credits: charge.credits,
						required: CREDITS_PER_CONVERSATION,
					},
					402,
				);
			}
		}
		// Resolve or create the chat row
		let chatId = body.chatId;
		if (!chatId) {
			const [newChat] = await db
				.insert(chats)
				.values({ userId, agentId })
				.returning({ id: chats.id });
			chatId = newChat.id;
		}

		// Persist the latest user message (last item in uiMessages is the new one)
		const latestUserMessage = uiMessages.at(-1);
		if (latestUserMessage?.role === "user") {
			await db.insert(chatMessages).values({
				chatId,
				role: "user",
				parts: latestUserMessage.parts,
			});
		}

		const tools = await session.tools();

		const result = streamText({
			model: google("gemini-2.5-flash"),
			system: SYSTEM_PROMPT,
			tools,
			messages: await convertToModelMessages(uiMessages),
			stopWhen: stepCountIs(15),
			onError: (error) => {
				console.error("[chat] streamText error:", error);
			},
			onFinish: async ({ response }) => {
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

					// keep updatedAt current so the History list sorts by real activity
					await db
						.update(chats)
						.set({ updatedAt: new Date() })
						.where(eq(chats.id, chatId));
				} catch (err) {
					console.error("[chat] failed to persist assistant message:", err);
				}
			},
		});

		return result.toUIMessageStreamResponse({
			headers: { "X-Chat-Id": chatId },
		});
	})

	// List all chats for the current user, most recent first — optionally scoped to one agent
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

	// Fetch full message history for one chat
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

	// Optional: delete a chat
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
