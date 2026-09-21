"use client";

import { client } from "@/lib/hono";
import { useQuery } from "@tanstack/react-query";

export const statsKey = ["stats"] as const;

export function useStats() {
  return useQuery({
    queryKey: statsKey,
    queryFn: async () => {
      const res = await client.api.stats.$get();
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    staleTime: 60 * 1000,
  });
}