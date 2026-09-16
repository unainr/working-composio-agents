"use client";

import { client } from "@/lib/hono";
import { useQuery } from "@tanstack/react-query";

export type BillingInfo = {
  plan: "free" | "pro";
  credits: number;
  maxCredits: number;
  agents: { current: number; max: number };
};

export const billingKey = ["billing"] as const;

export function useBilling() {
  return useQuery({
    queryKey: billingKey,
    queryFn: async (): Promise<BillingInfo> => {
      const res = await client.api.billing.$get();
      if (!res.ok) throw new Error("Failed to fetch billing info");
           return (await res.json()) as BillingInfo;

    },
   
  });
}