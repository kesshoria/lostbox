// ============================================================
// EmptyState — friendly placeholder for empty lists/screens.
// Encourages the next action; never feels like an error.
// ============================================================

import { type ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-12 px-6 ${className}`}
    >
      {icon && (
        <div
          aria-hidden="true"
          className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-inset text-content-muted"
        >
          {icon}
        </div>
      )}
      <h2 className="text-lg font-semibold text-content-primary">{title}</h2>
      {description && (
        <p className="mt-2 max-w-sm text-body text-content-secondary">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
