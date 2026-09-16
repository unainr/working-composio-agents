"use client";

import { useState } from "react";
import type { ComponentProps } from "react";
import {
	Sheet,
	SheetContent,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Plug, History, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatWindow } from "@/components/chat-window";
import { ToolkitPanel } from "@/components/toolkit-panel";
import { Spinner } from "@/components/ui/spinner";

import { useChatMessages, useInvalidateChats } from "@/hooks/use-chat";
import { ChatHistoryList } from "@/components/ChatHistoryList";
import { useQueryClient } from "@tanstack/react-query";
import { billingKey } from "@/hooks/use-billing";
import { UpgradeDialog } from "@/components/upgrade-dialog";

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
	const [showUpgrade, setShowUpgrade] = useState(false);
	const queryClient = useQueryClient();
	const { data: history, isLoading: historyLoading } =
		useChatMessages(activeChatId);
	const invalidateChats = useInvalidateChats();

	function handleSelectChat(chatId: string | null) {
		setActiveChatId(chatId);
		setTab("chat");
	}

	const readyToRenderChat = !activeChatId || (!historyLoading && !!history);

	return (
		<>
			{/* Trigger button */}
			<button
				onClick={() => setOpen(true)}
				className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/20 transition-transform hover:scale-105 active:scale-95"
				aria-label={`Chat with ${agentName}`}
			>
				<MessageCircle className="h-4 w-4" />
			</button>

			<Sheet
				open={open}
				onOpenChange={(next) => {
					setOpen(next);
					if (!next) {
						setActiveChatId(null);
						setTab("chat");
					}
				}}
			>
				<SheetContent
					side="right"
					className="w-full sm:max-w-105 p-0 flex flex-col gap-0 [&>button]:hidden"
				>
					{/* Header */}
					<div className="flex items-center gap-2.5 border-b px-4 py-3 shrink-0">
						<Avatar className="h-8 w-8 ring-2 ring-border/60 ring-offset-1 ring-offset-background">
							<AvatarImage src={agentAvatarUrl ?? undefined} alt={agentName} />
							<AvatarFallback className="text-xs">
								{agentName.slice(0, 2).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div className="flex flex-col items-start min-w-0 flex-1">
							<span className="text-sm font-semibold leading-tight truncate">
								{agentName}
							</span>
							<span className="text-xs font-normal text-muted-foreground leading-tight">
								AI Agent
							</span>
						</div>
						<Button
							size="icon"
							variant="ghost"
							className="h-7 w-7 rounded-lg shrink-0 text-muted-foreground hover:text-foreground"
							onClick={() => setOpen(false)}
						>
							<X className="h-4 w-4" />
						</Button>
					</div>

					{/* Tabs */}
					<Tabs
						value={tab}
						onValueChange={setTab}
						className="flex flex-1 min-h-0 flex-col gap-0"
					>
						<TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0 shrink-0">
							<TabsTrigger
								value="chat"
								className="gap-1.5 rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent"
							>
								<MessageCircle className="h-3.5 w-3.5" />
								Chat
							</TabsTrigger>
							<TabsTrigger
								value="history"
								className="gap-1.5 rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent"
							>
								<History className="h-3.5 w-3.5" />
								History
							</TabsTrigger>
							<TabsTrigger
								value="apps"
								className="gap-1.5 rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent"
							>
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
										onChatCreated={(id) => {
											setActiveChatId(id);
											invalidateChats(agentId);
										}}
										onConversationFinished={() => {
											queryClient.invalidateQueries({ queryKey: billingKey });
										}}
										onInsufficientCredits={() => setShowUpgrade(true)}
									/>
								) : (
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
							className="flex-1 min-h-0 mt-0 overflow-y-auto"
						>
							<ToolkitPanel />
						</TabsContent>
					</Tabs>
				</SheetContent>
			</Sheet>

			<UpgradeDialog
				open={showUpgrade}
				onOpenChange={setShowUpgrade}
				reason="credits"
			/>
		</>
	);
}