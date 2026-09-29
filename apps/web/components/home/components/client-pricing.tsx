"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Check, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCENT = "#993a05";
const ACCENT_LIGHT = "#e06a2c";

export interface CreditPack {
  name: string;
  price: number;
  credits: number;
  highlight?: boolean;
}

const DEFAULT_PACKS: readonly CreditPack[] = [
  { name: "Starter", price: 5, credits: 100 },
  { name: "Pro", price: 15, credits: 350, highlight: true },
  { name: "Power", price: 40, credits: 1000 },
];

interface PricingSectionProps {
  packs?: readonly CreditPack[];
  /** Where the buttons go. Change to your real sign-in route. */
  signInHref?: string;
  className?: string;
}

export default function PricingSection({
  packs = DEFAULT_PACKS,
  signInHref = "/sign-in",
  className,
}: PricingSectionProps) {
  return (
    <section
      id="pricing"
      aria-label="Pricing"
      className={cn("relative mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-24", className)}
    >
      <div className="mx-auto mb-12 max-w-xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Simple, pay-as-you-go pricing
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Credits are used for AI conversations. Buy a pack, use it whenever
          your agents run, and top up anytime.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {packs.map((pack, i) => {
          const perCredit = pack.price / pack.credits;

          return (
            <motion.div
              key={pack.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-card p-6 transition-shadow",
                pack.highlight
                  ? "border-[#993a05]/60 shadow-[0_20px_60px_-25px_#993a05]"
                  : "border-border hover:shadow-lg",
              )}
            >
              {pack.highlight && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[11px] font-medium text-white"
                  style={{ backgroundColor: ACCENT }}
                >
                  Best for regular use
                </span>
              )}

              <div className="flex items-center gap-2">
                <Zap className="size-4" style={{ color: ACCENT_LIGHT }} />
                <h3 className="text-base font-semibold text-foreground">{pack.name}</h3>
              </div>

              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-4xl font-semibold tracking-tight text-foreground">
                  ${pack.price}
                </span>
                <span className="text-sm text-muted-foreground">one-time</span>
              </div>

              <ul className="mt-5 space-y-2.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="size-4 shrink-0" style={{ color: ACCENT_LIGHT }} />
                  {pack.credits.toLocaleString()} credits
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 shrink-0" style={{ color: ACCENT_LIGHT }} />
                  ${perCredit.toFixed(3)} per credit
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 shrink-0" style={{ color: ACCENT_LIGHT }} />
                  Works across all your agents
                </li>
              </ul>

              <Link
                href={signInHref}
                className={cn(
                  "mt-8 inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-medium transition-all",
                  pack.highlight
                    ? "text-white hover:brightness-110"
                    : "border border-[#993a05]/40 text-[#993a05] hover:bg-[#993a05]/10 dark:border-[#e06a2c]/40 dark:text-[#e06a2c] dark:hover:bg-[#e06a2c]/10",
                )}
                style={pack.highlight ? { backgroundColor: ACCENT } : undefined}
              >
                Get {pack.credits.toLocaleString()} credits
              </Link>
            </motion.div>
          );
        })}
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Sign in to purchase. Your credits appear in your dashboard right after checkout.
      </p>
    </section>
  );
}