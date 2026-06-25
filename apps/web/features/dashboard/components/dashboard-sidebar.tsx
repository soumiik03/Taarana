"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dashboardRoutes } from "../lib/routes";
import { WorkspaceSwitcher } from "~/features/workspace/components/workspace-switcher";
import { UserMenu } from "~/components/user/user-menu";
import { cn } from "~/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "~/components/ui/sidebar";

const mockWorkspaces = [
  { id: "1", name: "Taarana Team", slug: "taarana" },
  { id: "2", name: "Acme Corp", slug: "acme" },
];

function isRouteActive(pathname: string, route: { label: string; href: string }) {
  if (route.label === "PRD Editor") {
    return pathname.startsWith("/dashboard/prds");
  }

  return (
    pathname === route.href ||
    (route.href !== "/dashboard" && pathname.startsWith(route.href))
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-[#2D2D2D] bg-[#1F1F1F]">
      <SidebarHeader className="border-b border-[#2D2D2D]/60 p-2">
        <div className="px-1">
          <WorkspaceSwitcher
            workspaces={mockWorkspaces}
            currentWorkspace={mockWorkspaces[0]!}
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider text-[#9B9B9B] mb-2 px-3">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dashboardRoutes.map((route) => {
                const Icon = route.icon;
                const isActive = isRouteActive(pathname, route);

                return (
                  <SidebarMenuItem key={`${route.label}-${route.href}`}>
                    <SidebarMenuButton
                      render={<Link href={route.href} />}
                      isActive={isActive}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer",
                        isActive
                          ? "bg-[#2C2C2C]! text-[#FFFFFF]! font-semibold"
                          : "text-[#9B9B9B] hover:bg-[#252525]! hover:text-[#E3E3E3]!"
                      )}
                    >
                      <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-[#E3E3E3]" : "text-[#9B9B9B]")} />
                      <span>{route.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-[#2D2D2D] p-3 bg-[#1A1A1A]">
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  );
}
