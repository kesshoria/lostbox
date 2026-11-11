// ============================================================
// Badge — small status pill.
// ============================================================

import { type ReactNode } from "react";
import type { ItemStatus } from "@/lib/types";

type Tone = "neutral" | "accent" | "home" | "borrowed" | "lost" | "discarded";

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  dot?: boolean;
  className?: string;
}

const toneClasses: Record<Tone, string> = {
  neutral: "bg-surface-inset text-content-secondary border-border-subtle",
  accent: "bg-accent-soft text-accent border-accent/20",
  home: "bg-surface-inset text-status-home border-border-subtle",
  borrowed: "bg-status-borrowed/15 text-status-borrowed border-status-borrowed/30",
  lost: "bg-status-lost/15 text-status-lost border-status-lost/30",
  discarded: "bg-surface-inset text-status-discarded border-border-subtle",
};

const dotClasses: Record<Tone, string> = {
  neutral: "bg-content-muted",
  accent: "bg-accent",
  home: "bg-status-home",
  borrowed: "bg-status-borrowed",
  lost: "bg-status-lost",
  discarded: "bg-status-discarded",
};

export function Badge({
  children,
  tone = "neutral",
  dot = false,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-0.5 text-xs font-medium ${toneClasses[tone]} ${className}`}
    >
      {dot && (
        <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${dotClasses[tone]}`} />
      )}
      {children}
    </span>
  );
}

// Convenience: status-aware badge for an ItemStatus value.
const STATUS_LABEL: Record<ItemStatus, string> = {
  home: "Home",
  borrowed: "Borrowed",
  lost: "Lost",
  discarded: "Discarded",
};

const STATUS_TONE: Record<ItemStatus, Tone> = {
  home: "home",
  borrowed: "borrowed",
  lost: "lost",
  discarded: "discarded",
};

export function StatusBadge({ status }: { status: ItemStatus }) {
  return (
    <Badge tone={STATUS_TONE[status]} dot>
      {STATUS_LABEL[status]}
    </Badge>
  );
}
