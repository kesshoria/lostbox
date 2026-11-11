// ============================================================
// Items page — Phase 3.
// Search bar now filters. Filter chips by status + recently
// updated. Sort dropdown: Recently updated / Name A–Z / Name Z–A.
// "No results" empty state when search returns nothing.
// ============================================================

import { useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate } from "react-router-dom";
import { Package, Plus, Search, X } from "lucide-react";

import { AppShell } from "@/components/layout";
import {
  Button,
  EmptyState,
  Spinner,
} from "@/components/ui";
import { ItemFormModal } from "@/components/items/ItemFormModal";
import { ItemRow } from "@/components/items/ItemRow";
import { FilterChip } from "@/components/items/FilterChip";
import { db } from "@/db";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { buildSearchableItems, searchItems } from "@/lib/search";
import {
  applyFilter,
  applySort,
  computeFilterCounts,
  type FilterKey,
  type SortKey,
} from "@/lib/itemsFilter";
import type { Item } from "@/lib/types";

export function ItemsPage() {
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);

  // Search + filter + sort state.
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const debouncedQuery = useDebouncedValue(query, 200);

  // Pagination: show the first PAGE_SIZE items, then a "Load more" button
  // to expand the visible window by PAGE_SIZE more. Resetting on search /
  // filter / sort changes keeps the user on the freshest results.
  const PAGE_SIZE = 50;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Reset the visible count whenever search/filter/sort changes — the
  // user is starting a new "view" so we collapse back to the first 50.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [debouncedQuery, filter, sort]);

  // All items + name maps.
  const data = useLiveQuery(async () => {
    const [items, locs, cons] = await Promise.all([
      db.items.orderBy("updatedAt").reverse().toArray(),
      db.locations.toArray(),
      db.containers.toArray(),
    ]);
    const locNames: Record<string, string> = {};
    for (const l of locs) locNames[l.id] = l.name;
    const conNames: Record<string, string> = {};
    for (const c of cons) conNames[c.id] = c.name;
    return { items, locNames, conNames };
  }, []);

  // Build searchable view once per data change.
  const searchable = useMemo(() => {
    if (!data) return [];
    return buildSearchableItems(data.items, data.locNames, data.conNames);
  }, [data]);

  // Search first (cross-field text match), then filter, then sort.
  const filteredResults = useMemo(() => {
    if (!data) return [];
    const searched = searchItems(searchable, debouncedQuery);
    const filtered = applyFilter(searched, filter);
    const sorted = applySort(filtered, sort);
    return sorted;
  }, [searchable, debouncedQuery, filter, sort, data]);

  // Counts for the filter chips — based on the SEARCHED set, not the
  // full set, so they reflect the current search context.
  const filterCounts = useMemo(() => {
    if (!data) return null;
    const searched = searchItems(searchable, debouncedQuery);
    return computeFilterCounts(searched);
  }, [searchable, debouncedQuery, data]);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }
  function openItem(item: Item) {
    navigate(`/items/${item.id}`);
  }
  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }

  function clearSearch() {
    setQuery("");
  }

  const totalItems = data?.items.length ?? 0;
  const isSearching = debouncedQuery.trim().length > 0;
  const hasItems = totalItems > 0;

  // Empty-state decision tree:
  // - No items at all → "No items yet" empty state.
  // - Searching but no results → "No results for 'X'" empty state.
  // - Filter active but no results → "No items in this filter" empty state.
  let emptyState: React.ReactNode = null;
  if (data !== undefined) {
    if (totalItems === 0) {
      emptyState = (
        <EmptyState
          icon={<Package size={28} />}
          title="No items yet"
          description="Tap “Add item” to record the first thing you want to keep track of. Add a photo (Phase 5), location, and container so you can find it later."
          action={
            <Button variant="primary" onClick={openAdd}>
              <Plus size={18} /> Add item
            </Button>
          }
        />
      );
    } else if (filteredResults.length === 0 && isSearching) {
      emptyState = (
        <EmptyState
          icon={<Search size={28} />}
          title="No matching items"
          description={`No items match “${debouncedQuery.trim()}”. Check the spelling, try a shorter word, or add it.`}
          action={
            <Button variant="primary" onClick={openAdd}>
              <Plus size={18} /> Add this item
            </Button>
          }
        />
      );
    } else if (filteredResults.length === 0) {
      // Filter is active but has no results
      const filterLabel =
        filter === "borrowed"
          ? "borrowed"
          : filter === "lost"
            ? "missing / lost"
            : filter === "discarded"
              ? "discarded"
              : filter === "recent"
                ? "recently updated"
                : "matching";
      emptyState = (
        <EmptyState
          icon={<Package size={28} />}
          title={`No ${filterLabel} items`}
          description={
            filter === "borrowed"
              ? "Nothing is currently borrowed. When you mark an item as borrowed, it will show up here."
              : filter === "lost"
                ? "No items are marked as lost. Mark an item as Lost from the edit form if you can't find it."
                : filter === "discarded"
                  ? "No items have been discarded."
                  : filter === "recent"
                    ? "Nothing has been updated in the last 7 days."
                    : "Try a different filter or search."
          }
        />
      );
    }
  }

  return (
    <AppShell
      title="Items"
      subtitle="Everything you've logged"
      actions={
        <Button size="sm" onClick={openAdd}>
          <Plus size={18} /> Add
        </Button>
      }
    >
      <div className="app-container py-6 space-y-4">
        {/* Search bar — now functional. */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items by name, tag, location, container…"
            aria-label="Search items"
            autoComplete="off"
            className="block w-full h-12 rounded-card bg-surface-raised border border-border-strong pl-11 pr-10 text-body text-content-primary placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-content-muted hover:bg-surface-inset hover:text-content-primary"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Filter chips — only show when there are items. */}
        {hasItems && filterCounts && (
          <div
            role="group"
            aria-label="Filter items"
            className="flex flex-wrap gap-2"
          >
            <FilterChip
              selected={filter === "all"}
              onClick={() => setFilter("all")}
              count={filterCounts.all}
            >
              All
            </FilterChip>
            <FilterChip
              selected={filter === "borrowed"}
              onClick={() => setFilter("borrowed")}
              count={filterCounts.borrowed}
            >
              Borrowed
            </FilterChip>
            <FilterChip
              selected={filter === "lost"}
              onClick={() => setFilter("lost")}
              count={filterCounts.lost}
            >
              Lost
            </FilterChip>
            <FilterChip
              selected={filter === "recent"}
              onClick={() => setFilter("recent")}
              count={filterCounts.recent}
            >
              Recent
            </FilterChip>
            <FilterChip
              selected={filter === "discarded"}
              onClick={() => setFilter("discarded")}
              count={filterCounts.discarded}
            >
              Discarded
            </FilterChip>
          </div>
        )}

        {/* Sort row — only show when there are items + no full-screen empty state. */}
        {hasItems && (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-content-secondary">
              {filteredResults.length === 0
                ? "0 items"
                : `${filteredResults.length} item${filteredResults.length === 1 ? "" : "s"}`}
              {isSearching && (
                <span className="text-content-muted">
                  {" "}
                  for “{debouncedQuery.trim()}”
                </span>
              )}
            </p>
            <label className="text-sm text-content-secondary flex items-center gap-2">
              <span className="sr-only">Sort by</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="rounded-pill bg-surface-raised border border-border-strong px-3 py-1.5 text-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              >
                <option value="recent">Recently updated</option>
                <option value="name-asc">Name A–Z</option>
                <option value="name-desc">Name Z–A</option>
              </select>
            </label>
          </div>
        )}

        {/* Body — either empty state, loading spinner, or item list. */}
        {data === undefined ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : emptyState ? (
          emptyState
        ) : (
          <>
            <ul className="space-y-2.5" aria-label="Items list">
              {filteredResults.slice(0, visibleCount).map((s) => (
                <li key={s.item.id}>
                  <ItemRow
                    item={s.item}
                    locationName={s.locationName}
                    containerName={s.containerName}
                    onClick={() => openItem(s.item)}
                  />
                </li>
              ))}
            </ul>

            {/* Load more — show only if there are more results than visible. */}
            {filteredResults.length > visibleCount && (
              <div className="pt-4 flex flex-col items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                >
                  Load 50 more
                </Button>
                <p className="text-xs text-content-muted">
                  Showing {visibleCount} of {filteredResults.length} items
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <ItemFormModal
        open={formOpen}
        onClose={closeForm}
        item={editing}
      />
    </AppShell>
  );
}
