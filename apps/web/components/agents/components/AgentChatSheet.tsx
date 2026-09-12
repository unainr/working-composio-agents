"use client";

import { useState } from "react";
import type { ComponentProps } from "react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Plug, History } from "lucide-react";
import { ChatWindow } from "@/components/chat-window";
import { ToolkitPanel } from "@/components/toolkit-panel";
import { Spinner } from "@/components/ui/spinner";

import { useChatMessages, useInvalidateChats } from "@/hooks/use-chat";
import { ChatHistoryList } from "@/components/ChatHistoryList";

interface AgentChatWidgetProps {
	agentId: string;
	agentName: string;
	agentAvatarUrl?: string | null;
}

export function AgentChatWidget({
	agentId,
	agentName,
	agentAvatarUrl,
}: AgentChatWidgetProps) {
	const [open, setOpen] = useState(false);
	const [activeChatId, setActiveChatId] = useState<string | null>(null);
	const [tab, setTab] = useState("chat");

	// isLoading is only true while a chatId is set AND the fetch hasn't resolved yet
	const { data: history, isLoading: historyLoading } =
		useChatMessages(activeChatId);
	const invalidateChats = useInvalidateChats();

	function handleSelectChat(chatId: string | null) {
		setActiveChatId(chatId);
		setTab("chat");
	}

	// For a brand-new chat (activeChatId null) there's nothing to wait for.
	// For a resumed chat, wait until history has actually loaded before mounting ChatWindow.
	const readyToRenderChat = !activeChatId || (!historyLoading && !!history);

	return (
		<Popover
			open={open}
			onOpenChange={(next) => {
				setOpen(next);
				if (!next) {
					setActiveChatId(null);
					setTab("chat");
				}
			}}>
			<PopoverTrigger asChild>
				<button
					className="h-10 w-10 rounded-full overflow-hidden ring-1 ring-border hover:ring-primary/50 transition-all shrink-0"
					aria-label={`Chat with ${agentName}`}>
					<Avatar className="h-full w-full">
						<AvatarImage src={agentAvatarUrl ?? undefined} alt={agentName} />
						<AvatarFallback className="text-xs">
							{agentName.slice(0, 2).toUpperCase()}
						</AvatarFallback>
					</Avatar>
				</button>
			</PopoverTrigger>

			<PopoverContent
				side="top"
				align="end"
				sideOffset={10}
				className="w-[min(380px,calc(100vw-2.5rem))] h-[min(560px,calc(100vh-8rem))] p-0 flex flex-col gap-0 overflow-hidden rounded-2xl z-50">
				<div className="flex items-center gap-2.5 border-b px-4 py-3 shrink-0">
					<Avatar className="h-8 w-8">
						<AvatarImage src={agentAvatarUrl ?? undefined} alt={agentName} />
						<AvatarFallback className="text-xs">
							{agentName.slice(0, 2).toUpperCase()}
						</AvatarFallback>
					</Avatar>
					<div className="flex flex-col items-start min-w-0">
						<span className="text-sm font-semibold leading-tight truncate">
							{agentName}
						</span>
						<span className="text-xs font-normal text-muted-foreground leading-tight">
							AI Agent
						</span>
					</div>
				</div>

				<Tabs
					value={tab}
					onValueChange={setTab}
					className="flex flex-1 min-h-0 flex-col gap-0">
					<TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0 shrink-0">
						<TabsTrigger
							value="chat"
							className="gap-1.5 rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent">
							<MessageCircle className="h-3.5 w-3.5" />
							Chat
						</TabsTrigger>
						<TabsTrigger
							value="history"
							className="gap-1.5 rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent">
							<History className="h-3.5 w-3.5" />
							History
						</TabsTrigger>
						<TabsTrigger
							value="apps"
							className="gap-1.5 rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent">
							<Plug className="h-3.5 w-3.5" />
							Apps
						</TabsTrigger>
					</TabsList>

					<TabsContent value="chat" className="flex-1 min-h-0 mt-0">
						{open &&
							(readyToRenderChat ? (
								<ChatWindow
									key={activeChatId ?? "new"}
									agentId={agentId}
									chatId={activeChatId}
									initialMessages={
										history?.messages as ComponentProps<
											typeof ChatWindow
										>["initialMessages"]
									}
									onChatCreated={(id: string) => {
										setActiveChatId(id);
										invalidateChats(agentId);
									}}
								/>
							) : (
								// Shown briefly while history loads for a resumed chat
								<div className="flex h-full items-center justify-center">
									<Spinner />
								</div>
							))}
					</TabsContent>

					<TabsContent value="history" className="flex-1 min-h-0 mt-0">
						<ChatHistoryList
							agentId={agentId}
							activeChatId={activeChatId}
							onSelect={handleSelectChat}
						/>
					</TabsContent>

					<TabsContent
						value="apps"
						className="flex-1 min-h-0 mt-0 overflow-y-auto">
						<ToolkitPanel />
					</TabsContent>
				</Tabs>
			</PopoverContent>
		</Popover>
	);
}
