// ============================================================
// TopBar — sticky header with logo + page title.
// Mobile-first: small, focused, doesn't dominate.
// ============================================================

import { type ReactNode } from "react";
import { AppLogo } from "./AppLogo";

interface TopBarProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function TopBar({ title, subtitle, actions }: TopBarProps) {
  return (
    <header
      className="sticky top-0 z-30 bg-surface-base/85 backdrop-blur-md border-b border-border-subtle"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="app-container flex h-14 items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <AppLogo size={28} className="shrink-0" />
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-content-primary truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-content-muted truncate">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </header>
  );
}
