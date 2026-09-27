"use client";

import { api } from "@backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { Carrot, ClipboardList, LayoutGrid, Pizza } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HotboxLogo } from "@/components/hotbox-logo";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const NAV = [
  { href: "/", label: "Orders", icon: ClipboardList, exact: true },
  { href: "/pizzas", label: "Pizzas", icon: Pizza },
  { href: "/ingredients", label: "Ingredients", icon: Carrot },
  { href: "/categories", label: "Categories", icon: LayoutGrid },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const pending = useQuery(api.orders.adminList, { status: "pending" });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-14 justify-center px-4 group-data-[collapsible=icon]:px-2">
        <Link href="/">
          <HotboxLogo className="text-lg group-data-[collapsible=icon]:[&>span:last-child]:hidden" />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Kitchen</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => {
                const isActive =
                  "exact" in item && item.exact
                    ? pathname === item.href || pathname.startsWith("/orders")
                    : pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.href === "/" && pending && pending.length > 0 && (
                      <SidebarMenuBadge className="bg-status-pending/15 text-status-pending">
                        {pending.length}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
