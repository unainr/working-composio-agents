"use client";

import * as React from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  AnimatePresence,
} from "motion/react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────

type MessageType = "user" | "agent" | "tool";

interface ChatMessage {
  id: number;
  type: MessageType;
  text: string;
  toolIcon?: string;
  toolId?: string;
  delay: number;
}

interface Tool {
  id: string;
  name: string;
  icon: string;
  bg: string;
  connected: boolean;
}

// ── Constants ──────────────────────────────────────────────────

const TOOLS: Tool[] = [
  { id: "gmail",    name: "Gmail",    icon: "📧", bg: "#fef2f2", connected: true  },
  { id: "notion",   name: "Notion",   icon: "📄", bg: "#f5f5f4", connected: true  },
  { id: "slack",    name: "Slack",    icon: "💬", bg: "#fffbeb", connected: true  },
  { id: "github",   name: "GitHub",   icon: "⚙️", bg: "#f0fdf4", connected: true  },
  { id: "calendar", name: "Calendar", icon: "📅", bg: "transparent", connected: false },
];

const CHAT_SEQUENCE: ChatMessage[] = [
  {
    id: 1, delay: 800,
    type: "user",
    text: "Draft follow-ups for last week's leads from Notion",
  },
  {
    id: 2, delay: 2000,
    type: "tool",
    text: "Reading Notion — Leads database",
    toolIcon: "📄",
    toolId: "notion",
  },
  {
    id: 3, delay: 3200,
    type: "tool",
    text: "Scanning Gmail — Sent folder",
    toolIcon: "📧",
    toolId: "gmail",
  },
  {
    id: 4, delay: 4600,
    type: "agent",
    text: "Found 6 leads. Drafting personalised follow-ups…",
  },
  {
    id: 5, delay: 6000,
    type: "tool",
    text: "6 drafts saved to Gmail",
    toolIcon: "✉️",
    toolId: "gmail",
  },
  {
    id: 6, delay: 7400,
    type: "agent",
    text: "Done — 6 follow-up drafts are ready. Send now or schedule for tomorrow morning?",
  },
];

const LOOP_DURATION = 11000;

// ── Scroll helpers (mirrors ScrollOverHero internals) ──────────

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

const TITLE_PT = 96;
const PEEK_GAP  = 24;
const MIN_PEEK  = 120;

// ── Sub-components ─────────────────────────────────────────────

function ToolRow({
  tool,
  active,
}: {
  tool: Tool;
  active: boolean;
}) {
  return (
    <motion.div
      animate={active ? { scale: [1, 1.03, 1] } : { scale: 1 }}
      transition={{ duration: 0.35 }}
      className={cn(
        "flex items-center gap-2 rounded-lg border px-2.5 py-2 cursor-default select-none transition-colors duration-200",
        active
          ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"
          : "border-border bg-card",
      )}
    >
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-sm"
        style={{ background: tool.bg }}
      >
        {tool.icon}
      </span>
      <span className={cn("text-[11px] font-medium", active ? "text-blue-600 dark:text-blue-400" : "text-foreground")}>
        {tool.name}
      </span>
      <span
        className={cn(
          "ml-auto h-1.5 w-1.5 rounded-full transition-colors duration-300",
          tool.connected ? "bg-emerald-500" : "bg-border",
        )}
      />
    </motion.div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </div>
  );
}

function ChatBubble({ msg }: { msg: ChatMessage }) {
  if (msg.type === "tool") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-1 flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
      >
        <span>{msg.toolIcon}</span>
        <span>{msg.text}</span>
      </motion.div>
    );
  }

  if (msg.type === "user") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-row-reverse items-end gap-2"
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-[9px] font-medium text-muted-foreground">
          U
        </span>
        <span className="max-w-[170px] rounded-xl bg-foreground px-3 py-2 text-[11px] leading-relaxed text-background">
          {msg.text}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-end gap-2"
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[9px] font-medium text-blue-600 dark:bg-blue-900 dark:text-blue-300">
        A
      </span>
      <span className="max-w-[190px] rounded-xl border border-border bg-card px-3 py-2 text-[11px] leading-relaxed text-foreground">
        {msg.text}
      </span>
    </motion.div>
  );
}

// ── Main canvas (the "media" slot) ────────────────────────────

function AgentCanvas() {
  const [visibleIds, setVisibleIds] = React.useState<number[]>([]);
  const [showTyping, setShowTyping] = React.useState(false);
  const [activeToolId, setActiveToolId] = React.useState<string | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const resetAndLoop = React.useCallback(() => {
    setVisibleIds([]);
    setShowTyping(false);
    setActiveToolId(null);

    CHAT_SEQUENCE.forEach((msg) => {
      // Show typing dots 800 ms before agent messages
      if (msg.type === "agent") {
        setTimeout(() => setShowTyping(true), msg.delay - 800);
      }
      setTimeout(() => {
        if (msg.type === "agent") setShowTyping(false);
        setVisibleIds((prev) => [...prev, msg.id]);
        if (msg.toolId) {
          setActiveToolId(msg.toolId);
          setTimeout(() => setActiveToolId(null), 900);
        }
      }, msg.delay);
    });
  }, []);

  React.useEffect(() => {
    resetAndLoop();
    const id = setInterval(resetAndLoop, LOOP_DURATION);
    return () => clearInterval(id);
  }, [resetAndLoop]);

  // Auto-scroll chat to bottom
  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [visibleIds, showTyping]);

  const visibleMsgs = CHAT_SEQUENCE.filter((m) => visibleIds.includes(m.id));

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-[0_40px_120px_-30px_rgba(0,0,0,0.35)] ring-1 ring-border/40">
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
        <span className="mx-auto text-[11px] text-muted-foreground">
          Agent builder — My Sales Agent
        </span>
      </div>

      <div className="flex" style={{ minHeight: 320 }}>
        {/* Tool sidebar */}
        <div className="flex w-[176px] shrink-0 flex-col gap-1.5 border-r border-border bg-muted/20 p-3">
          <p className="mb-1 px-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">
            Connected tools
          </p>
          {TOOLS.map((tool) => (
            <ToolRow
              key={tool.id}
              tool={tool}
              active={activeToolId === tool.id}
            />
          ))}
          <div className="my-1 border-t border-border" />
          <button className="flex items-center justify-center gap-1 rounded-lg border border-dashed border-border py-1.5 text-[11px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Browse 200+
          </button>
        </div>

        {/* Chat area */}
        <div className="flex flex-1 flex-col">
          <div
            ref={scrollRef}
            className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-3 py-3"
            style={{ maxHeight: 292 }}
          >
            <AnimatePresence mode="popLayout">
              {visibleMsgs.map((msg) => (
                <ChatBubble key={msg.id} msg={msg} />
              ))}
              {showTyping && (
                <motion.div
                  key="typing"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-end gap-2"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[9px] font-medium text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                    A
                  </span>
                  <div className="rounded-xl border border-border bg-card">
                    <TypingDots />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Fake input */}
          <div className="flex items-center gap-2 border-t border-border bg-muted/20 px-3 py-2.5">
            <div className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-[11px] text-muted-foreground">
              Ask your agent anything…
            </div>
            <button
              aria-label="Send message"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-foreground text-background"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M6 10V2M2 6l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Hero title / copy stack ────────────────────────────────────

function TitleStack() {
  return (
    <div className="flex flex-col items-center px-6 text-center">
      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Powered by Composio · 200+ integrations
      </div>
      <h1 className="mx-auto max-w-3xl text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
        Build AI agents that{" "}
        <span className="text-blue-600 dark:text-blue-400">actually</span>{" "}
        connect your tools
      </h1>
      <p className="mx-auto mt-5 max-w-xl text-balance text-base text-muted-foreground md:mt-6 md:text-lg">
        Create custom agents in minutes. Connect Gmail, Notion, GitHub, Slack
        and 200+ more — no code, no config headaches.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
          Create your first agent
        </button>
        <button className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-foreground ring-1 ring-border transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2.5 2l7 4-7 4V2z" fill="currentColor"/>
          </svg>
          See it in action
        </button>
      </div>
    </div>
  );
}

// ── ScrollOverHero wiring (same pattern as original) ──────────

export interface AgentPlatformHeroProps {
  scrollLength?: string;
  className?: string;
}

export function AgentPlatformHero({
  scrollLength = "220vh",
  className,
}: AgentPlatformHeroProps) {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = React.useRef<HTMLElement>(null);
  const titleRef   = React.useRef<HTMLDivElement>(null);

  const scrollYProgress = useMotionValue(0);

  const [state, setState] = React.useState<{
    mode: "stacked" | "overlap";
    peek: number;
  }>({ mode: "stacked", peek: 0 });

  useIsomorphicLayoutEffect(() => {
    if (prefersReducedMotion) {
      setState({ mode: "stacked", peek: 0 });
      return;
    }
    const win = sectionRef.current?.ownerDocument.defaultView ?? window;
    const measure = () => {
      const el = titleRef.current;
      if (!el) return;
      const titleBottom = TITLE_PT + el.offsetHeight;
      if (titleBottom > win.innerHeight - MIN_PEEK) {
        setState((s) =>
          s.mode === "stacked" ? s : { mode: "stacked", peek: 0 },
        );
      } else {
        const peek = Math.round(titleBottom + PEEK_GAP);
        setState((s) =>
          s.mode === "overlap" && s.peek === peek
            ? s
            : { mode: "overlap", peek },
        );
      }
    };
    measure();
    win.addEventListener("resize", measure);
    return () => win.removeEventListener("resize", measure);
  }, [prefersReducedMotion]);

  useIsomorphicLayoutEffect(() => {
    if (state.mode !== "overlap") return;
    const el = sectionRef.current;
    if (!el) return;
    const win = el.ownerDocument.defaultView ?? window;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      scrollYProgress.set(
        Math.min(1, Math.max(0, -rect.top / (rect.height || 1))),
      );
    };
    const onScroll = () => { if (!raf) raf = win.requestAnimationFrame(update); };
    update();
    win.addEventListener("scroll", onScroll, { passive: true });
    win.addEventListener("resize", onScroll);
    return () => {
      win.removeEventListener("scroll", onScroll);
      win.removeEventListener("resize", onScroll);
      if (raf) win.cancelAnimationFrame(raf);
    };
  }, [state.mode, scrollYProgress]);

  const titleOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const titleScale   = useTransform(scrollYProgress, [0, 0.35], [1, 0.92]);
  const titleY       = useTransform(scrollYProgress, [0, 0.35], [0, -48]);
  const mediaY       = useTransform(
    scrollYProgress,
    [0, 0.5],
    [`${state.peek}px`, "0px"],
  );
  const mediaScale   = useTransform(scrollYProgress, [0, 0.5], [0.95, 1]);

  return (
    <section
      ref={sectionRef}
      aria-label="Hero"
      className={cn("relative w-full bg-background", className)}
      style={state.mode === "overlap" ? { height: scrollLength } : undefined}
    >
      {state.mode === "overlap" ? (
        <div className="sticky top-0 h-screen overflow-hidden [mask-image:linear-gradient(to_bottom,black_82%,transparent)]">
          <motion.div
            style={{ opacity: titleOpacity, scale: titleScale, y: titleY }}
            className="absolute inset-x-0 top-0 z-0 pt-24"
          >
            <div ref={titleRef}>
              <TitleStack />
            </div>
          </motion.div>

          <motion.div
            style={{ y: mediaY, scale: mediaScale }}
            className="absolute inset-x-0 top-0 z-10 mx-auto h-full w-full max-w-5xl px-4 sm:px-6 lg:max-w-6xl"
          >
            <AgentCanvas />
          </motion.div>
        </div>
      ) : (
        <div className="py-20 md:py-28">
          <div ref={titleRef}>
            <TitleStack />
          </div>
          <div className="mx-auto mt-12 w-full max-w-5xl px-4 sm:px-6 md:mt-14 lg:max-w-6xl">
            <AgentCanvas />
          </div>
        </div>
      )}
    </section>
  );
}

export default AgentPlatformHero;