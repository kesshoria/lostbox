// ============================================================
// Card — surface container with rounded corners + subtle shadow.
// ============================================================

import { type HTMLAttributes, type ElementType } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  as?: ElementType;
  interactive?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingClasses = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-5 sm:p-6",
};

export function Card({
  as: Comp = "div",
  interactive = false,
  padding = "md",
  className = "",
  children,
  ...rest
}: CardProps) {
  return (
    <Comp
      className={[
        "rounded-card bg-surface-raised border border-border-subtle shadow-card",
        interactive
          ? "transition-colors duration-150 ease-calm hover:border-border-strong hover:bg-surface-overlay cursor-pointer"
          : "",
        paddingClasses[padding],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </Comp>
  );
}
