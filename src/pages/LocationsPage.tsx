// ============================================================
// Locations page — Phase 2.
// Lists all locations with item counts. Add/edit/delete via modal.
// Edge case: deleting a location with items warns + offers to
// proceed (items will keep their names but lose their location).
// ============================================================

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { MapPin, Plus, Pencil, Trash2 } from "lucide-react";

import { AppShell } from "@/components/layout";
import {
  Button,
  Card,
  EmptyState,
  Spinner,
  ConfirmDialog,
  useToast,
} from "@/components/ui";
import { LocationFormModal } from "@/components/locations/LocationFormModal";
import { db } from "@/db";
import { deleteLocation } from "@/db/locations";
import { formatRelative } from "@/lib/format";
import type { Location } from "@/lib/types";

export function LocationsPage() {
  const toast = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Location | null>(null);
  const [deleting, setDeleting] = useState<Location | null>(null);

  // Live data: locations + item counts in one query.
  // useLiveQuery re-runs whenever the underlying tables change.
  const data = useLiveQuery(async () => {
    const [locs, items] = await Promise.all([
      db.locations.orderBy("name").toArray(),
      db.items.toArray(),
    ]);
    const counts: Record<string, number> = {};
    for (const item of items) {
      if (item.locationId) {
        counts[item.locationId] = (counts[item.locationId] ?? 0) + 1;
      }
    }
    return { locs, counts };
  }, []);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(loc: Location) {
    setEditing(loc);
    setFormOpen(true);
  }
  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }

  async function handleDelete() {
    if (!deleting) return;
    const { itemsAffected } = await deleteLocation(deleting.id);
    if (itemsAffected > 0) {
      toast.success(
        `Deleted “${deleting.name}”. ${itemsAffected} item${
          itemsAffected === 1 ? "" : "s"
        } lost their location.`,
      );
    } else {
      toast.success(`Deleted “${deleting.name}”.`);
    }
    setDeleting(null);
  }

  return (
    <AppShell
      title="Places"
      subtitle="Rooms, areas, and zones in your home"
      actions={
        <Button size="sm" onClick={openAdd}>
          <Plus size={18} /> Add
        </Button>
      }
    >
      <div className="app-container py-6 space-y-4">
        <p className="text-sm text-content-secondary">
          Locations are the top level — bedroom, garage, kitchen. Containers
          live inside them; items live in containers (or directly in a
          location).
        </p>

        {data === undefined ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : data.locs.length === 0 ? (
          <EmptyState
            icon={<MapPin size={28} />}
            title="No locations yet"
            description="Add the places in your home — bedroom, garage, kitchen — then assign containers and items to them."
            action={
              <Button variant="primary" onClick={openAdd}>
                <Plus size={18} /> Add a location
              </Button>
            }
          />
        ) : (
          <ul className="space-y-2.5" aria-label="Locations list">
            {data.locs.map((loc) => {
              const count = data.counts[loc.id] ?? 0;
              return (
                <li key={loc.id}>
                  <Card padding="none" interactive>
                    <div className="flex items-center gap-3 p-4">
                      <div
                        aria-hidden="true"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent"
                      >
                        <MapPin size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-content-primary truncate">
                          {loc.name}
                        </p>
                        <p className="text-sm text-content-secondary truncate">
                          {count === 0
                            ? "No items"
                            : `${count} item${count === 1 ? "" : "s"}`}
                          {loc.updatedAt
                            ? ` · updated ${formatRelative(loc.updatedAt)}`
                            : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(loc)}
                          aria-label={`Edit ${loc.name}`}
                        >
                          <Pencil size={18} />
                        </Button>
                        <Button
                          variant="danger-ghost"
                          size="icon"
                          onClick={() => setDeleting(loc)}
                          aria-label={`Delete ${loc.name}`}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </div>
                    {loc.notes && (
                      <p className="px-4 pb-4 -mt-1 text-sm text-content-secondary">
                        {loc.notes}
                      </p>
                    )}
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <LocationFormModal
        open={formOpen}
        onClose={closeForm}
        location={editing}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title={`Delete “${deleting?.name ?? ""}”?`}
        description={
          (data?.counts[deleting?.id ?? ""] ?? 0) > 0 ? (
            <>
              This location has{" "}
              <strong>{data?.counts[deleting?.id ?? ""] ?? 0}</strong> item(s)
              in it. Those items will be kept, but their location will be
              cleared. You can re-assign them later.
            </>
          ) : (
            "This location has no items. You can safely delete it."
          )
        }
        confirmLabel="Delete"
        destructive
      />
    </AppShell>
  );
}
