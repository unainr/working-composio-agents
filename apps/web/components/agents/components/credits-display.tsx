
"use client";

import { useBilling } from "@/hooks/use-billing";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Bot, AlertTriangle } from "lucide-react";

export function CreditsDisplay() {
  const { data: billing, isLoading } = useBilling();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-7 w-16 animate-pulse rounded-full bg-muted" />
        <div className="h-7 w-16 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  if (!billing) {
    return null;
  }

  const agentsRemaining =
    billing.agents.max - billing.agents.current;

  const agentLimitReached = agentsRemaining <= 0;

  const agentLimitWarning = agentsRemaining === 1;

  return (
    <div className="flex items-center gap-2">
      {/* Plan */}
      <Badge
        variant={billing.plan === "pro" ? "default" : "secondary"}
        className="h-7 rounded-full px-3"
      >
        {billing.plan === "pro" ? "Pro" : "Free"}
      </Badge>

      {/* Credits */}
      <Badge
        variant="outline"
        className="h-7 gap-1.5 rounded-full px-2.5"
      >
        <CreditCard className="size-3.5" />

        <span>
          {billing.credits}/{billing.maxCredits}
        </span>
      </Badge>

      {/* Agents */}
      <Badge
        variant={
          agentLimitReached
            ? "destructive"
            : agentLimitWarning
              ? "outline"
              : "outline"
        }
        className={`h-7 gap-1.5 rounded-full px-2.5 ${
          agentLimitWarning && !agentLimitReached
            ? "border-amber-500/40 text-amber-600 dark:text-amber-400"
            : ""
        }`}
      >
        {agentLimitReached || agentLimitWarning ? (
          <AlertTriangle className="size-3.5" />
        ) : (
          <Bot className="size-3.5" />
        )}

        <span>
          {billing.agents.current}/{billing.agents.max}
        </span>
      </Badge>
    </div>
  );
}
