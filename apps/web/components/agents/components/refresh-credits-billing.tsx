"use client";

import { useEffect, useRef } from "react";
import { useRefreshAfterUpgrade } from "@/hooks/use-refresh";

export function RefreshBillingAfterUpgrade() {
  const refreshAfterUpgrade = useRefreshAfterUpgrade();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    refreshAfterUpgrade();
  }, [refreshAfterUpgrade]);

  return null;
}