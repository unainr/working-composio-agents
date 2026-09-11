"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Plug } from "lucide-react";
import { ChatWindow } from "@/components/chat-window";
import { ToolkitPanel } from "@/components/toolkit-panel";

interface AgentChatSheetProps {
  agentId: string;
  agentName: string;
  agentAvatarUrl?: string | null;
}

export function AgentChatSheet({
  agentId,
  agentName,
  agentAvatarUrl,
}: AgentChatSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" className="gap-1.5 w-full">
          <MessageCircle className="h-4 w-4" />
          Chat with agent
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col gap-0"
      >
        {/* Header */}
        <SheetHeader className="border-b px-4 py-3 space-y-0">
          <SheetTitle className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8">
              <AvatarImage src={agentAvatarUrl ?? undefined} alt={agentName} />
              <AvatarFallback className="text-xs">
                {agentName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold leading-tight">
                {agentName}
              </span>
              <span className="text-xs font-normal text-muted-foreground leading-tight">
                AI Agent
              </span>
            </div>
          </SheetTitle>
        </SheetHeader>

        {/* Tabs replace the old side-by-side columns */}
        <Tabs defaultValue="chat" className="flex flex-1 min-h-0 flex-col gap-0">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
            <TabsTrigger
              value="chat"
              className="gap-1.5 rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Chat
            </TabsTrigger>
            <TabsTrigger
              value="apps"
              className="gap-1.5 rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent"
            >
              <Plug className="h-3.5 w-3.5" />
              Connected apps
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 min-h-0 mt-0">
            {open && <ChatWindow agentId={agentId} />}
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
  );
}