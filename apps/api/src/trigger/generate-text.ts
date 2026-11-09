import { task } from "@trigger.dev/sdk";
import { google } from "@ai-sdk/google";
import {
	convertToModelMessages,
	stepCountIs,
	streamText,
	type UIMessage,
} from "ai";
import { eq } from "drizzle-orm";

import { getDb } from "../db";
import { chatMessages, chats } from "../db/schema";
import { getOrCreateSession } from "../lib/session";
import { buildSystemPrompt, calculateCreditsForUsage } from "../lib/utils";
import { deductCreditsClamped } from "../lib/billing";
import type { CloudflareBindings } from "../types";
import { aiStream } from "./streams";

type ChatResponsePayload = {
	chatId: string;
	userId: string;
	agentContext: { name: string; description: string | null };
	messages: UIMessage[];
};

export const chatResponseTask = task({
	id: "chat-response",
	maxDuration: 300,
	run: async ({ chatId, userId, agentContext, messages }: ChatResponsePayload) => {
		// Build env from the task's own environment variables.
		// Use the exact names your getDb / getOrCreateSession / billing helpers read.
		const env = {
			DATABASE_URL: process.env.DATABASE_URL,
			COMPOSIO_API_KEY: process.env.COMPOSIO_API_KEY,
			// add any other keys those helpers read from env
		} as unknown as CloudflareBindings;

		const db = getDb(env);

		const session = await getOrCreateSession(userId, env);
		const tools = await session.tools();

		const result = streamText({
			model: google("gemini-2.5-flash"), // reads GOOGLE_GENERATIVE_AI_API_KEY from process.env
			maxOutputTokens: 8000,
			system: buildSystemPrompt(agentContext),
			tools,
			messages: await convertToModelMessages(messages),
			stopWhen: stepCountIs(5),
			onError: (error) => {
				console.error("[chat] streamText error:", error);
			},
		});

		// stream chunks to the Hono route as they are generated
		const { waitUntilComplete } = aiStream.pipe(result.toUIMessageStream());
		await waitUntilComplete();

		// your old onFinish logic
		try {
			const response = await result.response;
			const usage = await result.usage;

			const assistantMessages = response.messages.filter(
				(m) => m.role === "assistant",
			);

			const rows = assistantMessages.map((msg) => ({
				chatId,
				role: "assistant" as const,
				parts:
					typeof msg.content === "string"
						? [{ type: "text", text: msg.content }]
						: msg.content.map((part) =>
								part.type === "text" ? { type: "text", text: part.text } : part,
							),
			}));

			if (rows.length > 0) {
				await db.insert(chatMessages).values(rows);
			}

			await db
				.update(chats)
				.set({ updatedAt: new Date() })
				.where(eq(chats.id, chatId));

			await deductCreditsClamped(env, userId, calculateCreditsForUsage(usage));
		} catch (err) {
			console.error("[chat] failed to persist assistant message or deduct credits:", err);
		}
	},
});