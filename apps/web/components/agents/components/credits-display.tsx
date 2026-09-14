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
    return (
      <div className="h-8 w-48 animate-pulse rounded-full bg-muted" />
    );
  }

  if (!billing) return null;

  const isPro = billing.plan === "pro";
  const agentsRemaining = billing.agents.max - billing.agents.current;
  const agentLimitReached = agentsRemaining <= 0;
  const agentLimitLow = agentsRemaining === 1;

  const creditsPct = Math.max(
    0,
    Math.min(100, (billing.credits / billing.maxCredits) * 100)
  );
  const creditsLow = creditsPct <= 20 && billing.credits > 0;
  const creditsEmpty = billing.credits <= 0;

  return (
    <div className="flex items-center rounded-full border bg-background/60 backdrop-blur-sm shadow-sm text-sm">
      {/* Plan */}
      <div
        className={cn(
          "flex items-center gap-1.5 pl-3 pr-3 py-1.5 rounded-l-full",
          isPro
            ? "bg-linear-to-r from-primary/15 to-primary/5 text-primary font-medium"
            : "text-muted-foreground"
        )}
      >
        {isPro && <Sparkles className="size-3.5" />}
        <span>{isPro ? "Pro" : "Free"}</span>
      </div>

      <div className="h-4 w-px bg-border" />

      {/* Credits */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 px-3 py-1.5 cursor-default">
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
              {billing.credits}
            </span>
            {/* Mini progress track */}
            <div className="h-1 w-10 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  creditsEmpty
                    ? "bg-destructive"
                    : creditsLow
                    ? "bg-amber-500"
                    : "bg-primary"
                )}
                style={{ width: `${creditsPct}%` }}
              />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {billing.credits} of {billing.maxCredits} conversation credits left
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
            ? "Agent limit reached — upgrade to create more"
            : `${agentsRemaining} agent${agentsRemaining === 1 ? "" : "s"} remaining`}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}