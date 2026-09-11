"use client";

import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Bot, Sparkles } from "lucide-react";
import { AgentChatSheet } from "./AgentChatSheet";
import { useAgentsGet } from "../hooks/use-agents-hook";
import { cn } from "@/lib/utils";

export function AgentList() {
  const { data: agents, isLoading, isError } = useAgentsGet();

  if (isLoading) return <AgentListSkeleton />;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-12 text-center">
        <p className="text-sm text-destructive">Couldn't load agents.</p>
        <p className="text-xs text-muted-foreground">Try refreshing the page.</p>
      </div>
    );
  }

  if (!agents?.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-12 text-center">
        <Sparkles className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No agents yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}

function AgentCard({ agent }: { agent: any }) {
  return (
    <Card
      className={cn(
        "group relative flex flex-col overflow-hidden border-border/60",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/30"
      )}
    >
      {/* Subtle gradient accent on hover */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-primary/6 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

      <CardHeader className="flex-row items-start gap-3 space-y-0 relative">
        <AgentAvatar name={agent.name} avatarUrl={agent.avatarUrl} />

        <div className="min-w-0 flex-1">
          <CardTitle className="text-base truncate">{agent.name}</CardTitle>
          {agent.description ? (
            <CardDescription className="line-clamp-2 mt-0.5">
              {agent.description}
            </CardDescription>
          ) : (
            <CardDescription className="mt-0.5 italic text-muted-foreground/70">
              No description
            </CardDescription>
          )}
        </div>
      </CardHeader>

      <CardContent className="mt-auto pt-2 relative">
        <AgentChatSheet agentId={agent.id} agentName={agent.name} />
      </CardContent>
    </Card>
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
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-1 ring-border">
        <img
          src={avatarUrl}
          alt={name}
        
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-primary/10">
      <Bot className="h-5 w-5" />
    </div>
  );
}

function AgentListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border p-4 space-y-3 animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-2/3 rounded bg-muted" />
              <div className="h-3 w-full rounded bg-muted" />
            </div>
          </div>
          <div className="h-8 w-full rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}