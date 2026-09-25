"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  PolarAngleAxis,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  XAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bot,
  CreditCard,
  MessageSquare,
  Plus,
  Zap,
} from "lucide-react";

import { useStats } from "@/hooks/use-stats";
import { useBilling } from "@/hooks/use-billing";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Types & config                                                            */
/* -------------------------------------------------------------------------- */

type Tx = {
  id: string | number;
  amount: number;
  type?: string;
  description?: string | null;
  createdAt: string;
};

type RecentChat = {
  id: string | number;
  title?: string | null;
  updatedAt: string;
};

type TxFilter = "all" | "in" | "out";
type Range = "7" | "30";

// If your theme still uses the older shadcn format (`--chart-1: 12 76% 61%`),
// change these to `hsl(var(--chart-1))` etc.
const CHART_1 = "var(--chart-1)";
const CHART_2 = "var(--chart-2)";
const CHART_3 = "var(--chart-3)";
const CHART_4 = "var(--chart-4)";

const flowConfig = {
  added: { label: "Added", color: CHART_2 },
  used: { label: "Used", color: CHART_1 },
} satisfies ChartConfig;

const agentConfig = {
  agents: { label: "Agents", color: CHART_3 },
} satisfies ChartConfig;

const chatConfig = {
  chats: { label: "Chats", color: CHART_4 },
} satisfies ChartConfig;

const LOW_CREDITS_THRESHOLD = 20;

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const nf = new Intl.NumberFormat();

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

function lastNDays(n: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (n - 1 - i));
    return d;
  });
}

function timeAgo(value: string | Date) {
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/* -------------------------------------------------------------------------- */
/*  Small building blocks                                                     */
/* -------------------------------------------------------------------------- */

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-45 flex-col items-center justify-center gap-1 text-center">
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">{title}</p>
      {description && (
        <p className="max-w-60 text-xs text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

function CardTitleRow({
  title,
  description,
  right,
}: {
  title: string;
  description?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {description && (
          <CardDescription className="text-xs">{description}</CardDescription>
        )}
      </div>
      {right}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function StatsPage() {
  const { data: stats, isLoading } = useStats();
  const { data: billing, isLoading: billingLoading } = useBilling();

  const [range, setRange] = useState<Range>("7");
  const [txFilter, setTxFilter] = useState<TxFilter>("all");

  const transactions = useMemo(
    () => (stats?.recentTransactions ?? []) as Tx[],
    [stats]
  );
  const recentChats = useMemo(
    () => (stats?.recentChats ?? []) as RecentChat[],
    [stats]
  );

  /* ----------------------------- Credits ---------------------------------- */

  const credits = billing?.credits ?? 0;
  const creditStatus =
    credits <= 0 ? "empty" : credits <= LOW_CREDITS_THRESHOLD ? "low" : "ok";

  const statusCopy = {
    ok: { text: "You're all set", dot: "bg-emerald-500" },
    low: { text: "Running low — top up to keep chatting", dot: "bg-amber-500" },
    empty: {
      text: "You're out of credits — buy more to keep chatting",
      dot: "bg-red-500",
    },
  }[creditStatus];

  const totals = useMemo(() => {
    let added = 0;
    let used = 0;
    for (const tx of transactions) {
      if (tx.amount > 0) added += tx.amount;
      else used += Math.abs(tx.amount);
    }
    return { added, used };
  }, [transactions]);

  /* --------------------------- Credit flow chart -------------------------- */

  const flowData = useMemo(() => {
    const days = lastNDays(Number(range));
    const rows = new Map(
      days.map((d) => [
        dayKey(d),
        {
          label: d.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          }),
          added: 0,
          used: 0,
        },
      ])
    );
    for (const tx of transactions) {
      const row = rows.get(dayKey(new Date(tx.createdAt)));
      if (!row) continue;
      if (tx.amount > 0) row.added += tx.amount;
      else row.used += Math.abs(tx.amount);
    }
    return Array.from(rows.values());
  }, [transactions, range]);

  const hasFlow = flowData.some((d) => d.added || d.used);

  /* ----------------------------- Agents gauge ----------------------------- */

  const agentsTotal = stats?.agents.total ?? 0;
  const agentsMax = stats?.agents.max ?? 0;
  const agentUsagePct =
    agentsMax > 0 ? Math.min(100, Math.round((agentsTotal / agentsMax) * 100)) : 0;
  const agentsLeft = Math.max(0, agentsMax - agentsTotal);

  /* ---------------------------- Chat activity ----------------------------- */

  const chatData = useMemo(() => {
    const days = lastNDays(7);
    const rows = new Map(
      days.map((d) => [
        dayKey(d),
        {
          label: d.toLocaleDateString(undefined, { weekday: "short" }),
          chats: 0,
        },
      ])
    );
    for (const chat of recentChats) {
      const row = rows.get(dayKey(new Date(chat.updatedAt)));
      if (row) row.chats += 1;
    }
    return Array.from(rows.values());
  }, [recentChats]);

  const hasChatActivity = chatData.some((d) => d.chats > 0);

  /* ------------------------------ Filtering ------------------------------- */

  const filteredTx = transactions
    .filter((tx) =>
      txFilter === "all" ? true : txFilter === "in" ? tx.amount > 0 : tx.amount < 0
    )
    .slice(0, 8);

  /* ------------------------------------------------------------------------ */

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Your credits, agents and conversations at a glance.
          </p>
        </div>
        <Button asChild>
          <Link href="/agent">
            <Bot className="mr-2 h-4 w-4" />
            My agents
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        {/* ------------------------- Balance (hero) ------------------------- */}
        <Card className="flex flex-col justify-between border-transparent bg-primary text-primary-foreground shadow-md lg:col-span-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-sm text-primary-foreground/70">
                Available credits
              </CardDescription>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/10">
                <Zap className="h-4 w-4" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-3">
              {billingLoading ? (
                <Skeleton className="h-14 w-32 bg-primary-foreground/20" />
              ) : (
                <p className="text-6xl font-semibold tabular-nums tracking-tight">
                  {nf.format(credits)}
                </p>
              )}
              <div className="flex items-center gap-2 text-sm text-primary-foreground/80">
                <span
                  className={cn("h-2 w-2 shrink-0 rounded-full", statusCopy.dot)}
                />
                <span>{statusCopy.text}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-primary-foreground/15 pt-4">
              <div>
                <p className="flex items-center gap-1 text-xs text-primary-foreground/70">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  Added recently
                </p>
                <p className="mt-1 text-xl font-semibold tabular-nums">
                  {isLoading ? "–" : `+${nf.format(totals.added)}`}
                </p>
              </div>
              <div>
                <p className="flex items-center gap-1 text-xs text-primary-foreground/70">
                  <ArrowDownRight className="h-3.5 w-3.5" />
                  Used recently
                </p>
                <p className="mt-1 text-xl font-semibold tabular-nums">
                  {isLoading ? "–" : `−${nf.format(totals.used)}`}
                </p>
              </div>
            </div>

            <Button asChild variant="secondary" className="w-full">
              <Link href="/pricing">
                <Plus className="mr-2 h-4 w-4" />
                Buy credits
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* ------------------------- Credit flow chart ---------------------- */}
        <Card className="lg:col-span-8">
          <CardHeader>
            <CardTitleRow
              title="Credit activity"
              description="Credits added and used each day"
              right={
                <Tabs value={range} onValueChange={(v) => setRange(v as Range)}>
                  <TabsList className="h-8">
                    <TabsTrigger value="7" className="px-3 text-xs">
                      7 days
                    </TabsTrigger>
                    <TabsTrigger value="30" className="px-3 text-xs">
                      30 days
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              }
            />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-65 w-full" />
            ) : !hasFlow ? (
              <EmptyState
                icon={CreditCard}
                title="No credit activity in this period"
                description="Credits you add or spend will show up here."
              />
            ) : (
              <ChartContainer config={flowConfig} className="h-65 w-full">
                <AreaChart data={flowData} margin={{ left: 4, right: 4, top: 8 }}>
                  <defs>
                    <linearGradient id="fillAdded" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-added)"
                        stopOpacity={0.5}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-added)"
                        stopOpacity={0.03}
                      />
                    </linearGradient>
                    <linearGradient id="fillUsed" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-used)"
                        stopOpacity={0.5}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-used)"
                        stopOpacity={0.03}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={24}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Area
                    dataKey="added"
                    type="monotone"
                    fill="url(#fillAdded)"
                    stroke="var(--color-added)"
                    strokeWidth={2}
                  />
                  <Area
                    dataKey="used"
                    type="monotone"
                    fill="url(#fillUsed)"
                    stroke="var(--color-used)"
                    strokeWidth={2}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* ------------------------- Agents gauge --------------------------- */}
        <Card className="lg:col-span-4">
          <CardHeader className="pb-0">
            <CardTitleRow
              title="Agents"
              description="How many of your agent slots are in use"
            />
          </CardHeader>
          <CardContent className="flex flex-col items-center pb-6">
            {isLoading ? (
              <Skeleton className="my-4 h-50 w-50 rounded-full" />
            ) : (
              <ChartContainer
                config={agentConfig}
                className="mx-auto aspect-square h-55"
              >
                <RadialBarChart
                  data={[
                    { name: "agents", value: agentUsagePct, fill: "var(--color-agents)" },
                  ]}
                  startAngle={90}
                  endAngle={-270}
                  innerRadius={72}
                  outerRadius={100}
                >
                  <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    tick={false}
                    angleAxisId={0}
                  />
                  <RadialBar
                    dataKey="value"
                    background
                    cornerRadius={12}
                    angleAxisId={0}
                  />
                  <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          const cx = viewBox.cx ?? 0;
                          const cy = viewBox.cy ?? 0;
                          return (
                            <text
                              x={cx}
                              y={cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={cx}
                                y={cy - 4}
                                className="fill-foreground text-3xl font-semibold"
                              >
                                {agentsTotal}
                                <tspan className="fill-muted-foreground text-base font-normal">
                                  {" "}
                                  / {agentsMax}
                                </tspan>
                              </tspan>
                              <tspan
                                x={cx}
                                y={cy + 20}
                                className="fill-muted-foreground text-xs"
                              >
                                agents created
                              </tspan>
                            </text>
                          );
                        }
                        return null;
                      }}
                    />
                  </PolarRadiusAxis>
                </RadialBarChart>
              </ChartContainer>
            )}
            <p className="text-center text-xs text-muted-foreground">
              {isLoading
                ? " "
                : agentsLeft > 0
                ? `${agentsLeft} ${agentsLeft === 1 ? "slot" : "slots"} left`
                : "You've used all your agent slots"}
            </p>
          </CardContent>
        </Card>

        {/* ------------------------- Chat activity -------------------------- */}
        <Card className="lg:col-span-8">
          <CardHeader>
            <CardTitleRow
              title="Conversations"
              description="Your chat activity over the past 7 days"
              right={
                <div className="text-right">
                  {isLoading ? (
                    <Skeleton className="ml-auto h-7 w-14" />
                  ) : (
                    <p className="text-2xl font-semibold tabular-nums leading-none">
                      {nf.format(stats?.chats.total ?? 0)}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    total all time
                  </p>
                </div>
              }
            />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-50 w-full" />
            ) : !hasChatActivity ? (
              <EmptyState
                icon={MessageSquare}
                title="No chats this week"
                description="Start a conversation with one of your agents."
                action={
                  <Button asChild size="sm" variant="outline">
                    <Link href="/agents">Start chatting</Link>
                  </Button>
                }
              />
            ) : (
              <ChartContainer config={chatConfig} className="h-50 w-full">
                <BarChart data={chatData} margin={{ left: 4, right: 4, top: 8 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip
                    cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar dataKey="chats" fill="var(--color-chats)" radius={8} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* ------------------------- Transactions --------------------------- */}
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitleRow
              title="Recent transactions"
              description="Your latest credit purchases and usage"
              right={
                <Tabs
                  value={txFilter}
                  onValueChange={(v) => setTxFilter(v as TxFilter)}
                >
                  <TabsList className="h-8">
                    <TabsTrigger value="all" className="px-3 text-xs">
                      All
                    </TabsTrigger>
                    <TabsTrigger value="in" className="px-3 text-xs">
                      Added
                    </TabsTrigger>
                    <TabsTrigger value="out" className="px-3 text-xs">
                      Used
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              }
            />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredTx.length === 0 ? (
              <EmptyState
                icon={CreditCard}
                title="No transactions yet"
                description="Buy credits to get started."
                action={
                  <Button asChild size="sm" variant="outline">
                    <Link href="/pricing">Buy credits</Link>
                  </Button>
                }
              />
            ) : (
              <ul className="divide-y">
                {filteredTx.map((tx) => {
                  const positive = tx.amount > 0;
                  return (
                    <li
                      key={tx.id}
                      className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                          positive
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {positive ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {tx.description ?? tx.type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 text-sm font-semibold tabular-nums",
                          positive
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-muted-foreground"
                        )}
                      >
                        {positive ? "+" : ""}
                        {nf.format(tx.amount)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* ------------------------- Recent chats --------------------------- */}
        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitleRow
              title="Recent chats"
              description="Pick up where you left off"
            />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentChats.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No conversations yet"
                description="Your chats will appear here."
                action={
                  <Button asChild size="sm" variant="outline">
                    <Link href="/agents">Start chatting</Link>
                  </Button>
                }
              />
            ) : (
              <ul className="space-y-1">
                {recentChats.slice(0, 6).map((chat) => (
                  <li key={chat.id}>
                    <Link
                      href={`/chat/${chat.id}`}
                      className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {chat.title ?? "Conversation"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {timeAgo(chat.updatedAt)}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}