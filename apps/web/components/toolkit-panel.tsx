"use client";

import { useState } from "react";
import { AlertCircle, Loader2, Plus } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useToolkits,
  useConnectToolkit,
  useDisconnectToolkit,
  type Toolkit,
} from "@/hooks/use-agent";

// ─── Root panel ───────────────────────────────────────────────────────────────

export function ToolkitPanel() {
  const { data, isLoading, isError } = useToolkits();

  if (isLoading) return <ToolkitSkeleton />;

  if (isError)
    return (
      <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-destructive">
        <AlertCircle className="mt-0.5 size-4 shrink-0" />
        <div className="space-y-0.5">
          <p className="text-sm font-medium">Failed to load apps.</p>
          <p className="text-xs text-destructive/80">
            Please refresh the page and try again.
          </p>
        </div>
      </div>
    );

  // display-only counts for the badge
  const total = data?.toolkits.length ?? 0;
  const connectedCount = data?.toolkits.filter((t) => t.isConnected).length ?? 0;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3 px-1">
        <div className="space-y-0.5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Connected Apps
          </h2>
          <p className="text-xs text-muted-foreground/70">
            Give your agent access to the tools you use.
          </p>
        </div>
        <Badge
          variant="secondary"
          className="shrink-0 rounded-full px-2 tabular-nums"
        >
          {connectedCount}/{total}
        </Badge>
      </div>

      <ul className="flex flex-col gap-2">
        {data?.toolkits.map((toolkit) => (
          <ToolkitRow key={toolkit.slug} toolkit={toolkit} />
        ))}
      </ul>
    </section>
  );
}

// ─── Single row ───────────────────────────────────────────────────────────────

function ToolkitRow({ toolkit }: { toolkit: Toolkit }) {
  const connect = useConnectToolkit();
  const disconnect = useDisconnectToolkit();
  const [confirming, setConfirming] = useState(false);

  const handleConnect = () => connect.mutate(toolkit.slug);

  const handleDisconnect = () => {
    if (!toolkit.connectedAccountId) return;

    if (!confirming) {
      setConfirming(true);
      return;
    }

    disconnect.mutate(toolkit.connectedAccountId, {
      onSettled: () => setConfirming(false),
    });
  };

  const isConnecting = connect.isPending && connect.variables === toolkit.slug;

  return (
    <li
      className={cn(
        "group flex items-center gap-3 rounded-xl border bg-card p-3 shadow-sm",
        "transition-all duration-200 hover:border-foreground/15 hover:bg-accent/40 hover:shadow-md"
      )}
    >
      {/* App icon: light tile so dark logos (e.g. GitHub) stay visible in dark mode */}
      <Avatar className="size-9 shrink-0 rounded-lg bg-white p-1.5 ring-1 ring-border">
        <AvatarImage
          src={toolkit.logo}
          alt={toolkit.name}
          className="object-contain"
        />
        <AvatarFallback className="rounded-md bg-muted text-[10px] font-semibold text-muted-foreground">
          {toolkit.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* App info */}
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-sm font-medium">{toolkit.name}</p>
        <div className="mt-1 flex items-center gap-1.5">
          <span className="relative flex size-1.5">
            {toolkit.isConnected && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/60" />
            )}
            <span
              className={cn(
                "relative inline-flex size-1.5 rounded-full",
                toolkit.isConnected
                  ? "bg-emerald-500"
                  : "bg-muted-foreground/40"
              )}
            />
          </span>
          <p className="text-xs text-muted-foreground">
            {toolkit.isConnected ? "Connected" : "Not connected"}
          </p>
        </div>
      </div>

      {/* Action */}
      {toolkit.isConnected ? (
        <Button
          size="sm"
          variant={confirming ? "destructive" : "ghost"}
          onClick={handleDisconnect}
          disabled={disconnect.isPending}
          className={cn(
            "h-8 shrink-0 gap-1.5 px-3 text-xs",
            !confirming && "text-muted-foreground hover:text-destructive"
          )}
        >
          {disconnect.isPending && <Loader2 className="size-3 animate-spin" />}
          {confirming ? "Confirm?" : "Disconnect"}
        </Button>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={handleConnect}
          disabled={isConnecting}
          className="h-8 shrink-0 gap-1.5 px-3 text-xs"
        >
          {isConnecting ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Plus className="size-3" />
          )}
          Connect
        </Button>
      )}
    </li>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function ToolkitSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2 px-1">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-44" />
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl border p-3"
          >
            <Skeleton className="size-9 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}