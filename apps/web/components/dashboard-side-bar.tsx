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
import { ArrowLeft, Bot, CreditCard } from "lucide-react";
import { SignInButtonClerk } from "@/components/clerk-sign-button/Sign-in-button";
import { ThemeSwitcher } from "@/components/theme/mode-toggle";
import Logo from "./layouts/logo";

const navItems = [
  { href: "/", label: "Back to home", icon: ArrowLeft },
  { href: "/agent", label: "Agents", icon: Bot },
  { href: "/pricing", label: "Buy Credits", icon: CreditCard },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // "/" should never look active inside the dashboard;
  // other routes stay active on nested paths (e.g. /agent/123)
  const isActive = (href: string) =>
    href === "/" ? false : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Sidebar collapsible="icon" className="h-full">
      {/* Header */}
      <SidebarHeader className="h-14 justify-center overflow-hidden border-b px-3">
        <Logo />
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="gap-2 overflow-hidden border-t p-3">
        <SignInButtonClerk variant="sidebar" collapsed={isCollapsed} />

        {!isCollapsed && (
          <div className="flex items-center justify-between gap-2 rounded-xl px-2 py-1">
            <span className="text-xs font-medium text-muted-foreground">
              Theme
            </span>
            <ThemeSwitcher />
          </div>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}