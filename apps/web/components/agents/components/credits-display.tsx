"use client";

import { useBilling } from "@/hooks/use-billing";
import { CreditCard, Bot, Sparkles, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function CreditsDisplay() {
  const { data: billing, isLoading } = useBilling();

  if (isLoading) {
    return <div className="h-8 w-48 animate-pulse rounded-full bg-muted" />;
  }

  if (!billing) return null;

  const agentsRemaining = billing.agents.max - billing.agents.current;
  const agentLimitReached = agentsRemaining <= 0;
  const agentLimitLow = agentsRemaining === 1;

  const creditsLow = billing.credits > 0 && billing.credits <= 20;
  const creditsEmpty = billing.credits <= 0;

  return (
    <div className="flex items-center rounded-full border bg-background/60 backdrop-blur-sm shadow-sm text-sm">
      {/* Credits */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 px-3 py-1.5 cursor-default rounded-l-full">
            <CreditCard
              className={cn(
                "size-3.5 shrink-0",
                creditsEmpty
                  ? "text-destructive"
                  : creditsLow
                  ? "text-amber-500"
                  : "text-muted-foreground"
              )}
            />
            <span
              className={cn(
                "tabular-nums font-medium",
                creditsEmpty && "text-destructive"
              )}
            >
              {billing.credits} credits
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {creditsEmpty
            ? "No credits left — buy more to continue"
            : creditsLow
            ? `Only ${billing.credits} credits left — buy more soon`
            : `${billing.credits} credits remaining`}
        </TooltipContent>
      </Tooltip>

      <div className="h-4 w-px bg-border" />

      {/* Agents */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 pl-3 pr-3.5 py-1.5 rounded-r-full cursor-default">
            {agentLimitReached ? (
              <AlertTriangle className="size-3.5 text-destructive" />
            ) : (
              <Bot
                className={cn(
                  "size-3.5",
                  agentLimitLow ? "text-amber-500" : "text-muted-foreground"
                )}
              />
            )}
            <span
              className={cn(
                "tabular-nums",
                agentLimitReached
                  ? "text-destructive font-medium"
                  : agentLimitLow
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-muted-foreground"
              )}
            >
              {billing.agents.current}/{billing.agents.max}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {agentLimitReached
            ? "Agent limit reached — buy credits to create more"
            : `${agentsRemaining} agent slot${agentsRemaining === 1 ? "" : "s"} remaining`}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}