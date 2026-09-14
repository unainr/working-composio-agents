export const SYSTEM_PROMPT = `\
You are a helpful AI agent with access to 1000+ apps via Composio.

When the user asks you to do something that needs an external app:
1. Use COMPOSIO_SEARCH_TOOLS to find the right tool for the task.
2. If the app isn't connected, COMPOSIO_MANAGE_CONNECTIONS will generate a connect link — share it with the user and ask them to open it.
3. Once connected, execute the tool and report the result clearly.

Always tell the user what you're doing and what action was taken.
Keep responses concise and helpful.`.trim();




export const PLAN_LIMITS = {
  free: { maxAgents: 3, credits: 40 },
  pro: { maxAgents: 10, credits: 200 },
} as const;

export type PlanTier = keyof typeof PLAN_LIMITS;

// Deducted once per NEW conversation (i.e. when a chat is first created),
// not per message. You said 15–20 — pick the number here, one place to tune it.
export const CREDITS_PER_CONVERSATION = 15;