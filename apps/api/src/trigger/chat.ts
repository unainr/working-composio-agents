import { chat } from "@trigger.dev/sdk/ai";
import { google } from "@ai-sdk/google";
import { stepCountIs, streamText } from "ai";
import { eq } from "drizzle-orm";

import { getDb } from "../db";
import { agents, chatMessages, chats } from "../db/schema";
import { getOrCreateSession } from "../lib/session";
import {
	buildSystemPrompt,
	calculateCreditsForUsage,
	CREDIT_CONVERSION,
} from "../lib/utils";
import { deductCreditsClamped, hasMinimumCredits } from "../lib/billing";
import type { CloudflareBindings } from "../types";

declare const process: { env: CloudflareBindings };

// Trigger has no c.env, so use process.env in the same shape
const getEnv = () => process.env;

// find who owns the chat from your DB (never trust the browser for userId)
async function loadChat(chatId: string) {
	const [row] = await getDb(getEnv())
		.select({ userId: chats.userId, agentId: chats.agentId })
		.from(chats)
		.where(eq(chats.id, chatId));
	if (!row) throw new Error("Chat not found");
	return row;
}

export const amanisesChat = chat.agent({
	id: "amanises-chat",

	uiMessageStreamOptions: {
		onError: (error) => {
			console.error("[chat] stream error:", error);
			return "Something went wrong. Please try again.";
		},
	},

	// runs before every message: credit check
	onValidateMessages: async ({ chatId, messages }) => {
		const { userId } = await loadChat(chatId);
		const ok = await hasMinimumCredits(
			getEnv(),
			userId,
			CREDIT_CONVERSION.minCreditsPerConversation,
		);
		if (!ok) throw new Error("insufficient_credits");
		return messages;
	},

	// save the user's message
	onTurnStart: async ({ chatId, uiMessages }) => {
		const last = uiMessages.at(-1);
		if (last?.role !== "user") return;
		await getDb(getEnv())
			.insert(chatMessages)
			.values({ chatId, role: "user", parts: last.parts });
	},

	// the actual AI call (your old streamText)
	run: async ({ chatId, messages, signal }) => {
		const env = getEnv();
		const { userId, agentId } = await loadChat(chatId);
		const db = getDb(env);

		let agentContext = { name: "AI Agent", description: null as string | null };
		if (agentId) {
			const [agent] = await db
				.select({ name: agents.name, description: agents.description })
				.from(agents)
				.where(eq(agents.id, agentId));
			if (agent) agentContext = agent;
		}

		const session = await getOrCreateSession(userId, env);
		const tools = await session.tools();

		return streamText({
			...chat.toStreamTextOptions(),
			model: google("gemini-2.5-flash"),
			maxOutputTokens: 8000,
			system: buildSystemPrompt(agentContext),
			tools,
			messages,
			abortSignal: signal,
			stopWhen: stepCountIs(5),
		});
	},

	// after the answer: save it + deduct credits (your old onFinish)
	onTurnComplete: async ({ chatId, responseMessage, usage }) => {
		try {
			const env = getEnv();
			const db = getDb(env);
			const { userId } = await loadChat(chatId);

			if (responseMessage) {
				await db
					.insert(chatMessages)
					.values({ chatId, role: "assistant", parts: responseMessage.parts });
			}
			await db
				.update(chats)
				.set({ updatedAt: new Date() })
				.where(eq(chats.id, chatId));

			if (usage) {
				await deductCreditsClamped(
					env,
					userId,
					calculateCreditsForUsage(usage),
				);
			}
		} catch (err) {
			console.error("[chat] persist/credits failed:", err);
		}
	},
});
