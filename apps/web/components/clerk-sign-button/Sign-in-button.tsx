"use client";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { LogIn } from "lucide-react";
import { CreditsDisplay } from "../agents/components/credits-display";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

const ACCENT = "#993a05";

type Props = {
  variant?: "navbar" | "sidebar";
  collapsed?: boolean;
};

export const SignInButtonClerk = ({
  variant = "navbar",
  collapsed = false,
}: Props) => {
  const isSidebar = variant === "sidebar";

  return (
    <>
      <Show when="signed-out">
        <SignInButton>
          {isSidebar && collapsed ? (
            <Button
              size="icon"
              className="size-8 rounded-full p-0 text-white shadow-none hover:opacity-90"
              style={{ backgroundColor: ACCENT }}
              aria-label="Get Started"
            >
              <LogIn className="size-4" />
            </Button>
          ) : (
            <Button
              className={cn(
                "h-9.5 rounded-full px-4 text-sm font-medium text-white shadow-none",
                "transition-colors hover:opacity-90",
                isSidebar && "w-full",
              )}
              style={{ backgroundColor: ACCENT }}
            >
              Get Started
            </Button>
          )}
        </SignInButton>
      </Show>

      <Show when="signed-in">
        {/* NAVBAR: single row, same as before */}
        {!isSidebar && (
          <div className="flex items-center gap-2">
            <CreditsDisplay />
            <UserButton appearance={{ elements: { avatarBox: "size-8" } }} />
            <Button
              variant="outline"
              asChild
              className={cn(
                "h-9.5 rounded-full border-[#993a05]/30 px-4 text-sm font-medium",
                "text-[#993a05] transition-colors hover:bg-[#993a05]/10 hover:text-[#993a05]",
                "dark:border-[#e06a2c]/30 dark:text-[#e06a2c] dark:hover:bg-[#e06a2c]/10",
              )}
            >
              <Link href="/stats">Dashboard</Link>
            </Button>
          </div>
        )}

        {/* SIDEBAR: stacked, no Dashboard button (you're already there) */}
        {isSidebar && (
          <div
            className={cn(
              "flex w-full min-w-0 flex-col gap-2 overflow-hidden",
              collapsed && "items-center",
            )}
          >
            <CreditsDisplay variant="sidebar" collapsed={collapsed} />
            <div
              className={cn(
                "flex w-full min-w-0 items-center",
                collapsed ? "justify-center" : "px-1",
              )}
            >
              <UserButton
                showName={!collapsed}
                appearance={{
                  elements: {
                    avatarBox: "size-8 shrink-0",
                    userButtonBox: "min-w-0 max-w-full",
                    userButtonOuterIdentifier:
                      "truncate max-w-[150px] text-sm text-foreground",
                  },
                }}
              />
            </div>
          </div>
        )}
      </Show>
    </>
  );
};