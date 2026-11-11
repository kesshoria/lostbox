// ============================================================
// Items page filter + sort logic. Pure functions so they can be
// tested independently and reused.
// ============================================================

import type { ItemStatus } from "@/lib/types";
import type { SearchableItem } from "./search";

export type FilterKey =
  | "all"
  | "borrowed"
  | "lost"
  | "recent" // recently updated (last 7 days)
  | "discarded";

export type SortKey = "recent" | "name-asc" | "name-desc";

// Apply a filter to a list of searchable items.
export function applyFilter(
  list: SearchableItem[],
  filter: FilterKey,
  now: Date = new Date(),
): SearchableItem[] {
  if (filter === "all") return list;

  if (filter === "borrowed") {
    return list.filter((s) => s.item.status === "borrowed");
  }
  if (filter === "lost") {
    return list.filter((s) => s.item.status === "lost");
  }
  if (filter === "discarded") {
    return list.filter((s) => s.item.status === "discarded");
  }
  if (filter === "recent") {
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const cutoff = now.getTime() - sevenDaysMs;
    return list.filter((s) => new Date(s.item.updatedAt).getTime() >= cutoff);
  }

  return list;
}

// Apply a sort to a list of searchable items.
export function applySort(
  list: SearchableItem[],
  sort: SortKey,
): SearchableItem[] {
  const arr = [...list];
  if (sort === "recent") {
    // Most recently updated first
    arr.sort((a, b) => b.item.updatedAt.localeCompare(a.item.updatedAt));
  } else if (sort === "name-asc") {
    arr.sort((a, b) => a.item.name.localeCompare(b.item.name, undefined, { sensitivity: "base" }));
  } else if (sort === "name-desc") {
    arr.sort((a, b) => b.item.name.localeCompare(a.item.name, undefined, { sensitivity: "base" }));
  }
  return arr;
}

// Compute the count for each filter chip so the UI can show
// "Borrowed (3)" etc.
export function computeFilterCounts(list: SearchableItem[]): Record<FilterKey, number> {
  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  let borrowed = 0, lost = 0, discarded = 0, recent = 0;
  for (const s of list) {
    if (s.item.status === "borrowed") borrowed++;
    if (s.item.status === "lost") lost++;
    if (s.item.status === "discarded") discarded++;
    if (new Date(s.item.updatedAt).getTime() >= now - sevenDaysMs) recent++;
  }
  return {
    all: list.length,
    borrowed,
    lost,
    recent,
    discarded,
  };
}

// Type guard helper — turns ItemStatus into FilterKey
export function statusToFilter(status: ItemStatus): FilterKey | null {
  if (status === "borrowed") return "borrowed";
  if (status === "lost") return "lost";
  if (status === "discarded") return "discarded";
  return null;
}
