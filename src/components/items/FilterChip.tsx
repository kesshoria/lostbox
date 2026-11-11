// ============================================================
// FilterChip — a small toggleable pill used for the items page
// filter bar. Behaves like a single-select radio group when
// multiple chips share a name; chip is "active" when selected.
// ============================================================

import { type ReactNode } from "react";

interface FilterChipProps {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  // Optional count badge shown after the label, e.g. "Borrowed (3)".
  count?: number;
}

export function FilterChip({
  selected,
  onClick,
  children,
  count,
}: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        "inline-flex items-center gap-1.5 rounded-pill border px-3 py-1.5 text-sm font-medium transition-colors duration-150 ease-calm",
        selected
          ? "bg-accent text-accent-contrast border-accent"
          : "bg-surface-raised text-content-secondary border-border-strong hover:bg-surface-inset hover:text-content-primary",
      ].join(" ")}
    >
      {children}
      {count !== undefined && count > 0 && (
        <span
          className={[
            "inline-flex h-5 min-w-5 items-center justify-center rounded-pill px-1.5 text-xs",
            selected ? "bg-accent-contrast/20" : "bg-surface-inset text-content-muted",
          ].join(" ")}
        >
          {count}
        </span>
      )}
    </button>
  );
}
