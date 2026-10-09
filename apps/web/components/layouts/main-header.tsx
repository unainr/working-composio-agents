"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MenuIcon, XIcon } from "lucide-react";
import { SignInButtonClerk } from "../clerk-sign-button/Sign-in-button";
import { ThemeSwitcher } from "../theme/mode-toggle";
import { cn } from "@/lib/utils";
import Logo from "./logo";

// Routes now live on the dashboard, not on the home page header.
// const menuItems = [
//   { name: "Agent", href: "/agent" },
//   { name: "Pricing", href: "/pricing" },
// ];

const ACCENT = "#993a05";

export function MainHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // const isActive = (href: string) =>
  //   href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Stronger dock once the user scrolls
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Close drawer on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <>
      {/* Floating dock */}
      <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
        <div
          className={cn(
            "flex h-14 items-center gap-1 rounded-full px-2 backdrop-blur-xl",
            "ring-1 ring-border/60 transition-all duration-300",
            scrolled
              ? "bg-background/85 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.45)]"
              : "bg-background/60 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.25)]",
          )}
        >
          {/* Logo */}
          <div className="mx-1.5 flex items-center justify-center">
            <Logo />
          </div>

          <div className="mx-1 h-6 w-px bg-border/70" />

          {/* Desktop links — removed (available on dashboard)
          <ul className="hidden items-center gap-1 lg:flex">
            {menuItems.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex h-10 items-center rounded-full px-4 text-sm font-medium transition-all duration-150",
                      active
                        ? "text-white shadow-sm"
                        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                    )}
                    style={active ? { backgroundColor: ACCENT } : undefined}
                  >
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
          */}

          {/* Sign in (desktop) */}
          <div className="hidden items-center justify-center lg:flex">
            <SignInButtonClerk />
          </div>

          <div className="mx-1 hidden h-6 w-px bg-border/70 lg:block" />

          {/* Theme switcher */}
          <div className="flex items-center justify-center">
            <ThemeSwitcher />
          </div>

          {/* Mobile toggle */}
          <div className="flex items-center justify-center lg:hidden">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-9.5 w-9.5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
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

      {/* Spacer so page content isn't hidden under the dock */}
      <div className="h-20" />

      {/* Tap-outside backdrop (mobile) */}
      <div
        onClick={() => setMenuOpen(false)}
        className={cn(
          "fixed inset-0 z-30 bg-black/30 backdrop-blur-[2px] transition-opacity duration-200 lg:hidden",
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden="true"
      />

      {/* Mobile drawer — only sign in / credits / dashboard */}
      <div
        className={cn(
          "fixed inset-x-4 top-20 z-40 overflow-hidden rounded-3xl bg-background/95 ring-1 ring-border/60 backdrop-blur-xl",
          "shadow-[0_8px_32px_-12px_rgba(0,0,0,0.35)] transition-[max-height,opacity,visibility] duration-200 lg:hidden",
          menuOpen ? "visible max-h-60 opacity-100" : "invisible max-h-0 opacity-0",
        )}
      >
        <nav className="flex flex-col gap-1 p-4">
          {/* Mobile links — removed (available on dashboard)
          {menuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
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
          */}

          <div className="flex flex-wrap items-center gap-2">
            <SignInButtonClerk />
          </div>
        </nav>
      </div>
    </>
  );
}