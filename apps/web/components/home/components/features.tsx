"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { SiDiscord, SiGoogledrive, SiInstagram, SiNotion } from "react-icons/si";

import { cn } from "@/lib/utils";

export interface ResearchBentoBrand {
  name: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}

export interface CreditPack {
  name: string;
  price: number;
  credits: number;
}

export interface ResearchBentoGridCopy {
  heading: React.ReactNode;
  subheading: React.ReactNode;
  showcaseTitle: React.ReactNode;
  showcaseDescription: React.ReactNode;
  pricingTitle: React.ReactNode;
  pricingDescription: React.ReactNode;
  pauseTitle: React.ReactNode;
  activeDescription: React.ReactNode;
  pausedDescription: React.ReactNode;
}

export interface ResearchBentoGridProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  currency?: string;
  locale?: string;
  creditPacks?: readonly CreditPack[];
  paused?: boolean;
  defaultPaused?: boolean;
  selectedBrand?: number;
  defaultSelectedBrand?: number;
  brands?: readonly ResearchBentoBrand[];
  copy?: Partial<ResearchBentoGridCopy>;
  autoPlay?: boolean;
  brandRotationInterval?: number;
  spotlightInterval?: number;
  userLabel?: string;
  collaboratorLabel?: string;
  onPausedChange?: (paused: boolean) => void;
  onSelectedBrandChange?: (index: number) => void;
}

const spring = { type: "spring", stiffness: 230, damping: 24 } as const;
const LIFTED_TILES = new Set([5, 14, 23, 34, 41, 53, 62, 71, 79, 88, 97, 108, 119, 131, 146, 157, 169, 184, 199, 213, 226, 241]);
const BRIGHT_TILES = new Set([17, 45, 76, 103, 138, 176, 205, 234]);
const INVOICE_BARS = [62, 44, 70, 36, 56];

// Your real Buy Credits pricing — 993a05 rust/orange accent to match the
// dashboard's Buy Credits screen.
const DEFAULT_CREDIT_PACKS: readonly CreditPack[] = [
  { name: "Starter", price: 5, credits: 100 },
  { name: "Pro", price: 15, credits: 350 },
  { name: "Power", price: 40, credits: 1000 },
];

const DEFAULT_COPY: ResearchBentoGridCopy = {
  heading: "Everything your agent needs, in one place",
  subheading: "Connect your tools, hand off the work, and top up credits whenever you need more.",
  showcaseTitle: "One agent, every tool you already use",
  showcaseDescription: "Connect Instagram, Notion, Slack, Google Drive and more. Hand your agent an image and a caption — it posts, replies, and reports back on its own.",
  pricingTitle: <>Pay for what you use.<br />No subscriptions.</>,
  pricingDescription: "Buy credits once, use them whenever your agents run. No recurring plan, no surprise renewal.",
  pauseTitle: <>Automate on your terms.<br />Pause any agent, anytime.</>,
  activeDescription: "Between campaigns? Pause an agent and pick up right where it left off when you're ready to post again.",
  pausedDescription: "This agent is paused. Resume it anytime — it remembers everything it was connected to.",
};

function ArrowCursor({
  className,
  label,
  inverted = false,
  delay = 0,
  active,
  targetLeft,
  targetTop,
}: {
  className?: string;
  label: string;
  inverted?: boolean;
  delay?: number;
  active?: boolean;
  targetLeft?: string;
  targetTop?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden
      className={cn("absolute z-30 flex flex-col items-start", className)}
      animate={reduceMotion
        ? undefined
        : active !== undefined
          ? active
            ? { x: -3, y: -36, rotate: -1.5 }
            : { x: 0, y: 0, rotate: 0 }
          : targetLeft
            ? { left: targetLeft, top: targetTop, x: 0, y: [0, -3, 0], rotate: [0, 1.5, 0] }
            : { x: 0, y: [0, -3, 0], rotate: [0, 1.5, 0] }}
      transition={active !== undefined
        ? {
            duration: active ? 0.68 : 0.82,
            ease: active ? [0.16, 1, 0.3, 1] : [0.22, 1, 0.36, 1],
          }
        : targetLeft
          ? {
              left: spring,
              top: spring,
              y: { duration: 4.6, delay, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 4.6, delay, repeat: Infinity, ease: "easeInOut" },
            }
          : { duration: 4.6, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg width="26" height="30" viewBox="0 0 26 30" fill="none" className="h-auto w-4.5 drop-shadow-md sm:w-5.5 lg:w-6.5">
        <path
          d="M2.2 2.5 22 15.1l-9.4 2.1-4.1 9.1L2.2 2.5Z"
          className={cn(
            inverted
              ? "fill-zinc-950 stroke-white dark:fill-white dark:stroke-[#080808]"
              : "fill-[#993a05] stroke-white dark:stroke-white/70",
          )}
          strokeWidth="2.1"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className={cn(
          "ml-2.5 -mt-1 px-2.5 py-1 text-[12px] font-semibold tracking-[-0.04em] sm:ml-3 sm:px-3 sm:text-[14px] lg:ml-4 lg:px-4 lg:py-1.5 lg:text-[17px]",
          inverted
            ? "rounded-full bg-[#f2f2f2] text-black shadow-[0_5px_18px_rgba(0,0,0,0.28)]"
            : cn(
                "rounded-[22px] border border-white/60 bg-[#993a05] text-white",
                active
                  ? "shadow-[0_5px_18px_rgba(0,0,0,0.24),0_0_14px_rgba(153,58,5,0.35)]"
                  : "shadow-[0_5px_18px_rgba(0,0,0,0.22)]",
              ),
        )}
      >
        {label}
      </span>
    </motion.div>
  );
}

const DEFAULT_BRANDS: readonly ResearchBentoBrand[] = [
  { name: "Instagram", icon: SiInstagram },
  { name: "Notion", icon: SiNotion },
  { name: "Google Drive", icon: SiGoogledrive },
  { name: "Discord", icon: SiDiscord },
];

function BrandMark({ brand }: { brand: ResearchBentoBrand }) {
  const Icon = brand.icon;
  return <Icon className="size-[58%]" aria-hidden />;
}

function Panel({ className, children, ...props }: React.ComponentProps<"section">) {
  const grainId = React.useId().replace(/:/g, "");

  return (
    <section
      {...props}
      className={cn(
        "relative isolate overflow-hidden rounded-[15px] border border-[#c8c8c4] bg-[#f7f7f5]",
        "shadow-[inset_0_1px_rgba(255,255,255,0.9),0_12px_32px_rgba(24,24,27,0.08)]",
        "dark:border-[#292929] dark:bg-[#080808] dark:shadow-[inset_0_1px_rgba(255,255,255,0.02),0_12px_32px_rgba(0,0,0,0.22)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.88),transparent_45%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.025),transparent_45%)]" />
      {children}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 z-50 size-full opacity-[0.07] mix-blend-multiply dark:opacity-[0.1] dark:mix-blend-soft-light"
      >
        <filter id={grainId} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" seed="11" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0.55" />
          </feComponentTransfer>
        </filter>
        <rect width="100%" height="100%" filter={`url(#${grainId})`} />
      </svg>
    </section>
  );
}

function FeatureCopy({ title, children, className }: { title: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("absolute inset-x-0 bottom-0 z-20 px-5 pb-5 sm:px-7 sm:pb-7", className)}>
      <h3 className="text-[16px] font-medium leading-[1.08] tracking-[-0.045em] text-zinc-950 sm:text-[18px] dark:text-[#f1f1f1]">{title}</h3>
      <p className="mt-2.5 max-w-82.5 text-[12px] leading-[1.35] tracking-[-0.015em] text-zinc-600 sm:mt-3 sm:text-[13px] dark:text-[#858585]">{children}</p>
    </div>
  );
}

interface DesignsPanelProps {
  brands: readonly ResearchBentoBrand[];
  selectedBrand?: number;
  defaultSelectedBrand: number;
  autoPlay: boolean;
  rotationInterval: number;
  userLabel: string;
  collaboratorLabel: string;
  title: React.ReactNode;
  description: React.ReactNode;
  onSelectedBrandChange?: (index: number) => void;
}

function DesignsPanel({
  brands,
  selectedBrand,
  defaultSelectedBrand,
  autoPlay,
  rotationInterval,
  userLabel,
  collaboratorLabel,
  title,
  description,
  onSelectedBrandChange,
}: DesignsPanelProps) {
  const [internalSelected, setInternalSelected] = React.useState(defaultSelectedBrand);
  const reduceMotion = useReducedMotion();
  const isControlled = selectedBrand !== undefined;
  const selected = Math.min(Math.max(isControlled ? selectedBrand : internalSelected, 0), brands.length - 1);
  const cursorStops = brands.map((_, index) => `${15 + (70 * index) / Math.max(brands.length - 1, 1)}%`);

  const selectBrand = React.useCallback((index: number) => {
    if (!isControlled) setInternalSelected(index);
    onSelectedBrandChange?.(index);
  }, [isControlled, onSelectedBrandChange]);

  React.useEffect(() => {
    if (!autoPlay || reduceMotion || brands.length < 2) return;
    const interval = setInterval(() => {
      const next = (selected + 1) % brands.length;
      selectBrand(next);
    }, rotationInterval);
    return () => clearInterval(interval);
  }, [autoPlay, brands.length, reduceMotion, rotationInterval, selectBrand, selected]);

  return (
    <Panel className="min-h-87.5 sm:min-h-80 @min-[840px]:col-span-12 @min-[840px]:min-h-75.5 @min-[840px]:row-span-1">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 grid h-[78%] grid-cols-28 grid-rows-9 gap-px overflow-hidden"
        style={{ maskImage: "linear-gradient(to bottom,black 0%,black 62%,transparent 100%)" }}
      >
        {Array.from({ length: 252 }, (_, index) => (
          <span
            key={index}
            className={cn(
              "border border-black/[0.035] bg-[#ededeb] dark:border-white/[0.018] dark:bg-[#0b0b0b]",
              LIFTED_TILES.has(index) && "bg-[#e4e4e1] dark:bg-[#101010]",
              BRIGHT_TILES.has(index) && "bg-[#dadad6] dark:bg-[#151515]",
            )}
          />
        ))}
      </div>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-[-8%] z-1 hidden h-[66%] w-[24%] rounded-full bg-white/[0.022] blur-[48px] dark:block"
        animate={reduceMotion ? undefined : { x: ["-120%", "520%"] }}
        transition={{ duration: 14, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut" }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[76%] bg-[radial-gradient(ellipse_at_50%_18%,transparent_12%,rgba(247,247,245,.12)_58%,#f7f7f5_100%)] dark:bg-[radial-gradient(ellipse_at_50%_18%,transparent_12%,rgba(8,8,8,.1)_58%,#080808_100%)]" />

      <div className="absolute inset-x-4 top-[9%] z-10 mx-auto flex max-w-190 items-center gap-1.5 sm:inset-x-7 sm:top-[12%] sm:gap-2.5">
        {brands.map((brand, index) => (
          <motion.button
            type="button"
            key={brand.name}
            onClick={() => selectBrand(index)}
            aria-label={`Select ${brand.name}`}
            aria-pressed={selected === index}
            className={cn(
              "relative flex aspect-square min-w-0 flex-1 items-center justify-center overflow-hidden rounded-[9px] border bg-[linear-gradient(145deg,#f2f2f0_0%,#e7e7e4_46%,#dcdcd8_100%)] shadow-[inset_0_1px_rgba(255,255,255,.9),0_12px_24px_rgba(24,24,27,.12)] sm:rounded-[10px] dark:bg-[linear-gradient(145deg,#222_0%,#1a1a1a_48%,#141414_100%)] dark:shadow-[inset_0_1px_rgba(255,255,255,.025),0_10px_22px_rgba(0,0,0,.32)]",
              selected === index
                ? "border-[#993a05]/50 text-[#993a05] shadow-[inset_0_1px_rgba(255,255,255,.8),0_12px_28px_rgba(24,24,27,.14),0_0_22px_rgba(153,58,5,.16)] dark:border-[#e06a2c]/35 dark:text-[#e06a2c] dark:shadow-[inset_0_1px_rgba(255,255,255,.025),0_10px_24px_rgba(0,0,0,.34),0_0_18px_rgba(224,106,44,.1)]"
                : "border-black/11 text-zinc-800 dark:border-white/5.5 dark:text-[#e8e8e8]",
            )}
            animate={reduceMotion ? undefined : {
              y: selected === index ? -3 : [0, index % 2 ? 1.5 : -1.5, 0],
              scale: selected === index ? 1.018 : 1,
            }}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ y: { duration: 5 + index * 0.3, delay: index * 0.2, repeat: Infinity, ease: "easeInOut" }, scale: spring }}
          >
            {selected === index && (
              <motion.span
                aria-hidden
                className="absolute inset-[12%] rounded-full bg-[#993a05]/20 blur-xl dark:bg-[#e06a2c]/[0.14]"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: [0.35, 0.7, 0.35], scale: [0.9, 1.08, 0.9] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            <motion.span
              className="relative flex size-full items-center justify-center"
              animate={{ scale: selected === index ? 1.06 : 1 }}
              transition={spring}
            >
              <BrandMark brand={brand} />
            </motion.span>
          </motion.button>
        ))}
      </div>

      <ArrowCursor
        label={userLabel}
        className="left-[35%] top-[40%]"
        targetLeft={cursorStops[selected]}
        targetTop="40%"
        delay={0.2}
      />
      <ArrowCursor label={collaboratorLabel} inverted className="left-[58%] top-[54%] sm:left-[62%] sm:top-[56%]" delay={0.9} />

      <FeatureCopy title={title}>{description}</FeatureCopy>
    </Panel>
  );
}

interface CreditPanelProps {
  creditPacks: readonly CreditPack[];
  currency: string;
  locale: string;
  autoPlay: boolean;
  title: React.ReactNode;
  description: React.ReactNode;
}

function CreditPanel({ creditPacks, currency, locale, autoPlay, title, description }: CreditPanelProps) {
  const reduceMotion = useReducedMotion();
  const [packIndex, setPackIndex] = React.useState(0);
  const formatPrice = React.useMemo(
    () => new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }),
    [currency, locale],
  );

  React.useEffect(() => {
    if (!autoPlay || reduceMotion || creditPacks.length < 2) return;
    const interval = setInterval(() => {
      setPackIndex((current) => (current + 1) % creditPacks.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [autoPlay, creditPacks.length, reduceMotion]);

  const pack = creditPacks[Math.min(packIndex, creditPacks.length - 1)];
  const isFeatured = pack.name.toLowerCase() === "pro";

  return (
    <Panel className="min-h-105 @container sm:min-h-90 @min-[840px]:col-span-7 @min-[840px]:min-h-75.5 @min-[840px]:row-span-1">
      <div className="pointer-events-none absolute inset-0 opacity-[0.055] dark:opacity-[0.045]" style={{ backgroundImage: "radial-gradient(circle,currentColor .65px,transparent .75px)", backgroundSize: "11px 11px" }} />
      <div className="absolute inset-x-0 top-0 h-[58%] overflow-hidden sm:inset-y-0 sm:left-auto sm:right-0 sm:h-auto sm:w-[53%]">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={pack.name}
            className="absolute left-[21%] top-5 h-56.25 w-[58%] overflow-hidden rounded-[10px] border border-black/16 bg-[linear-gradient(145deg,#f5f5f2_0%,#eaeae6_46%,#dededa_100%)] p-3.5 shadow-[inset_0_1px_rgba(255,255,255,.9),0_18px_42px_rgba(24,24,27,.14),0_3px_8px_rgba(24,24,27,.08)] sm:left-auto sm:right-4 sm:h-62.5 sm:w-[89%] dark:border-[#343434]/80 dark:bg-[linear-gradient(145deg,#1c1c1c_0%,#161616_48%,#101010_100%)] dark:shadow-[inset_0_1px_rgba(255,255,255,.02),0_16px_36px_rgba(0,0,0,.38),0_3px_8px_rgba(0,0,0,.25)] @min-[520px]:right-7 @min-[520px]:p-5"
            initial={reduceMotion ? false : { y: 270, opacity: 0, rotate: -1.25 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { y: 285, opacity: 0, rotate: 1.1 }}
            transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-start justify-between text-zinc-500 dark:text-[#a0a0a0]">
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-medium",
                  isFeatured
                    ? "bg-[#993a05]/12 text-[#993a05] dark:bg-[#e06a2c]/15 dark:text-[#e06a2c]"
                    : "bg-black/5 dark:bg-white/6",
                )}
              >
                {pack.name}
              </span>
              <span className="relative mt-0.5 size-4 rounded-full bg-zinc-500 dark:bg-[#9e9e9e]"><span className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-l-full bg-[#e7e7e3] dark:bg-[#222]" /></span>
            </div>
            <div className="mt-2 flex items-baseline gap-2 whitespace-nowrap">
              <span className="text-[26px] font-medium tracking-[-0.055em] text-[#993a05] dark:text-[#e06a2c] @min-[520px]:text-[30px]">
                {formatPrice.format(pack.price)}
              </span>
              <span className="text-[14px] text-zinc-500 @min-[520px]:text-[16px] dark:text-[#767676]">one-time</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-zinc-700 dark:text-[#c9c9c9]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="shrink-0">
                <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" className="fill-[#993a05] dark:fill-[#e06a2c]" />
              </svg>
              {pack.credits.toLocaleString()} credits
            </div>
            <div className="mt-5 space-y-2.5">
              <div className="h-1 w-[42%] rounded-full bg-black/8 dark:bg-white/[0.07]" />
              <div className="h-1 w-[27%] rounded-full bg-black/5.5 dark:bg-white/4.5" />
            </div>
            <div className="mt-4 space-y-2.5">
              {INVOICE_BARS.map((width, index) => (
                <div key={index} className="flex items-center justify-between gap-4">
                  <motion.span
                    className="h-2.5 rounded-[3px] bg-black/5.5 dark:bg-white/4.5"
                    style={{ width: `${width}%` }}
                    animate={reduceMotion ? undefined : { opacity: [0.35, 0.62, 0.35] }}
                    transition={{ duration: 3.5, delay: index * 0.28, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <span className="h-3 w-[28%] rounded-lg bg-black/8 dark:bg-white/[0.07]" />
                </div>
              ))}
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-[linear-gradient(to_bottom,transparent,rgba(222,222,218,.55)_52%,#dededa_100%)] dark:bg-[linear-gradient(to_bottom,transparent,rgba(17,17,17,.55)_52%,#111_100%)]"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[48%] bg-[linear-gradient(to_bottom,rgba(247,247,245,0)_0%,rgba(247,247,245,.12)_24%,rgba(247,247,245,.48)_58%,rgba(247,247,245,.88)_86%,#f7f7f5_100%)] dark:bg-[linear-gradient(to_bottom,rgba(8,8,8,0)_0%,rgba(8,8,8,.12)_24%,rgba(8,8,8,.48)_58%,rgba(8,8,8,.88)_86%,#080808_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[-8%] bottom-[-24%] z-10 h-[48%] rounded-[50%] bg-[#f7f7f5]/75 blur-[38px] dark:bg-[#080808]/75"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-px bg-black/4 dark:bg-white/2.5"
      />

      <FeatureCopy className="sm:right-1/2 sm:pr-3" title={title}>{description}</FeatureCopy>
    </Panel>
  );
}

interface PausePanelProps {
  paused?: boolean;
  defaultPaused: boolean;
  autoPlay: boolean;
  spotlightInterval: number;
  userLabel: string;
  title: React.ReactNode;
  activeDescription: React.ReactNode;
  pausedDescription: React.ReactNode;
  onPausedChange?: (paused: boolean) => void;
}

function PausePanel({
  paused: controlledPaused,
  defaultPaused,
  autoPlay,
  spotlightInterval,
  userLabel,
  title,
  activeDescription,
  pausedDescription,
  onPausedChange,
}: PausePanelProps) {
  const [internalPaused, setInternalPaused] = React.useState(defaultPaused);
  const [demoLit, setDemoLit] = React.useState(true);
  const reduceMotion = useReducedMotion();
  const isControlled = controlledPaused !== undefined;
  const paused = isControlled ? controlledPaused : internalPaused;
  const arrowLit = autoPlay && demoLit && !reduceMotion;

  React.useEffect(() => {
    if (!autoPlay || reduceMotion) return;

    let offTimer: ReturnType<typeof setTimeout> | undefined;
    const illuminate = () => {
      setDemoLit(true);
      offTimer = setTimeout(() => setDemoLit(false), 1500);
    };

    const firstTimer = setTimeout(() => setDemoLit(false), 1500);
    const loopTimer = setInterval(illuminate, spotlightInterval);

    return () => {
      clearTimeout(firstTimer);
      if (offTimer) clearTimeout(offTimer);
      clearInterval(loopTimer);
    };
  }, [autoPlay, reduceMotion, spotlightInterval]);

  const toggle = () => {
    const next = !paused;
    if (!isControlled) setInternalPaused(next);
    onPausedChange?.(next);
  };

  return (
    <Panel className="min-h-85 sm:min-h-80 @min-[840px]:col-span-5 @min-[840px]:min-h-75.5 @min-[840px]:row-span-1">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-multiply dark:opacity-[0.09] dark:mix-blend-screen"
        style={{
          backgroundImage: "radial-gradient(circle at 20% 30%,currentColor 0 .45px,transparent .7px),radial-gradient(circle at 70% 65%,currentColor 0 .45px,transparent .75px)",
          backgroundSize: "4px 4px,5px 5px",
        }}
      />
      <div className="absolute inset-x-0 top-0 flex h-[66%] items-center justify-center">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((ring) => (
          <motion.div
            key={ring}
            aria-hidden
            className="absolute border border-black/[0.07] dark:border-white/4"
            style={{
              width: 190 + ring * 23,
              height: 100 + ring * 16,
              borderRadius: 23 + ring * 3,
              opacity: Math.max(0.18, 0.72 - ring * 0.045),
            }}
            animate={reduceMotion ? undefined : { scale: [0.995, 1.008, 0.995] }}
            transition={{ duration: 5.2, delay: ring * 0.11, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
        <motion.button
          type="button"
          onClick={toggle}
          whileHover={{ scale: 1.025 }}
          whileTap={{ scale: 0.97 }}
          transition={spring}
          animate={{ scale: arrowLit ? 1.012 : 1 }}
          className={cn(
            "relative z-10 flex h-19.5 min-w-43.5 items-center justify-center overflow-hidden rounded-[20px] border bg-linear-to-br from-white to-[#deded9] px-8 text-[28px] font-semibold tracking-[-0.055em] transition-[border-color,color,box-shadow] duration-500 dark:from-[#181818] dark:to-[#0d0d0d]",
            arrowLit
              ? "border-[#993a05] text-white shadow-[0_10px_24px_rgba(24,24,27,.12)] dark:border-[#e06a2c] dark:text-white dark:shadow-[0_10px_24px_rgba(0,0,0,.28)]"
              : "border-black/18 text-zinc-950 shadow-[inset_0_1px_rgba(255,255,255,.9),0_12px_38px_rgba(24,24,27,.14)] dark:border-white/[0.14] dark:text-[#f1f1f1] dark:shadow-[inset_0_1px_rgba(255,255,255,.035),0_10px_30px_rgba(0,0,0,.32)]",
          )}
          aria-pressed={paused}
        >
          <motion.span
            aria-hidden
            className="absolute inset-0 bg-[#993a05]"
            animate={{ opacity: arrowLit ? 1 : 0 }}
            transition={{ duration: arrowLit ? 0.64 : 0.76, ease: arrowLit ? [0.16, 1, 0.3, 1] : [0.22, 1, 0.36, 1] }}
          />
          <span className="relative">{paused ? "Resume" : "Pause"}</span>
        </motion.button>
        <ArrowCursor label={userLabel} className="left-[57%] top-[70%]" delay={0.5} active={arrowLit} />
      </div>

      <FeatureCopy title={title}>{paused ? pausedDescription : activeDescription}</FeatureCopy>
    </Panel>
  );
}

export function ResearchBentoGrid({
  currency = "USD",
  locale = "en-US",
  creditPacks = DEFAULT_CREDIT_PACKS,
  paused,
  defaultPaused = false,
  selectedBrand,
  defaultSelectedBrand = 1,
  brands = DEFAULT_BRANDS,
  copy,
  autoPlay = true,
  brandRotationInterval = 2600,
  spotlightInterval = 4400,
  userLabel = "You",
  collaboratorLabel = "Agent",
  className,
  onPausedChange,
  onSelectedBrandChange,
  ...props
}: ResearchBentoGridProps) {
  const content = { ...DEFAULT_COPY, ...copy };

  if (brands.length === 0) {
    throw new Error("ResearchBentoGrid requires at least one brand.");
  }
  if (creditPacks.length === 0) {
    throw new Error("ResearchBentoGrid requires at least one credit pack.");
  }

  return (
    <div
    style={{
				backgroundImage:
					"radial-gradient(color-mix(in srgb, currentColor 12%, transparent) 1px, transparent 1px)",
				backgroundSize: "18px 18px",
			}}
      {...props}
      className={cn(
        "flex h-full w-full flex-col overflow-y-auto  @container sm:p-3",
        "dark:bg-[#020202] dark:text-white dark:[--bento-tile-cutout:#171717]",
        className,
      )}
    >
     <div className="mx-auto mb-10 w-full max-w-3xl px-4 text-center sm:mb-14 my-14">
 <p className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-muted-foreground text-xs">
							<span className="size-1.5 rounded-full bg-orange-500" />
							Amanises Beyond AI Chat
						</p>

  <h2 className="text-balance text-4xl font-semibold tracking-[-0.055em] text-zinc-950 sm:text-5xl md:text-6xl dark:text-white">
    Give Amanises a task.
    <br />
    <span className="text-zinc-400 dark:text-zinc-600">
      Let it do the work.
    </span>
  </h2>

  <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-zinc-600 sm:text-base dark:text-zinc-400">
    Connect the apps you already use and give your AI agent permission to
    actually take action. Amanises works across your tools instead of just
    telling you what to do.
  </p>
</div>

      <div className="m-auto grid w-full max-w-280 grid-cols-1 gap-2.5 sm:gap-3 @min-[840px]:h-[min(100%,656px)] @min-[840px]:grid-cols-12 @min-[840px]:grid-rows-2">
        <DesignsPanel
          brands={brands}
          selectedBrand={selectedBrand}
          defaultSelectedBrand={defaultSelectedBrand}
          autoPlay={autoPlay}
          rotationInterval={brandRotationInterval}
          userLabel={userLabel}
          collaboratorLabel={collaboratorLabel}
          title={content.showcaseTitle}
          description={content.showcaseDescription}
          onSelectedBrandChange={onSelectedBrandChange}
        />
        <CreditPanel
          creditPacks={creditPacks}
          currency={currency}
          locale={locale}
          autoPlay={autoPlay}
          title={content.pricingTitle}
          description={content.pricingDescription}
        />
        <PausePanel
          paused={paused}
          defaultPaused={defaultPaused}
          autoPlay={autoPlay}
          spotlightInterval={spotlightInterval}
          userLabel={userLabel}
          title={content.pauseTitle}
          activeDescription={content.activeDescription}
          pausedDescription={content.pausedDescription}
          onPausedChange={onPausedChange}
        />
      </div>
    </div>
  );
}

export default ResearchBentoGrid;