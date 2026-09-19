"use client";

import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { useState } from "react";
import { client } from "@/lib/hono";
import { useBilling } from "@/hooks/use-billing";
import { cn } from "@/lib/utils";

const PACKS = [
  { name: "Starter", credits: 100, price: "$5", pricePerCredit: "5¢", productId: "76e82748-5a1f-4fac-ab12-bbf304f4e475" },
  { name: "Pro", credits: 350, price: "$15", pricePerCredit: "4.3¢", productId: "f6dd282c-7f0a-4da9-bdd9-cbde111869ff", popular: true },
  { name: "Power", credits: 1000, price: "$40", pricePerCredit: "4¢", productId: "51cba6f8-d736-469c-8426-a0d4ea80174c" },
];

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: "credits" | "agents";
}

export function UpgradeDialog({ open, onOpenChange, reason }: UpgradeDialogProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const { data: billing } = useBilling();

  async function buyPack(productId: string) {
    setLoading(productId);
    try {
      const res = await client.api.checkout.$post({ json: { productId } });
      const { checkoutUrl } = await res.json();
      window.location.href = checkoutUrl;
    } catch {
      setLoading(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {reason === "agents" ? "Agent limit reached" : "Out of credits"}
          </DialogTitle>
          <DialogDescription>
            {reason === "agents"
              ? "You've used all your agent slots. Buy credits to unlock more."
              : "You're out of credits. Buy a pack to continue chatting."}
          </DialogDescription>
        </DialogHeader>

        {/* Current balance */}
        {billing && (
          <div className="flex items-center gap-2 py-1">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              Current balance:{" "}
              <span className="font-medium text-foreground">
                {billing.credits} credits
              </span>
            </span>
          </div>
        )}

        {/* Packs */}
        <div className="grid grid-cols-3 gap-3 mt-1">
          {PACKS.map((pack) => (
            <div
              key={pack.productId}
              className={cn(
                "relative rounded-xl border p-4 flex flex-col gap-3",
                pack.popular
                  ? "border-primary border-2"
                  : "border-border"
              )}
            >
              {pack.popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary/10 text-primary text-[11px] font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap">
                  Most popular
                </span>
              )}

              <div>
                <p className="text-xs text-muted-foreground mb-0.5">{pack.name}</p>
                <p className="text-xl font-semibold">{pack.price}</p>
              </div>

              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-sm font-medium">
                  {pack.credits.toLocaleString()} credits
                </span>
              </div>

              <p className="text-xs text-muted-foreground">
                {pack.pricePerCredit} per credit
              </p>

              <Button
                onClick={() => buyPack(pack.productId)}
                disabled={loading === pack.productId}
                variant={pack.popular ? "default" : "outline"}
                size="sm"
                className="w-full"
              >
                {loading === pack.productId ? "Redirecting..." : `Buy ${pack.credits.toLocaleString()}`}
              </Button>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-1">
          Credits never expire · Buy more anytime
        </p>
      </DialogContent>
    </Dialog>
  );
}