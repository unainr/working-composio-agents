"use client";

import Link from "next/link";
import { ArrowLeft, Bot, CreditCard, LayoutDashboard, MessageSquare, Plus, Settings, Sparkles } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChatHistoryList } from "@/components/ChatHistoryList";
import { SignInButtonClerk } from "@/components/clerk-sign-button/Sign-in-button";
import { ThemeSwitcher } from "@/components/theme/mode-toggle";
import { useBilling } from "@/hooks/use-billing";
import { cn } from "@/lib/utils";

interface Props {
  agentId: string;
  agentName: string;
  activeChatId: string | null;
  onSelectChat: (chatId: string | null) => void;
 
}

export function ChatLeftSidebar({
  agentId,
  agentName,
  activeChatId,
  onSelectChat,
 
}: Props) {
  const { data: billing } = useBilling();

const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  return (
    <Sidebar collapsible="offcanvas" className="border-r">
      {/* Header */}
      <SidebarHeader className="h-14 justify-center border-b px-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-8 ring-2 ring-primary/20">
            <AvatarFallback className="bg-primary text-[11px] font-semibold text-primary-foreground">
              {agentName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 leading-tight flex-1">
            <p className="truncate text-sm font-semibold">{agentName}</p>
            <p className="text-[11px] text-muted-foreground">AI Agent</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
      
        <SidebarSeparator className="mx-0 my-2" />

        {/* Navigation links */}
        <SidebarGroup className="pb-0">
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider">
            Navigate
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Link href="/">
                    <LayoutDashboard className="size-4" />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Link href="/agent">
                    <Bot className="size-4" />
                    <span>My Agents</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Link href="/pricing">
                    <CreditCard className="size-4" />
                    <span>Buy Credits</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="mx-0 my-2" />

        {/* Recent chats */}
        <SidebarGroup className="pt-0 flex-1 min-h-0">
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider">
            Recents
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <ChatHistoryList
              agentId={agentId}
              activeChatId={activeChatId}
              onSelect={onSelectChat}
            />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
     <SidebarFooter className="gap-2 overflow-hidden border-t p-3">
        <SignInButtonClerk variant="sidebar" collapsed={isCollapsed} />

        {!isCollapsed && (
          <div className="flex items-center justify-between gap-2 rounded-xl px-2 py-1">
            <span className="text-xs font-medium text-muted-foreground">
              Theme
            </span>
            <ThemeSwitcher />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}