"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
    ArrowLeft,
  Bot,
  CreditCard,
  Home,
  Settings,
  Sparkles,
  Zap,
} from "lucide-react";
import { SignInButtonClerk } from "@/components/clerk-sign-button/Sign-in-button";
import { ThemeSwitcher } from "@/components/theme/mode-toggle";
import { useBilling } from "@/hooks/use-billing";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Back to home", icon: ArrowLeft },
  { href: "/agent", label: "Agents", icon: Bot },
  { href: "/pricing", label: "Buy Credits", icon: CreditCard },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { data: billing } = useBilling();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const creditsLow = billing && billing.credits <= 20;
  const creditsEmpty = billing && billing.credits <= 0;

  return (
    <Sidebar collapsible="icon">
      {/* Header */}
      <SidebarHeader className="h-14 justify-center border-b px-3">
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <span className="font-semibold text-sm truncate">Amanises</span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-3 gap-2">
        {/* Credits pill */}
        {billing && (
          <Link href="/pricing">
            <div className={cn(
              "flex items-center justify-between rounded-lg border px-3 py-2 text-xs transition-colors hover:bg-muted/50",
              isCollapsed && "justify-center px-2",
              creditsEmpty ? "border-destructive/40 bg-destructive/5" :
              creditsLow ? "border-amber-500/40 bg-amber-500/5" :
              "border-border bg-muted/30"
            )}>
              <Zap className={cn(
                "size-3.5 shrink-0",
                creditsEmpty ? "text-destructive" :
                creditsLow ? "text-amber-500" : "text-primary"
              )} />
              {!isCollapsed && (
                <>
                  <span className="text-muted-foreground ml-2 flex-1">Credits</span>
                  <span className={cn(
                    "font-semibold tabular-nums",
                    creditsEmpty ? "text-destructive" :
                    creditsLow ? "text-amber-500" : "text-foreground"
                  )}>
                    {billing.credits}
                  </span>
                </>
              )}
            </div>
          </Link>
        )}

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <Link href="/settings">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {!isCollapsed && (
          <div className="flex items-center justify-between gap-2 rounded-lg border bg-background/40 px-2 py-1.5">
            <SignInButtonClerk />
            <ThemeSwitcher />
          </div>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}