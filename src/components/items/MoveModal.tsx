// ============================================================
// MoveModal — change an item's location + container in one go.
// Pre-fills with the item's current values. Container selector
// is filtered by the selected location (same as ItemFormModal).
// Calls items.updateItem which auto-detects a "move" and logs
// it to the activity log with "moved" action.
// ============================================================

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Select, useFieldId } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { updateItem } from "@/db/items";
import { db } from "@/db";
import type { Item } from "@/lib/types";

interface MoveModalProps {
  open: boolean;
  onClose: () => void;
  item: Item | null;
}

export function MoveModal({ open, onClose, item }: MoveModalProps) {
  const toast = useToast();

  const locId = useFieldId("move-loc");
  const conId = useFieldId("move-con");

  const [locationId, setLocationId] = useState("");
  const [containerId, setContainerId] = useState("");
  const [busy, setBusy] = useState(false);

  // Locations + containers for the selectors.
  const data = useLiveQuery(async () => {
    const [locs, cons] = await Promise.all([
      db.locations.orderBy("name").toArray(),
      db.containers.orderBy("name").toArray(),
    ]);
    return { locations: locs, containers: cons };
  }, []);

  // Containers filtered by selected location.
  const visibleContainers = useMemo(() => {
    if (!data) return [];
    if (!locationId) return data.containers;
    return data.containers.filter((c) => c.locationId === locationId);
  }, [data, locationId]);

  // Reset form when opening
  useEffect(() => {
    if (open) {
      setLocationId(item?.locationId ?? "");
      setContainerId(item?.containerId ?? "");
      setBusy(false);
    }
  }, [open, item]);

  // If the user changes location and the current container isn't in it,
  // clear the container so we don't save an inconsistent pair.
  useEffect(() => {
    if (!containerId) return;
    if (!visibleContainers.some((c) => c.id === containerId)) {
      setContainerId("");
    }
  }, [visibleContainers, containerId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!item) return;
    setBusy(true);

    try {
      await updateItem(item.id, {
        locationId: locationId || null,
        containerId: containerId || null,
      });
      toast.success(`“${item.name}” moved.`);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Could not move item.");
      setBusy(false);
    }
  }

  if (!item) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Move “${item.name}”`}
      description="Pick a new location and container. The move will be recorded in the item's history."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="move-form"
            loading={busy}
            disabled={busy}
          >
            Move item
          </Button>
        </>
      }
    >
      <form id="move-form" onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="New location"
          htmlFor={locId}
          helper="Where in your home is it now?"
        >
          <Select
            id={locId}
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            disabled={busy}
            autoFocus
          >
            <option value="">— No location —</option>
            {(data?.locations ?? []).map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="New container"
          htmlFor={conId}
          helper={
            locationId
              ? "Drawers/shelves/boxes in this location."
              : "Pick a location first, or leave empty."
          }
        >
          <Select
            id={conId}
            value={containerId}
            onChange={(e) => setContainerId(e.target.value)}
            disabled={busy || visibleContainers.length === 0}
          >
            <option value="">— No container —</option>
            {visibleContainers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
      </form>
    </Modal>
  );
}
