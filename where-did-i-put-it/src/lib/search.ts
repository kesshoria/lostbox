// ============================================================
// Search utilities — pure functions for matching items against
// a free-text query. Used by the Home search bar (Phase 3b) and
// the Items page search + filters (Phase 3c).
//
// Rules per the brief:
//   - Case-insensitive
//   - Ignore leading/trailing whitespace
//   - Partial matches OK
//   - Multiple words: ALL words must match somewhere in the item record
//     (across name, description, category, tags, location, container)
//   - Match "hdmi tv" against an item named "HDMI cable" in container
//     "Drawer under TV" should return a hit.
// ============================================================

import type { Item } from "@/lib/types";

// A "searchable view" of an item — denormalized name strings so the
// matcher doesn't need to look up locations/containers on every match.
export interface SearchableItem {
  item: Item;
  // Lowercased strings — pre-computed once for fast matching.
  searchText: string;
  locationName: string | null;
  containerName: string | null;
}

// Build the searchable view from raw items + name maps.
// Lowercase everything once so the matcher just does substring checks.
export function buildSearchableItems(
  items: Item[],
  locNames: Record<string, string>,
  conNames: Record<string, string>,
): SearchableItem[] {
  return items.map((item) => {
    const locationName = item.locationId ? locNames[item.locationId] ?? null : null;
    const containerName = item.containerId ? conNames[item.containerId] ?? null : null;
    const fields = [
      item.name,
      item.description ?? "",
      item.category ?? "",
      item.tags.join(" "),
      locationName ?? "",
      containerName ?? "",
    ];
    return {
      item,
      locationName,
      containerName,
      // Join with spaces; multiple spaces collapse via the split below.
      searchText: fields.join(" ").toLowerCase(),
    };
  });
}

// Tokenize a query: lowercase, trim, split on whitespace, drop empties.
export function tokenizeQuery(query: string): string[] {
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 0);
}

// Match a single searchable item against a tokenized query.
// All tokens must match somewhere in the searchText (substring).
export function matchesQuery(s: SearchableItem, tokens: string[]): boolean {
  if (tokens.length === 0) return true;
  return tokens.every((token) => s.searchText.includes(token));
}

// Filter a list of searchable items by a raw query string.
export function searchItems(
  list: SearchableItem[],
  query: string,
): SearchableItem[] {
  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) return list;
  return list.filter((s) => matchesQuery(s, tokens));
}
