"use client";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";

import Link from "next/link";
import { Button } from "../ui/button";

export const SignInButtonClerk = () => {


  return (
    <>
      <Show when="signed-out">
        <SignInButton>
          <Button >Get Started</Button>
        </SignInButton>
      </Show>

      <Show when="signed-in">
        <UserButton />
        <Button variant={"default"} className="rounded-none" asChild>
          <Link href="/stats">Dashboard</Link>
        </Button>
      </Show>
    </>
  );
};