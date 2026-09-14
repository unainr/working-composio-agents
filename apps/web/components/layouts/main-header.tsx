"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { SignInButtonClerk } from "../clerk-sign-button/Sign-in-button";

import { ThemeSwitcher } from "../theme/mode-toggle";
import { MenuIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreditsDisplay } from "../agents/components/credits-display";

const menuItems = [
  { name: "Agent", href: "/agent" },
  { name: "Pricing", href: "/pricing" },
];

export function MainHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 h-14 border-b border-border/60 bg-background/70 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-5">
          {/* LEFT — logo + separator + links */}
          <div className="flex h-full items-center">
            <Link
              href="/"
              className="flex items-center gap-2 pr-5 text-lg font-bold tracking-tight transition-opacity hover:opacity-80"
            >
              <span className="text-foreground">Amanises</span>
            </Link>

            <div className="hidden h-5 w-px bg-border lg:block" />

            {/* Desktop links */}
            <ul className="ml-5 hidden h-full items-center gap-1 lg:flex">
              {menuItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href} className="h-full">
                    <Link
                      href={item.href}
                      className={cn(
                        "relative flex h-full items-center px-3.5 text-sm font-medium transition-colors duration-150",
                        active
                          ? "text-rose-500"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {item.name}
                      {active && (
                        <span className="absolute inset-x-3.5 bottom-0 h-0.5 rounded-t-full bg-rose-500" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* RIGHT — credits + theme + separator + cta + mobile toggle */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <CreditsDisplay />
            </div>

            <ThemeSwitcher />

            <div className="hidden h-5 w-px bg-border lg:block" />

            <div className="hidden items-center gap-2 lg:flex">
              <SignInButtonClerk />
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-8.5 w-8.5 items-center justify-center rounded-lg border border-border bg-transparent text-muted-foreground transition-colors hover:border-rose-500/30 hover:text-foreground lg:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <XIcon className="size-4.5" />
              ) : (
                <MenuIcon className="size-4.5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Spacer so page content isn't hidden under the fixed header */}
      <div className="h-14" />

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-x-0 top-14 z-40 overflow-hidden border-b border-border/60 bg-background/95 backdrop-blur-xl transition-[max-height,opacity] duration-200 lg:hidden",
          menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="flex flex-col gap-1 p-4">
          {/* Credits shown here on small screens where the header hides it */}
          <div className="mb-2 sm:hidden">
            <CreditsDisplay />
          </div>

          {menuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-rose-500/10 text-rose-500"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {item.name}
              </Link>
            );
          })}

          <div className="mt-3 flex gap-2 border-t border-border pt-3">
            <SignInButtonClerk />
          </div>
        </nav>
      </div>
    </>
  );
}