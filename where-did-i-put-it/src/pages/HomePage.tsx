// ============================================================
// Home page — search + recently updated preview.
// Search bar filters items across name, tags, location, container.
// When no search is active, the top 5 most recently updated items
// are shown. Empty state (no items at all) shows a friendly prompt
// to add the first item.
//
// Mobile-first: results are stacked below the search bar (not a
// floating dropdown) so they're easy to tap with one hand.
// ============================================================

import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Search, Plus, PackageOpen, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { AppShell } from "@/components/layout";
import { Button, Card, EmptyState } from "@/components/ui";
import { ItemFormModal } from "@/components/items/ItemFormModal";
import { ItemRow } from "@/components/items/ItemRow";
import { db } from "@/db";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { buildSearchableItems, searchItems } from "@/lib/search";
import type { Item } from "@/lib/types";

export function HomePage() {
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 200);

  // Pull all items (not just 5) so search has the full dataset to filter.
  // We only show 5 in the "Recently updated" preview, but search needs all.
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

  // Build searchable view once per data change. useMemo so we don't
  // re-build on every keystroke.
  const searchable = useMemo(() => {
    if (!data) return [];
    return buildSearchableItems(data.items, data.locNames, data.conNames);
  }, [data]);

  // Filter on debounced query. Limit to 20 results to keep the page snappy
  // even on huge libraries — the user can refine their search to see more.
  const searchResults = useMemo(() => {
    if (!data) return [];
    const results = searchItems(searchable, debouncedQuery);
    return results.slice(0, 20);
  }, [searchable, debouncedQuery, data]);

  const isSearching = debouncedQuery.trim().length > 0;
  const hasItems = (data?.items.length ?? 0) > 0;

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

  return (
    <AppShell
      title="Where Did I Put It?"
      subtitle="Find anything in your home"
      actions={
        <Button size="sm" onClick={openAdd}>
          <Plus size={18} /> Add
        </Button>
      }
    >
      <div className="app-container py-6 space-y-6">
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
            placeholder="What are you looking for?"
            aria-label="Search your items"
            autoComplete="off"
            // Browsers add a default clear button on type=search; we add our
            // own so it works in all browsers + shows on mobile.
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

        {/* Searching state — show search results. */}
        {isSearching && (
          <section aria-label="Search results">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-content-secondary uppercase tracking-wide">
                {searchResults.length === 0
                  ? "No results"
                  : `${searchResults.length} result${searchResults.length === 1 ? "" : "s"}`}
                <span className="ml-1.5 text-content-muted normal-case tracking-normal">
                  for “{debouncedQuery.trim()}”
                </span>
              </h2>
            </div>

            {searchResults.length === 0 ? (
              <EmptyState
                icon={<Search size={28} />}
                title="No matching items"
                description={`No items match “${debouncedQuery.trim()}”. Check spelling, try a shorter word, or add the item if it doesn't exist yet.`}
                action={
                  <Button variant="primary" onClick={openAdd}>
                    <Plus size={18} /> Add this item
                  </Button>
                }
              />
            ) : (
              <ul className="space-y-2.5">
                {searchResults.map((s) => (
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
            )}
          </section>
        )}

        {/* Default state — no search active. */}
        {!isSearching && !hasItems && (
          <>
            <Card padding="lg">
              <div className="flex items-center gap-4">
                <div
                  aria-hidden="true"
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent"
                >
                  <Plus size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-content-primary">
                    Add your first item
                  </p>
                  <p className="text-sm text-content-secondary">
                    Note where it lives so you never lose it again.
                  </p>
                </div>
                <Button onClick={openAdd} size="md" className="shrink-0">
                  Add item
                </Button>
              </div>
            </Card>

            <EmptyState
              icon={<PackageOpen size={28} />}
              title="No items yet"
              description="Once you start adding things, they'll show up here. Search across names, tags, locations, and containers."
              action={
                <Button variant="primary" onClick={openAdd}>
                  <Plus size={18} /> Add your first item
                </Button>
              }
            />
          </>
        )}

        {!isSearching && hasItems && data && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-content-secondary uppercase tracking-wide">
                Recently updated
              </h2>
              <Link to="/items" className="text-sm text-accent hover:underline">
                See all →
              </Link>
            </div>
            <ul className="space-y-2.5">
              {data.items.slice(0, 5).map((item) => (
                <li key={item.id}>
                  <ItemRow
                    item={item}
                    locationName={
                      item.locationId ? data.locNames[item.locationId] : null
                    }
                    containerName={
                      item.containerId ? data.conNames[item.containerId] : null
                    }
                    onClick={() => openItem(item)}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <ItemFormModal open={formOpen} onClose={closeForm} item={editing} />
    </AppShell>
  );
}
