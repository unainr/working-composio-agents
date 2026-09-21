import { Sparkles, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AgentList } from "@/components/agents/components/AgentList";
import { CreateAgentDialog } from "@/components/agents/components/agents-form";

/**
 * /agent
 *
 * Lists all of the user's agents as cards. Each card's chat trigger opens
 * an AgentChatWidget popover — there's no separate chat pane on this page.
 */
export default function AgentPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Ambient background — soft glow + faint grid, confined to the hero */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96">
        <div className="absolute left-1/2 -top-30 h-96 w-180 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-b from-transparent to-background" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-16">
        {/* Hero header */}
        <div className="mb-12 flex flex-col items-start gap-6 text-left sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">
                Your workspace
              </span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Your AI Agents
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              Create agents and chat with them to send emails, manage tasks,
              and automate your workflow.
            </p>
          </div>
    <CreateAgentDialog />

        </div>

        {/* Section divider */}
        <div className="mb-6 flex items-center gap-3">
          <h2 className="text-sm font-semibold text-foreground">
            All agents
          </h2>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Agent grid */}
        <AgentList />
      </div>
    </div>
  );
}