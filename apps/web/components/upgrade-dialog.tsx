// components/upgrade-dialog.tsx
"use client";

import { PricingTable } from "@clerk/nextjs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: "credits" | "agents";
}

export function UpgradeDialog({ open, onOpenChange, reason }: UpgradeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {reason === "agents" ? "Agent limit reached" : "Out of credits"}
          </DialogTitle>
          <DialogDescription>
            {reason === "agents"
              ? "You've hit the agent limit on your current plan. Upgrade to create more."
              : "You're out of conversation credits. Upgrade for a bigger monthly allowance."}
          </DialogDescription>
        </DialogHeader>
        <PricingTable />
      </DialogContent>
    </Dialog>
  );
}