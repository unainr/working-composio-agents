"use client";

import * as React from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { cn } from "@/lib/utils";

/* ── types ───────────────────────────────────────────────────── */

export interface ScrollOverHeroProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  media?: React.ReactNode;
  scrollLength?: string;
  className?: string;
}

/* ── helpers ─────────────────────────────────────────────────── */

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

const TITLE_PT = 96;
const PEEK_GAP = 24;
const MIN_PEEK = 120;

/* ── pieces ──────────────────────────────────────────────────── */

function TitleStack({
  eyebrow,
  title,
  description,
  actions,
}: Pick<ScrollOverHeroProps, "eyebrow" | "title" | "description" | "actions">) {
  return (
    <div className="flex flex-col items-center px-6 text-center">
      {eyebrow && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-5"
        >
          {eyebrow}
        </motion.div>
      )}

      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.05 }}
        className="mx-auto max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl "
      >
        {title}
      </motion.h1>

      {description && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-5 max-w-xl text-balance text-base text-muted-foreground md:mt-6 md:text-lg"
        >
          {description}
        </motion.p>
      )}

      {actions && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          {actions}
        </motion.div>
      )}
    </div>
  );
}

function MediaFrame({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative w-full">
      {/* Ambient glow behind the frame — gives it lift instead of sitting flat
          on the page. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem]  blur-2xl"
      />

      <div className="group relative w-full overflow-hidden rounded-2xl border border-border/60 bg-card shadow-[0_60px_140px_-40px_rgba(0,0,0,0.55)] ring-1 ring-border/40 transition-shadow duration-500">
        {/* Top inner highlight — the subtle "glass edge" premium apps use */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px "
        />

        {children ? (
          <div className="w-full [&>img]:block [&>img]:h-auto [&>img]:w-full [&>img]:object-contain [&>video]:block [&>video]:h-auto [&>video]:w-full [&>video]:object-contain">
            {children}
          </div>
        ) : (
          <div className="flex aspect-video w-full items-center justify-center bg-muted">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
              Replace media
            </span>
          </div>
        )}

        {/* Soft vignette so edges of the screenshot recede rather than end
            on a hard border. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 rounded-2xl shadow-[inset_0_0_60px_rgba(0,0,0,0.25)]"
        />
      </div>
    </div>
  );
}

/* ── component ───────────────────────────────────────────────── */

export function ScrollOverHero({
  eyebrow,
  title,
  description,
  actions,
  media,
  scrollLength = "220vh",
  className,
}: ScrollOverHeroProps) {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = React.useRef<HTMLElement>(null);
  const titleRef = React.useRef<HTMLDivElement>(null);

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
      const denom = rect.height || 1;
      scrollYProgress.set(Math.min(1, Math.max(0, -rect.top / denom)));
    };
    const onScroll = () => {
      if (!raf) raf = win.requestAnimationFrame(update);
    };
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
  const titleScale = useTransform(scrollYProgress, [0, 0.35], [1, 0.92]);
  const titleY = useTransform(scrollYProgress, [0, 0.35], [0, -48]);
  const mediaY = useTransform(
    scrollYProgress,
    [0, 0.5],
    [`${state.peek}px`, "0px"],
  );
  const mediaScale = useTransform(scrollYProgress, [0, 0.5], [0.95, 1]);
  const mediaRotateX = useTransform(scrollYProgress, [0, 0.5], [4, 0]);

  return (
    <section
      ref={sectionRef}
      aria-label="Hero"
      className={cn("relative w-full", className)}
      style={state.mode === "overlap" ? { height: scrollLength } : undefined}
    >
      {state.mode === "overlap" ? (
        <div className="sticky top-0 h-screen overflow-hidden ">
          <motion.div
            style={{ opacity: titleOpacity, scale: titleScale, y: titleY }}
            className="absolute inset-x-0 top-0 z-0 pt-24"
          >
            <div ref={titleRef}>
              <TitleStack
                eyebrow={eyebrow}
                title={title}
                description={description}
                actions={actions}
              />
            </div>
          </motion.div>

          <motion.div
            style={{
              y: mediaY,
              scale: mediaScale,
              rotateX: mediaRotateX,
              transformPerspective: 1200,
            }}
            className="absolute inset-x-0 top-0 z-10 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:max-w-6xl"
          >
            <MediaFrame>{media}</MediaFrame>
          </motion.div>
        </div>
      ) : (
        <div className="py-20 md:py-28">
          <div ref={titleRef}>
            <TitleStack
              eyebrow={eyebrow}
              title={title}
              description={description}
              actions={actions}
            />
          </div>
          <div className="mx-auto mt-12 w-full max-w-5xl px-4 sm:px-6 md:mt-14 lg:max-w-6xl">
            <MediaFrame>{media}</MediaFrame>
          </div>
        </div>
      )}
    </section>
  );
}

export default ScrollOverHero;