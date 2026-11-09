import { Hono } from "hono";
import { requireUser } from "../middleware/auth";

import { google } from "@ai-sdk/google";
import { convertToModelMessages, createUIMessageStreamResponse, stepCountIs, streamText, UIMessage, UIMessageChunk } from "ai";
import { getOrCreateSession } from "../lib/session";
import type { CloudflareBindings } from "../types";
import { agents, chatMessages, chats } from "../db/schema";
import { getDb } from "../db";
import { eq, desc, and } from "drizzle-orm";
import { buildSystemPrompt, calculateCreditsForUsage, CREDIT_CONVERSION } from "../lib/utils";

import { deductCreditsClamped, hasMinimumCredits } from "../lib/billing";
import { tasks } from "@trigger.dev/sdk";
import { chatResponseTask } from "../trigger/generate-text";
import { aiStream } from "../trigger/streams";

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

	// Check credits on every message, not just new chats
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

	let chatId = body.chatId;
	if (!chatId) {
		const [newChat] = await db
			.insert(chats)
			.values({ userId, agentId })
			.returning({ id: chats.id });
		chatId = newChat.id;
	} else {
		// make sure the chat belongs to this user
		const [owned] = await db
			.select({ id: chats.id })
			.from(chats)
			.where(and(eq(chats.id, chatId), eq(chats.userId, userId)));
		if (!owned) return c.json({ error: "Not found" }, 404);
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

	// run the AI response on Trigger.dev
	const handle = await tasks.trigger<typeof chatResponseTask>("chat-response", {
		chatId,
		userId,
		agentContext,
		messages: uiMessages,
	});

	// read the task's stream and pass it through to the browser
	const readAbort = new AbortController();

	const iterable = await aiStream.read(handle.id, {
		timeoutInSeconds: 300,
		signal: readAbort.signal,
	});

	const stream = new ReadableStream<UIMessageChunk>({
		async start(controller) {
			try {
				for await (const chunk of iterable) {
					controller.enqueue(chunk);

					// last chunk of the response: end the HTTP stream so the UI goes back to "ready"
					if (
						chunk.type === "finish" ||
						chunk.type === "abort" ||
						chunk.type === "error"
					) {
						break;
					}
				}
				controller.close();
			} catch (err) {
				if ((err as Error)?.name !== "AbortError") controller.error(err);
				else controller.close();
			} finally {
				readAbort.abort(); // release the connection to Trigger
			}
		},
		cancel() {
			// browser disconnected (user pressed stop or closed the tab)
			readAbort.abort();
		},
	});

	return createUIMessageStreamResponse({
		stream,
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