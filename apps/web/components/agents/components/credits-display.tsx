"use client";

import { useBilling } from "@/hooks/use-billing";
import { CreditCard, Bot, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  variant?: "navbar" | "sidebar";
  collapsed?: boolean; // only used when variant="sidebar"
  className?: string;
};

export function CreditsDisplay({
  variant = "navbar",
  collapsed = false,
  className,
}: Props) {
  const { data: billing, isLoading } = useBilling();
  const isSidebar = variant === "sidebar";
  const tipSide = isSidebar ? "right" : "bottom";

  if (isLoading) {
    return (
      <div
        className={cn(
          "animate-pulse rounded-full bg-muted",
          isSidebar ? (collapsed ? "h-14 w-8" : "h-9 w-full") : "h-8 w-48",
          className,
        )}
      />
    );
  }

  if (!billing) return null;

  const agentsRemaining = billing.agents.max - billing.agents.current;
  const agentLimitReached = agentsRemaining <= 0;
  const agentLimitLow = agentsRemaining === 1;

  const creditsLow = billing.credits > 0 && billing.credits <= 20;
  const creditsEmpty = billing.credits <= 0;

  const creditsTip = creditsEmpty
    ? "No credits left — buy more to continue"
    : creditsLow
      ? `Only ${billing.credits} credits left — buy more soon`
      : `${billing.credits} credits remaining`;

  const agentsTip = agentLimitReached
    ? "Agent limit reached — buy credits to create more"
    : `${agentsRemaining} agent slot${agentsRemaining === 1 ? "" : "s"} remaining`;

  const creditsIconClass = creditsEmpty
    ? "text-destructive"
    : creditsLow
      ? "text-amber-500"
      : "text-muted-foreground";

  const agentsTextClass = agentLimitReached
    ? "text-destructive font-medium"
    : agentLimitLow
      ? "text-amber-600 dark:text-amber-400"
      : "text-muted-foreground";

  const AgentIcon = agentLimitReached ? AlertTriangle : Bot;
  const agentIconClass = agentLimitReached
    ? "text-destructive"
    : agentLimitLow
      ? "text-amber-500"
      : "text-muted-foreground";

  /* ---------- SIDEBAR COLLAPSED: tiny vertical pill ---------- */
  if (isSidebar && collapsed) {
    return (
      <div
        className={cn(
          "flex w-8 flex-col items-center gap-1.5 rounded-full border bg-background/60 py-2 shadow-sm",
          className,
        )}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex cursor-default flex-col items-center gap-0.5">
              <CreditCard className={cn("size-3.5 shrink-0", creditsIconClass)} />
              <span
                className={cn(
                  "text-[10px] font-medium tabular-nums leading-none",
                  creditsEmpty && "text-destructive",
                )}
              >
                {billing.credits}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">{creditsTip}</TooltipContent>
        </Tooltip>

        <div className="h-px w-4 bg-border" />

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex cursor-default flex-col items-center gap-0.5">
              <AgentIcon className={cn("size-3.5 shrink-0", agentIconClass)} />
              <span
                className={cn(
                  "text-[10px] tabular-nums leading-none",
                  agentsTextClass,
                )}
              >
                {billing.agents.current}/{billing.agents.max}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">{agentsTip}</TooltipContent>
        </Tooltip>
      </div>
    );
  }

  /* ---------- NAVBAR + SIDEBAR EXPANDED: horizontal pill ---------- */
  return (
    <div
      className={cn(
        "flex min-w-0 items-center rounded-full border bg-background/60 text-sm shadow-sm backdrop-blur-sm",
        isSidebar && "w-full",
        className,
      )}
    >
      {/* Credits */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "flex min-w-0 cursor-default items-center gap-2 rounded-l-full px-3 py-1.5",
              isSidebar && "flex-1",
            )}
          >
            <CreditCard className={cn("size-3.5 shrink-0", creditsIconClass)} />
            <span
              className={cn(
                "truncate whitespace-nowrap font-medium tabular-nums",
                creditsEmpty && "text-destructive",
              )}
            >
              {billing.credits} credits
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side={tipSide}>{creditsTip}</TooltipContent>
      </Tooltip>

      <div className="h-4 w-px shrink-0 bg-border" />

      {/* Agents */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex shrink-0 cursor-default items-center gap-1.5 rounded-r-full py-1.5 pl-3 pr-3.5">
            <AgentIcon className={cn("size-3.5 shrink-0", agentIconClass)} />
            <span className={cn("whitespace-nowrap tabular-nums", agentsTextClass)}>
              {billing.agents.current}/{billing.agents.max}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side={tipSide}>{agentsTip}</TooltipContent>
      </Tooltip>
    </div>
  );
}