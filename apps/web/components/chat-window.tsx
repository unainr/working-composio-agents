"use client";

import { useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

import type { UIMessage } from "ai";
import { useAuth } from "@clerk/nextjs";

import GridLoader from "./loader/grid-load";

import {
	Conversation,
	ConversationContent,
	ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
	Message,
	MessageContent,
	MessageResponse,
} from "@/components/ai-elements/message";
import {
	Tool,
	ToolHeader,
	ToolContent,
	ToolInput,
	ToolOutput,
} from "@/components/ai-elements/tool";
import {
	PromptInput,
	PromptInputBody,
	PromptInputTextarea,
	PromptInputFooter,
	PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";

interface ChatWindowProps {
	agentId: string;
	chatId?: string | null;
	initialMessages?: UIMessage[];
	onChatCreated?: (chatId: string) => void;
	onInsufficientCredits?: () => void;
	onConversationFinished?: () => void;
}

/* ----------------------------- tool part helpers ---------------------------- */

type ToolPart = {
	type: string;
	state?: "input-streaming" | "input-available" | "output-available" | "output-error";
	toolName?: string;
	toolCallId?: string;
	input?: unknown;
	output?: unknown;
	errorText?: string;
};

function asToolPart(part: { type: string }): ToolPart | null {
	if (part.type === "dynamic-tool" || part.type.startsWith("tool-")) {
		return part as unknown as ToolPart;
	}
	return null;
}

type LinkItem = { label: string; url: string };
const URL_RE = /https?:\/\/[^\s"'<>\\)]+/g;

function hostOf(url: string) {
	try {
		return new URL(url).hostname.replace(/^www\./, "");
	} catch {
		return url;
	}
}

function labelFor(key: string, url: string) {
	const k = key
		.replace(/[_-]?(url|link|href)$/i, "")
		.replace(/([a-z])([A-Z])/g, "$1 $2")
		.replace(/[_-]+/g, " ")
		.trim();
	if (!k || /^(text|content|data|result)$/i.test(k)) return hostOf(url);
	return k.charAt(0).toUpperCase() + k.slice(1);
}

function extractLinks(
	value: unknown,
	key = "",
	out: LinkItem[] = [],
	depth = 0,
): LinkItem[] {
	if (depth > 6 || value == null) return out;

	if (typeof value === "string") {
		const s = value.trim();
		if (s.startsWith("{") || s.startsWith("[")) {
			try {
				return extractLinks(JSON.parse(s), key, out, depth + 1);
			} catch {
				/* not json, fall through */
			}
		}
		for (const m of s.match(URL_RE) ?? []) {
			const url = m.replace(/[.,;:!?]+$/, "");
			if (!out.some((l) => l.url === url)) {
				out.push({ label: labelFor(key, url), url });
			}
		}
		return out;
	}

	if (Array.isArray(value)) {
		value.forEach((v) => extractLinks(v, key, out, depth + 1));
	} else if (typeof value === "object") {
		for (const [k, v] of Object.entries(value)) extractLinks(v, k, out, depth + 1);
	}
	return out;
}

/* --------------------------------- component -------------------------------- */

export function ChatWindow({
	agentId,
	chatId,
	initialMessages,
	onChatCreated,
	onInsufficientCredits,
	onConversationFinished,
}: ChatWindowProps) {
	const { getToken } = useAuth();

	const { messages, sendMessage, status, error } = useChat({
		id: chatId ?? undefined,
		messages: initialMessages,
		transport: new DefaultChatTransport({
			api: `${process.env.NEXT_PUBLIC_API_URL}/api/chat`,
			headers: async () => {
				const token = await getToken();
				return { Authorization: `Bearer ${token}` };
			},
			body: { agentId, chatId },
			fetch: async (input, init) => {
				const response = await fetch(input, init);
				if (response.status === 402) {
					onInsufficientCredits?.();
				}
				const newChatId = response.headers.get("X-Chat-Id");
				if (newChatId && newChatId !== chatId) {
					onChatCreated?.(newChatId);
				}
				return response;
			},
		}),
		onFinish: () => {
			// Backend onFinish already wrote the credit deduction by now.
			onConversationFinished?.();
		},
	});

	const isStreaming = status === "submitted" || status === "streaming";
	const lastMessage = messages.at(-1);

	// text OR a tool card counts as "something visible" (so tool cards show while running)
	const hasVisibleContent = (m?: UIMessage) =>
		!!m?.parts?.some(
			(p) => (p.type === "text" && !!p.text?.length) || asToolPart(p) !== null,
		);

	const isThinking =
		status === "submitted" ||
		(status === "streaming" &&
			lastMessage?.role === "assistant" &&
			!hasVisibleContent(lastMessage));

	function handleSend(text: string) {
		const t = text.trim();
		if (!t || isStreaming) return;
		sendMessage({ text: t });
	}

	return (
		<div className="flex flex-col h-full min-h-0 min-w-0">
			{/* Messages */}
			<Conversation className="flex-1 min-h-0 thin-scrollbar">
				<ConversationContent className="gap-4 px-4 py-6">
					{messages.length === 0 && !isThinking && <EmptyState />}

					{messages.map((message, index) => {
						const isLast = index === messages.length - 1;

						if (
							isLast &&
							message.role === "assistant" &&
							!hasVisibleContent(message) &&
							isThinking
						) {
							return null;
						}

						return (
							<MessageRow
								key={message.id}
								role={message.role}
								parts={message.parts}
							/>
						);
					})}

					{isThinking && <ThinkingIndicator />}

					{error && (
						<p className="text-sm text-destructive text-center">
							Something went wrong. Please try again.
						</p>
					)}
				</ConversationContent>
				<ConversationScrollButton />
			</Conversation>

			{/* Input bar */}
			<div className="shrink-0 border-t border-border/50 px-3 py-3">
				<PromptInput onSubmit={({ text }) => handleSend(text)}>
					<PromptInputBody>
						<PromptInputTextarea
							disabled={isStreaming}
							placeholder="Ask the agent to do something…"
						/>
					</PromptInputBody>
					<PromptInputFooter className="justify-end">
						<PromptInputSubmit status={status} disabled={isStreaming} />
					</PromptInputFooter>
				</PromptInput>
				<p className="mt-1.5 text-[11px] text-muted-foreground/40 text-center">
					Enter to send · Shift+Enter for new line
				</p>
			</div>
		</div>
	);
}

/* ------------------------------ message rendering ---------------------------- */

function MessageRow({
	role,
	parts,
}: {
	role: "user" | "assistant" | "system";
	parts: UIMessage["parts"];
}) {
	// keep the original order: text, tool card, text...
	const visible = parts.filter(
		(p) => (p.type === "text" && !!p.text?.length) || asToolPart(p) !== null,
	);

	return (
		<Message from={role} className="min-w-0">
			<MessageContent className="min-w-0 wrap-anywhere">
				{visible.map((part, i) => {
					const tool = asToolPart(part);

					if (tool) {
						return (
							<ToolBlock
								key={tool.toolCallId ?? `${tool.type}-${i}`}
								part={tool}
							/>
						);
					}

					if (part.type === "text") {
						return (
							<MessageResponse key={i} className="wrap-anywhere">
								{part.text}
							</MessageResponse>
						);
					}
					return null;
				})}
			</MessageContent>
		</Message>
	);
}

/* --------------------------------- tool card --------------------------------- */

function ToolBlock({ part }: { part: ToolPart }) {
	const done = part.state === "output-available";

	const links = useMemo(
		() => (done ? extractLinks(part.output) : []),
		[done, part.output],
	);

	// ToolHeader for dynamic tools needs toolName; static tools read it from `type`
	const headerProps =
		part.type === "dynamic-tool"
			? ({ type: "dynamic-tool", toolName: part.toolName ?? "tool" } as const)
			: ({ type: part.type } as const);

	return (
		<div className="w-full min-w-0 space-y-2">
			<Tool>
				<ToolHeader
					{...(headerProps as any)}
					state={part.state ?? "input-streaming"}
				/>
				<ToolContent>
					{part.input !== undefined && <ToolInput input={part.input as any} />}
					<ToolOutput
						output={part.output as any}
						errorText={part.errorText}
					/>
				</ToolContent>
			</Tool>

			{/* link buttons stay visible even when the tool card is collapsed */}
			{links.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{links.map((l) => (
						<a
							key={l.url}
							href={l.url}
							target="_blank"
							rel="noopener noreferrer"
							className={cn(
								"inline-flex max-w-full items-center gap-1.5 rounded-lg border border-border/60",
								"bg-background px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-accent",
							)}
						>
							<ExternalLink className="h-3 w-3 shrink-0" />
							<span className="truncate">{l.label}</span>
							<span className="hidden truncate text-muted-foreground sm:inline">
								{hostOf(l.url)}
							</span>
						</a>
					))}
				</div>
			)}
		</div>
	);
}

/* ---------------------------------- misc ui ---------------------------------- */

function ThinkingIndicator() {
	return (
		<div className="flex items-center gap-2.5 rounded-full px-4 py-2">
			<GridLoader
				blur={1}
				color="white"
				gap={1}
				mode="stagger"
				pattern="frame"
				size="sm"
			/>
			<span className="font-medium text-sm">Thinking</span>
		</div>
	);
}

function EmptyState() {
	return (
		<div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-2 mt-24">
			<p className="text-base font-medium text-foreground">AI Agent ready</p>
			<p className="text-sm max-w-xs">
				Ask this agent to send emails, create GitHub issues, post to Slack, and
				more.
			</p>
		</div>
	);
}