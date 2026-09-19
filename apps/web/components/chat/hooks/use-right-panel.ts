"use client";

import { useState } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export function useRightPanel() {
  const { open: leftOpen } = useSidebar();
  const isMobile = useIsMobile();

  // Desktop: null = follow the left sidebar, boolean = user's manual choice
  const [override, setOverride] = useState<boolean | null>(null);
  // Mobile: the panel is a sheet with its own independent state
  const [sheetOpen, setSheetOpen] = useState(false);

  // When the left sidebar changes, drop the manual override so the right one follows again.
  // (Adjusting state during render is React's recommended alternative to a syncing effect.)
  const [prevLeftOpen, setPrevLeftOpen] = useState(leftOpen);
  if (prevLeftOpen !== leftOpen) {
    setPrevLeftOpen(leftOpen);
    setOverride(null);
  }

  const open = isMobile ? sheetOpen : (override ?? leftOpen);

  const setOpen = (value: boolean) =>
    isMobile ? setSheetOpen(value) : setOverride(value);

  const toggle = () => setOpen(!open);

  return { open, setOpen, toggle };
}