// ============================================================
// BottomNav — mobile-first navigation.
// Hidden on desktop (>= sm) where a sidebar/top-nav handles it.
// Always visible on mobile so the 5 main destinations are reachable
// with a thumb. Each item is a min 44px touch target.
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

export function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 bg-surface-base/95 backdrop-blur-md border-t border-border-subtle sm:hidden safe-bottom"
    >
      <ul className="app-container flex items-stretch justify-between gap-1 px-2">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  "flex h-14 flex-col items-center justify-center gap-0.5 rounded-lg text-xs font-medium transition-colors duration-150 ease-calm",
                  isActive
                    ? "text-accent"
                    : "text-content-muted hover:text-content-primary",
                ].join(" ")
              }
            >
              <Icon size={22} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
