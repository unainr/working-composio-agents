"use client";


import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatSummary, useChats, useDeleteChat } from "@/hooks/use-chat";

interface ChatHistoryListProps {
  agentId: string;
  activeChatId: string | null;
  onSelect: (chatId: string | null) => void; // null = start a new chat
}

export function ChatHistoryList({ agentId, activeChatId, onSelect }: ChatHistoryListProps) {
  const { data, isLoading } = useChats(agentId);
  const deleteChat = useDeleteChat();

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b">
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-1.5 justify-start"
          onClick={() => onSelect(null)}
        >
          <Plus className="h-3.5 w-3.5" />
          New chat
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {isLoading && (
          <div className="p-3 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 rounded-md bg-muted animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && !data?.chats.length && (
          <p className="text-xs text-muted-foreground text-center py-8 px-4">
            No previous chats with this agent yet.
          </p>
        )}

        <div className="p-2 space-y-1">
          {data?.chats.map((chat) => (
            <ChatHistoryItem
              key={chat.id}
              chat={chat}
              isActive={chat.id === activeChatId}
              onSelect={() => onSelect(chat.id)}
              onDelete={() => deleteChat.mutate(chat.id)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function ChatHistoryItem({
  chat,
  isActive,
  onSelect,
  onDelete,
}: {
  chat: ChatSummary;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-md px-2.5 py-2 text-sm cursor-pointer",
        isActive ? "bg-muted" : "hover:bg-muted/60"
      )}
      onClick={onSelect}
    >
      <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="flex-1 min-w-0 truncate">
        {new Date(chat.updatedAt).toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive shrink-0"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}