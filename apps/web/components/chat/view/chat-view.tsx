"use client";

import { useState } from "react";
import type { ComponentProps } from "react";
import { PanelRightClose } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ChatWindow } from "@/components/chat-window";
import { UpgradeDialog } from "@/components/upgrade-dialog";
import { useChatMessages, useInvalidateChats } from "@/hooks/use-chat";
import { billingKey } from "@/hooks/use-billing";
import { ChatLeftSidebar } from "../components/chat-left-sidebar";
import { ChatRightSidebar } from "../components/chat-right-sidebar";
import { useRightPanel } from "../hooks/use-right-panel";

interface Props {
	id: string;
	agentName?: string;
}

export const ChatView = ({ id, agentName = "Agent" }: Props) => {
	// Chat the user OPENED from the sidebar (null = new chat). Only this loads history.
	const [activeChatId, setActiveChatId] = useState<string | null>(null);

	// Chat that the backend CREATED while the user is typing in the current window.
	// Used only to highlight it in the sidebar. It must NOT remount the window.
	const [liveChatId, setLiveChatId] = useState<string | null>(null);

	// Changes ONLY when the user clicks "New chat" or opens a chat from the sidebar.
	const [windowKey, setWindowKey] = useState(() => crypto.randomUUID());

	const [showUpgrade, setShowUpgrade] = useState(false);
	const rightPanel = useRightPanel();

	const queryClient = useQueryClient();
	const invalidateChats = useInvalidateChats();

	const currentChatId = activeChatId ?? liveChatId;

	function openChat(chatId: string | null) {
		setActiveChatId(chatId);
		setLiveChatId(null);
		setWindowKey(crypto.randomUUID());
	}

	const { data: history, isLoading: historyLoading } =
		useChatMessages(activeChatId);
	const readyToRenderChat = !activeChatId || (!historyLoading && !!history);
	const initialMessages = history?.messages as ComponentProps<
		typeof ChatWindow
	>["initialMessages"];

	return (
		<>
			<ChatLeftSidebar
				agentId={id}
				agentName={agentName}
				activeChatId={currentChatId}
				onSelectChat={openChat}
			/>

			<SidebarInset className="min-h-0 min-w-0 overflow-hidden">
				{/* Top bar */}
				<header className="flex h-14 shrink-0 items-center gap-2 border-b px-3 sm:px-4">
					<SidebarTrigger className="h-8 w-8" />
					<Separator
						orientation="vertical"
						className="mr-1 data-[orientation=vertical]:h-4"
					/>
					<span className="truncate text-sm font-medium text-muted-foreground">
						{currentChatId ? "Chat" : "New chat"}
					</span>

					<Button
						variant="ghost"
						size="icon"
						className="ml-auto h-8 w-8"
						onClick={rightPanel.toggle}
						aria-label="Toggle integrations panel">
						<PanelRightClose className="h-4 w-4" />
					</Button>
				</header>

				{/* Chat area: centered column that fills the remaining height */}
				<div className="min-h-0 flex-1">
					<div className="mx-auto flex h-full w-full max-w-6xl flex-col px-3 sm:px-4">
						{readyToRenderChat ? (
							<ChatWindow
								key={windowKey}
								agentId={id}
								chatId={activeChatId}
								initialMessages={initialMessages}
								onChatCreated={(newId) => {
									setLiveChatId(newId); // highlight in sidebar, no remount
									invalidateChats(id); // new chat appears in the sidebar list
								}}
								onConversationFinished={async () => {
									await queryClient.invalidateQueries({ queryKey: billingKey });
									await queryClient.refetchQueries({ queryKey: billingKey });
								}}
								onInsufficientCredits={() => setShowUpgrade(true)}
							/>
						) : (
							<div className="flex h-full items-center justify-center">
								<Spinner />
							</div>
						)}
					</div>
				</div>
			</SidebarInset>

			<ChatRightSidebar
				open={rightPanel.open}
				onOpenChange={rightPanel.setOpen}
			/>

			<UpgradeDialog
				open={showUpgrade}
				onOpenChange={setShowUpgrade}
				reason="credits"
			/>
		</>
	);
};