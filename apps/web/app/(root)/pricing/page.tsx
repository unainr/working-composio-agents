"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { Button } from "@/components/ui/button";
import { billingKey, useBilling } from "@/hooks/use-billing";
import { Check } from "lucide-react";

function PricingContent() {
  const [loading, setLoading] = useState(false);

  const { data: billing } = useBilling();
  const queryClient = useQueryClient();
  const params = useSearchParams();

  useEffect(() => {
    if (params.get("upgraded") === "1") {
      queryClient.invalidateQueries({ queryKey: billingKey });
    }
  }, [params, queryClient]);

  async function upgrade() {
    setLoading(true);

    try {
      const res = await client.api.checkout.$post();
      const { checkoutUrl } = await res.json();

      window.location.href = checkoutUrl;
    } catch {
      setLoading(false);
    }
  }

  const isPro = billing?.plan === "pro";

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-2 text-center text-2xl font-semibold">
        Choose your plan
      </h1>

      <p className="mb-10 text-center text-sm text-muted-foreground">
        Free includes 3 agents and 40 credits. Pro unlocks 10 agents and 200
        credits.
      </p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border p-6">
          <h2 className="font-semibold">Free</h2>

          <p className="mt-1 text-2xl font-semibold">$0</p>

          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              3 agents
            </li>

            <li className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              40 credits/mo
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-primary p-6">
          <h2 className="font-semibold">Pro</h2>

          <p className="mt-1 text-2xl font-semibold">
            $15
            <span className="text-sm font-normal text-muted-foreground">
              /mo
            </span>
          </p>

          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              10 agents
            </li>

            <li className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              200 credits/mo
            </li>
          </ul>

          <Button
            onClick={upgrade}
            disabled={loading || isPro}
            className="mt-5 w-full"
          >
            {isPro
              ? "Current plan"
              : loading
                ? "Redirecting..."
                : "Upgrade to Pro"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <PricingContent />
    </Suspense>
  );
}