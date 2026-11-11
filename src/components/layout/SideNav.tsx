// ============================================================
// SideNav — desktop navigation (hidden on mobile).
// A simple vertical list shown on sm+ screens via the AppShell layout.
// ============================================================

import { NavLink } from "react-router-dom";
import { Home, Boxes, MapPin, Package, Settings } from "lucide-react";

const navItems = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/items", label: "Items", icon: Package, end: false },
  { to: "/locations", label: "Places", icon: MapPin, end: false },
  { to: "/containers", label: "Boxes", icon: Boxes, end: false },
  { to: "/settings", label: "Settings", icon: Settings, end: false },
];

export function SideNav() {
  return (
    <nav
      aria-label="Primary"
      className="hidden sm:flex sm:fixed sm:inset-y-0 sm:left-0 sm:w-56 sm:flex-col sm:gap-1 sm:px-3 sm:py-6 sm:border-r sm:border-border-subtle sm:bg-surface-base"
    >
      <div className="px-3 pb-4">
        <span className="text-sm font-semibold tracking-tight text-content-primary">
          Where Did I Put It?
        </span>
      </div>
      {navItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            [
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ease-calm",
              isActive
                ? "bg-accent-soft text-accent"
                : "text-content-secondary hover:bg-surface-inset hover:text-content-primary",
            ].join(" ")
          }
        >
          <Icon size={18} aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
