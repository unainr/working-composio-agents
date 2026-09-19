"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { Button } from "@/components/ui/button";
import { billingKey, useBilling } from "@/hooks/use-billing";
import { Check, Zap } from "lucide-react";

const PACKS = [
  { name: "Starter", credits: 100, price: "$5", productId: "76e82748-5a1f-4fac-ab12-bbf304f4e475" },
  { name: "Pro", credits: 350, price: "$15", productId: "f6dd282c-7f0a-4da9-bdd9-cbde111869ff" },
  { name: "Power", credits: 1000, price: "$40", productId: "51cba6f8-d736-469c-8426-a0d4ea80174c" },
];

function PricingContent() {
  const [loading, setLoading] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const { data: billing } = useBilling();
  const queryClient = useQueryClient();
  const params = useSearchParams();
  const confirmedRef = useRef<string | null>(null);

  useEffect(() => {
    const checkoutId = params.get("checkoutId");
    if (!checkoutId) return;
    if (confirmedRef.current === checkoutId) return;

    confirmedRef.current = checkoutId;
    setConfirming(true);

    (async () => {
      try {
        const res = await client.api.checkout.confirm.$get({
          query: { checkoutId },
        });

        if (res.ok) {
          await new Promise(r => setTimeout(r, 500));
          await queryClient.invalidateQueries({ queryKey: billingKey });
          await queryClient.refetchQueries({ queryKey: billingKey });
          setConfirmed(true);
        }
      } catch (err) {
        console.error("[pricing] confirm error:", err);
      } finally {
        setConfirming(false);
      }
    })();
  }, [params, queryClient]);

  async function buyPack(productId: string) {
    setLoading(productId);
    try {
      const res = await client.api.checkout.$post({
        json: { productId },
      });
      const { checkoutUrl } = await res.json();
      window.location.href = checkoutUrl;
    } catch {
      setLoading(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-2 text-center text-2xl font-semibold">Buy Credits</h1>
      <p className="mb-4 text-center text-sm text-muted-foreground">
        Credits are used for AI conversations. Buy more anytime.
      </p>

      {billing && (
        <p className="mb-10 text-center text-sm font-medium">
          Current balance:{" "}
          <span className="text-primary">{billing.credits} credits</span>
        </p>
      )}

      {/* Status messages */}
      {confirming && (
        <p className="mb-6 text-center text-sm text-muted-foreground animate-pulse">
          Adding credits to your account...
        </p>
      )}
      {confirmed && !confirming && (
        <p className="mb-6 text-center text-sm text-green-600 dark:text-green-400 font-medium">
          ✓ Credits added successfully!
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {PACKS.map((pack) => (
          <div key={pack.productId} className="rounded-2xl border p-6">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">{pack.name}</h2>
            </div>
            <p className="mt-1 text-2xl font-semibold">{pack.price}</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                {pack.credits} credits
              </li>
            </ul>
            <Button
              onClick={() => buyPack(pack.productId)}
              disabled={loading === pack.productId}
              className="mt-5 w-full"
            >
              {loading === pack.productId
                ? "Redirecting..."
                : `Buy ${pack.credits} credits`}
            </Button>
          </div>
        ))}
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