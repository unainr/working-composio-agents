"use client";

import { useAuth } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";
import { billingKey } from "@/hooks/use-billing";

export function useRefreshAfterUpgrade() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return async () => {
    // Ask Clerk for a fresh token instead of relying on
    // the currently cached session token.
    await getToken({ skipCache: true });

    // Now ask the API for fresh billing data.
    await queryClient.refetchQueries({
      queryKey: billingKey,
      type: "active",
    });
  };
}