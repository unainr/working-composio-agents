"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { SignInButtonClerk } from "../clerk-sign-button/Sign-in-button";

import { ThemeSwitcher } from "../theme/mode-toggle";
import { MenuIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreditsDisplay } from "../agents/components/credits-display";
import Logo from "./logo";

const menuItems = [
  { name: "Agent", href: "/agent" },
  { name: "Pricing", href: "/pricing" },
];

const ACCENT = "#993a05";

export function MainHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Floating dock — detached pill, centered, not full-width */}
      <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
        <div
          className={cn(
            "flex h-14 items-center gap-1 rounded-full",
            "bg-background/70 px-2 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.25)] backdrop-blur-xl",
            "supports-backdrop-filter:bg-background/60",
          )}
        >
          {/* Logo */}
          <div className="mx-1.5 flex items-center justify-center">
            <Logo />
          </div>

          <div className="mx-1 h-6 w-px bg-border/70" />

          {/* Desktop links */}
          {/* <ul className="hidden items-center gap-1 lg:flex">
            {menuItems.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "relative flex h-10 items-center rounded-full px-4 text-sm font-medium transition-colors duration-150",
                      active
                        ? "text-white"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    style={active ? { backgroundColor: ACCENT } : undefined}
                  >
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul> */}

        

        

          {/* Theme switcher */}
          <div className="flex items-center justify-center">
            <ThemeSwitcher />
          </div>

          <div className="mx-1 hidden h-6 w-px bg-border/70 lg:block" />

          {/* Sign in */}
          <div className="hidden items-center justify-center lg:flex">
            <SignInButtonClerk />
          </div>

          {/* Mobile toggle */}
          <div className="flex items-center justify-center lg:hidden">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className={cn(
                "flex h-9.5 w-9.5 items-center justify-center rounded-full text-muted-foreground transition-colors",
                "hover:text-foreground",
              )}
              style={menuOpen ? { color: ACCENT } : undefined}
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

      {/* Spacer so page content isn't hidden under the floating dock */}
      <div className="h-20" />

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-x-4 top-20 z-40 overflow-hidden rounded-3xl bg-background/95 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-[max-height,opacity] duration-200 lg:hidden",
          menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <nav className="flex flex-col gap-1 p-4">
          {/* Credits shown here on small screens where the dock hides it */}
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
                  "rounded-full px-3.5 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                style={active ? { backgroundColor: ACCENT } : undefined}
              >
                {item.name}
              </Link>
            );
          })}

          <div className="mt-3 flex gap-4 border-t border-border pt-3">
            <SignInButtonClerk />
          </div>
        </nav>
      </div>
    </>
  );
}