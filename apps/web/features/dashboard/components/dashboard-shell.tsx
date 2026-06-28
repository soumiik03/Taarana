"use client";

import React from "react";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { DashboardSidebar } from "./dashboard-sidebar";
import { usePathname } from "next/navigation";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();

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
      {/* Scrollbar and Film Grain Styling */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Custom Modern Scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #191919;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 9999px;
          border: 2px solid #191919;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.16);
        }

        /* Subtle Noise Film Grain Overlay */
        .grain-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 105%;
          content: "";
          opacity: 0.035;
          pointer-events: none;
          z-index: 9999;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }

        /* Global Page Transition Animations */
        @keyframes pageFadeIn {
          0% {
            opacity: 0;
            transform: translateY(6px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .page-transition {
          animation: pageFadeIn 220ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity;
        }
        @media (prefers-reduced-motion: reduce) {
          .page-transition {
            animation: none;
          }
        }
      `}} />

      {/* Grain overlay markup */}
      <div className="grain-overlay" />

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
              <div key={pathname} className="page-transition">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
