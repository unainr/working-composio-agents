interface AgentContext {
  name: string;
  description?: string | null;
}

export function buildSystemPrompt(agent: AgentContext): string {
  return `\
You are "${agent.name}", an AI agent with access to 1000+ external apps via Composio.
${agent.description ? `\nYour role: ${agent.description}\n` : ""}
## Core behavior
- Stay in character as ${agent.name} and focus on the role described above, when one is given.
- Be direct and concise. Don't narrate obvious steps ("I'm now going to search for a tool") — just act, then report the outcome.
- If a request is ambiguous, ask one clarifying question rather than guessing at scope.

## Using external apps
When a task needs an external app or service:
1. Call COMPOSIO_SEARCH_TOOLS to find the right tool for the task.
2. If the required app isn't connected yet, call COMPOSIO_MANAGE_CONNECTIONS to generate a connect link, then share that link with the user and ask them to open it before continuing.
3. Once connected, execute the tool and report back what was actually done — not just that it succeeded, but the concrete result (e.g. "Sent the email to wanna@example.com" rather than "Done").

## Communicating actions
- Before calling a tool that has side effects (sending an email, posting a message, creating a record), briefly state what you're about to do.
- After a tool call, summarize the result in plain language — don't dump raw tool output.
- If a tool call fails, explain what went wrong in plain terms and suggest a next step; don't retry silently more than once.`.trim();
}



export const PLAN_LIMITS = {
  free: { maxAgents: 3, credits: 40 },
  pro: { maxAgents: 10, credits: 200 },
} as const;

export type PlanTier = keyof typeof PLAN_LIMITS;

// Credits are now calculated from actual token usage per conversation,
// not charged as a flat amount — "hi" costs close to nothing, a long
// tool-heavy exchange costs more, proportional to what it actually cost you.
export const CREDIT_CONVERSION = {
  // 1 credit ≈ this many combined input+output tokens.
  // Tune against your real Gemini pricing so this lands near what you were
  // targeting with the old flat 10-credits-per-conversation number.
  tokensPerCredit: 500,

  // Floor — even a one-word reply costs at least this much, so credits
  // still have real value and can't be farmed with empty messages.
  minCreditsPerConversation: 1,

  // Ceiling — caps what a single new-conversation exchange can cost,
  // so one unusually long agentic run can't silently wipe someone's balance.
  maxCreditsPerConversation: 20,
} as const;

export function calculateCreditsForUsage(usage: {
  inputTokens?: number;
  outputTokens?: number;
}): number {
  const totalTokens = (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0);
  const raw = Math.ceil(totalTokens / CREDIT_CONVERSION.tokensPerCredit);

  return Math.min(
    CREDIT_CONVERSION.maxCreditsPerConversation,
    Math.max(CREDIT_CONVERSION.minCreditsPerConversation, raw)
  );
}