"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ToolkitPanel } from "@/components/toolkit-panel";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function Panel() {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex h-14 shrink-0 items-center border-b px-4">
        <span className="text-sm font-semibold">Integrations</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <ToolkitPanel />
      </div>
    </div>
  );
}

export function ChatRightSidebar({ open, onOpenChange }: Props) {
  const isMobile = useIsMobile();

  // Mobile: slide-over sheet
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-[85vw] max-w-80 gap-0 bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Integrations</SheetTitle>
            <SheetDescription>Connected apps</SheetDescription>
          </SheetHeader>
          <Panel />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: collapsible column (animates width, inner div keeps content from reflowing)
   return (
    <aside
      className={cn(
        "relative shrink-0 overflow-hidden bg-sidebar text-sidebar-foreground",
        "transform-gpu transition-[width] duration-200 ease-linear",
        open ? "w-80 border-l" : "w-0"
      )}
    >
      <div className="h-full w-80">
        <Panel />
      </div>
    </aside>
  );
}