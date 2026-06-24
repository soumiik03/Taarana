"use client";

import React from "react";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { DashboardSidebar } from "./dashboard-sidebar";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <SidebarProvider
      style={{
        "--sidebar": "#1F1F1F",
        "--sidebar-foreground": "#E3E3E3",
        "--sidebar-border": "#2D2D2D",
        "--sidebar-accent": "#2C2C2C",
        "--sidebar-accent-foreground": "#FFFFFF",
      } as React.CSSProperties}
      className="bg-[#191919]"
    >
      <div className="flex h-screen w-screen bg-[#191919] text-[#E3E3E3] overflow-hidden">
        <DashboardSidebar />
        
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#191919]">
          {/* Dashboard Top Navigation Bar */}
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#2D2D2D] bg-[#191919] px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-[#9B9B9B] hover:text-[#E3E3E3] hover:bg-[#202020]" />
              <div className="h-4 w-px bg-[#2D2D2D]" />
              <span className="text-xs text-[#9B9B9B] font-mono tracking-tight">TAARANA // WORKSPACE</span>
            </div>
          </header>

          {/* Main Scrollable View */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="max-w-7xl w-full mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
