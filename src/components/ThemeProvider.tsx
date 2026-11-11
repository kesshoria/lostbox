// ============================================================
// ThemeProvider — applies 'light' / 'dark' class on <html>
// based on user preference (stored in IndexedDB) or system setting.
// Per the brief, theme choice is stored as a Setting row, NOT localStorage.
// However, applying the class needs to happen ASAP on load to avoid
// a flash, so we also cache the resolved theme in localStorage for
// fast re-application; the IndexedDB value is the source of truth.
// ============================================================

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getThemePref, setThemePref } from "@/db/settings";
import type { ThemePref } from "@/lib/types";

type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  pref: ThemePref;
  resolved: ResolvedTheme;
  setPref: (pref: ThemePref) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}

const CACHE_KEY = "wdipi-theme";

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveTheme(pref: ThemePref): ResolvedTheme {
  return pref === "system" ? getSystemTheme() : pref;
}

function applyThemeClass(resolved: ResolvedTheme) {
  const root = document.documentElement;
  if (resolved === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  root.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialise from the cache to avoid flash; correct to user pref after mount.
  const [pref, setPrefState] = useState<ThemePref>(() => {
    if (typeof localStorage !== "undefined") {
      const cached = localStorage.getItem(CACHE_KEY) as ThemePref | null;
      if (cached === "light" || cached === "dark" || cached === "system") {
        return cached;
      }
    }
    return "system";
  });
  const [resolved, setResolved] = useState<ResolvedTheme>(() =>
    resolveTheme(pref),
  );

  // Apply on mount + whenever pref changes.
  useEffect(() => {
    const r = resolveTheme(pref);
    setResolved(r);
    applyThemeClass(r);
    localStorage.setItem(CACHE_KEY, pref);
  }, [pref]);

  // Read the source-of-truth pref from IndexedDB on mount.
  useEffect(() => {
    let cancelled = false;
    getThemePref().then((stored) => {
      if (!cancelled && stored) {
        setPrefState(stored);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // React to system theme changes when pref is 'system'.
  useEffect(() => {
    if (pref !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    function onChange() {
      const r = getSystemTheme();
      setResolved(r);
      applyThemeClass(r);
    }
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [pref]);

  // Update both IndexedDB + cache + state.
  const setPref = useCallback(async (next: ThemePref) => {
    setPrefState(next);
    try {
      await setThemePref(next);
    } catch (err) {
      console.warn("Failed to persist theme:", err);
    }
    localStorage.setItem(CACHE_KEY, next);
  }, []);

  return (
    <ThemeContext.Provider value={{ pref, resolved, setPref }}>
      {children}
    </ThemeContext.Provider>
  );
}
