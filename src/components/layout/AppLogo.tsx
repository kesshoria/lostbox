// ============================================================
// AppLogo — the small mark shown in TopBar.
// Inline SVG so it inherits currentColor and works offline.
// A simple box-with-pin: "where is it?"
// ============================================================

interface AppLogoProps {
  size?: number;
  className?: string;
}

export function AppLogo({ size = 24, className = "" }: AppLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Outer rounded box */}
      <rect
        x="3"
        y="3"
        width="26"
        height="26"
        rx="7"
        className="fill-accent"
      />
      {/* Inner location pin */}
      <path
        d="M16 9.5a5 5 0 0 0-5 5c0 3.4 4.2 7.2 4.7 7.7a.5.5 0 0 0 .6 0c.5-.5 4.7-4.3 4.7-7.7a5 5 0 0 0-5-5Z"
        className="fill-accent-contrast"
      />
      <circle cx="16" cy="14.5" r="1.8" className="fill-accent" />
    </svg>
  );
}
