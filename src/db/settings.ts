// ============================================================
// Settings — a thin key/value store for lightweight app preferences.
// Per the brief, we use this ONLY for UI preferences (theme, last-used
// filters). All item data lives in the items store.
// ============================================================

import { db } from "./index";
import type { Setting, ThemePref } from "@/lib/types";

export const SETTINGS_KEYS = {
  theme: "theme",
  lastFilter: "lastFilter",
  lastSort: "lastSort",
  hasSeeded: "hasSeeded",
} as const;

export async function getSetting<T = unknown>(key: string): Promise<T | undefined> {
  const row = await db.settings.get(key);
  return row?.value as T | undefined;
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  const setting: Setting = { key, value };
  await db.settings.put(setting);
}

// Convenience wrappers for theme — the most-used setting.
export async function getThemePref(): Promise<ThemePref> {
  return (await getSetting<ThemePref>(SETTINGS_KEYS.theme)) ?? "system";
}

export async function setThemePref(pref: ThemePref): Promise<void> {
  await setSetting(SETTINGS_KEYS.theme, pref);
}
