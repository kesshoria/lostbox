// ============================================================
// AppShell — the page chrome: TopBar + SideNav + content + BottomNav.
// Mobile: TopBar at top, BottomNav at bottom, content scrolls between.
// Desktop: SideNav fixed left, TopBar at top, content scrolls in middle.
// ============================================================

import { type ReactNode } from "react";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import { SideNav } from "./SideNav";

interface AppShellProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function AppShell({ title, subtitle, actions, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-surface-base">
      <SideNav />
      <div className="sm:pl-56 min-h-screen flex flex-col">
        <TopBar title={title} subtitle={subtitle} actions={actions} />
        <main
          id="main-content"
          className="flex-1 pb-20 sm:pb-8"
        >
          {children}
        </main>
      </div>
      <BottomNav />
      {/* sr-only skip link target — see App.tsx for the link itself */}
    </div>
  );
}
