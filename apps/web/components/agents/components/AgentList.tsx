"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Bot, Sparkles, MessageCircle } from "lucide-react";

import { useAgentsGet } from "../hooks/use-agents-hook";
import { cn } from "@/lib/utils";
import { AgentChatWidget } from "./AgentChatSheet";
import { DeleteAgentsButton } from "./delete-agents-button";

export function AgentList() {
  const { data: agents, isLoading, isError } = useAgentsGet();

  if (isLoading) return <AgentListSkeleton />;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed py-12 text-center">
        <p className="text-sm text-destructive">Couldn't load agents.</p>
        <p className="text-xs text-muted-foreground">Try refreshing the page.</p>
      </div>
    );
  }

  if (!agents?.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed py-12 text-center">
        <Sparkles className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No agents yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {agents.map((agent) => (
         <Card
         key={agent.id}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border-border/60 py-0 gap-0",
        "transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-primary/40"
      )}
    >
      {/* Subtle gradient accent on hover */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-primary/8 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <CardHeader className="flex-row items-start gap-3.5 space-y-0 relative px-5 pt-5 pb-4">
        <AgentAvatar name={agent.name} avatarUrl={agent.avatarUrl} />

        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex items-center gap-1.5">
            <CardTitle className="text-base truncate">{agent.name}</CardTitle>
          </div>
          {agent.description ? (
            <CardDescription className="line-clamp-2 mt-1 text-xs leading-relaxed">
              {agent.description}
            </CardDescription>
          ) : (
            <CardDescription className="mt-1 italic text-xs text-muted-foreground/60">
              No description
            </CardDescription>
          )}
        </div>
          <DeleteAgentsButton agentId={agent.id} />

      </CardHeader>



      <CardContent className="relative mt-auto flex items-center justify-between border-t border-border/50 bg-muted/20 px-5 py-3.5">
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <MessageCircle className="h-3.5 w-3.5" />
          Start a chat
        </span>
        <AgentChatWidget
          agentId={agent.id}
          agentName={agent.name}
          agentAvatarUrl={agent.avatarUrl}
        />
      </CardContent>
    </Card>
      ))}
    </div>
  );
}



function AgentAvatar({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl?: string | null;
}) {
  if (avatarUrl) {
    return (
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-border/80 ring-offset-2 ring-offset-background">
        <img
          src={avatarUrl}
          alt={name}
          width={48}
          height={48}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary/20 to-primary/5 text-primary ring-2 ring-primary/10 ring-offset-2 ring-offset-background">
      <Bot className="h-5 w-5" />
    </div>
  );
}

function AgentListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl border overflow-hidden animate-pulse">
          <div className="flex items-center gap-3.5 p-5">
            <div className="h-12 w-12 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-2/3 rounded bg-muted" />
              <div className="h-3 w-full rounded bg-muted" />
            </div>
          </div>
          <div className="border-t bg-muted/10 px-5 py-3.5">
            <div className="h-4 w-24 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}