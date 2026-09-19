"use client";

import Link from "next/link";
import { ArrowLeft, Plus, Settings } from "lucide-react";

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
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChatHistoryList } from "@/components/ChatHistoryList";
import { SignInButtonClerk } from "@/components/clerk-sign-button/Sign-in-button";
import { ThemeSwitcher } from "@/components/theme/mode-toggle";

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
  return (
    <Sidebar collapsible="offcanvas" className="border-r">
      {/* Header: agent identity (h-14 lines up with the main top bar) */}
      <SidebarHeader className="h-14 justify-center border-b px-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-8 ring-2 ring-primary/20">
            <AvatarFallback className="bg-primary text-[11px] font-semibold text-primary-foreground">
              {agentName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold">{agentName}</p>
            <p className="text-[11px] text-muted-foreground">AI Agent</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Navigation + New chat */}
        <SidebarGroup className="gap-2 pb-0">
          <SidebarGroupContent className="space-y-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Link href="/">
                    <ArrowLeft className="size-4" />
                    <span>Back to home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

           
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="mx-0 my-2" />

        {/* Recent chats */}
        <SidebarGroup className="pt-0">
          <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider">
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

      {/* Footer: settings, theme, account */}
      <SidebarFooter className="gap-2 border-t p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="text-muted-foreground hover:text-foreground">
              <Settings className="size-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="flex items-center justify-between gap-2 rounded-lg border bg-background/40 p-2">
          <SignInButtonClerk />
          <ThemeSwitcher />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}