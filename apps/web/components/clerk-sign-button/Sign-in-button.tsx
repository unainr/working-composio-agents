"use client";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";

import Link from "next/link";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

const ACCENT = "#993a05";

export const SignInButtonClerk = () => {
  return (
    <>
      <Show when="signed-out">
        <SignInButton>
          <Button
            className={cn(
              "h-9.5 rounded-full px-4 text-sm font-medium text-white shadow-none",
              "transition-colors hover:opacity-90",
            )}
            style={{ backgroundColor: ACCENT }}
          >
            Get Started
          </Button>
        </SignInButton>
      </Show>

      <Show when="signed-in">
        <div className="flex items-center gap-2">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "size-8",
              },
            }}
          />
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
      </Show>
    </>
  );
};