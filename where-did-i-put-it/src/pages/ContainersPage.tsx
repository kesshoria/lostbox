// ============================================================
// Containers page — Phase 2.
// Lists all containers with parent location + item counts.
// Add/edit/delete via modal. Deleting warns about items in it.
// ============================================================

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Boxes, Plus, Pencil, Trash2, MapPin } from "lucide-react";

import { AppShell } from "@/components/layout";
import {
  Button,
  Card,
  EmptyState,
  Spinner,
  ConfirmDialog,
  useToast,
} from "@/components/ui";
import { ContainerFormModal } from "@/components/containers/ContainerFormModal";
import { db } from "@/db";
import { deleteContainer } from "@/db/containers";
import { formatRelative } from "@/lib/format";
import type { Container } from "@/lib/types";

export function ContainersPage() {
  const toast = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Container | null>(null);
  const [deleting, setDeleting] = useState<Container | null>(null);

  // Live data: containers + locations map + item counts.
  const data = useLiveQuery(async () => {
    const [cons, locs, items] = await Promise.all([
      db.containers.orderBy("name").toArray(),
      db.locations.toArray(),
      db.items.toArray(),
    ]);
    const locMap: Record<string, string> = {};
    for (const loc of locs) locMap[loc.id] = loc.name;
    const counts: Record<string, number> = {};
    for (const item of items) {
      if (item.containerId) {
        counts[item.containerId] = (counts[item.containerId] ?? 0) + 1;
      }
    }
    return { cons, locMap, counts };
  }, []);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(c: Container) {
    setEditing(c);
    setFormOpen(true);
  }
  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }

  async function handleDelete() {
    if (!deleting) return;
    const { itemsAffected } = await deleteContainer(deleting.id);
    if (itemsAffected > 0) {
      toast.success(
        `Deleted “${deleting.name}”. ${itemsAffected} item${
          itemsAffected === 1 ? "" : "s"
        } lost their container.`,
      );
    } else {
      toast.success(`Deleted “${deleting.name}”.`);
    }
    setDeleting(null);
  }

  return (
    <AppShell
      title="Boxes"
      subtitle="Drawers, shelves, bins, and containers"
      actions={
        <Button size="sm" onClick={openAdd}>
          <Plus size={18} /> Add
        </Button>
      }
    >
      <div className="app-container py-6 space-y-4">
        <p className="text-sm text-content-secondary">
          Containers live inside locations. A drawer, a shelf, a box, a bin —
          anything that holds items.
        </p>

        {data === undefined ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : data.cons.length === 0 ? (
          <EmptyState
            icon={<Boxes size={28} />}
            title="No containers yet"
            description="Add a drawer, a shelf, a box — then assign items to it so you can find them in seconds."
            action={
              <Button variant="primary" onClick={openAdd}>
                <Plus size={18} /> Add a container
              </Button>
            }
          />
        ) : (
          <ul className="space-y-2.5" aria-label="Containers list">
            {data.cons.map((con) => {
              const count = data.counts[con.id] ?? 0;
              const locName = con.locationId
                ? data.locMap[con.locationId]
                : null;
              return (
                <li key={con.id}>
                  <Card padding="none" interactive>
                    <div className="flex items-center gap-3 p-4">
                      <div
                        aria-hidden="true"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent"
                      >
                        <Boxes size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-content-primary truncate">
                          {con.name}
                        </p>
                        <p className="text-sm text-content-secondary truncate">
                          {locName ? (
                            <>
                              <MapPin
                                size={12}
                                className="inline -mt-0.5 mr-1 text-content-muted"
                                aria-hidden="true"
                              />
                              {locName}
                              {" · "}
                            </>
                          ) : (
                            <>
                              <span className="text-content-muted">
                                No location
                              </span>
                              {" · "}
                            </>
                          )}
                          {count === 0
                            ? "No items"
                            : `${count} item${count === 1 ? "" : "s"}`}
                          {con.updatedAt
                            ? ` · updated ${formatRelative(con.updatedAt)}`
                            : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(con)}
                          aria-label={`Edit ${con.name}`}
                        >
                          <Pencil size={18} />
                        </Button>
                        <Button
                          variant="danger-ghost"
                          size="icon"
                          onClick={() => setDeleting(con)}
                          aria-label={`Delete ${con.name}`}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </div>
                    {con.notes && (
                      <p className="px-4 pb-4 -mt-1 text-sm text-content-secondary">
                        {con.notes}
                      </p>
                    )}
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ContainerFormModal
        open={formOpen}
        onClose={closeForm}
        container={editing}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title={`Delete “${deleting?.name ?? ""}”?`}
        description={
          (data?.counts[deleting?.id ?? ""] ?? 0) > 0 ? (
            <>
              This container has{" "}
              <strong>{data?.counts[deleting?.id ?? ""] ?? 0}</strong> item(s)
              in it. Those items will be kept, but their container will be
              cleared. You can re-assign them later.
            </>
          ) : (
            "This container has no items. You can safely delete it."
          )
        }
        confirmLabel="Delete"
        destructive
      />
    </AppShell>
  );
}
