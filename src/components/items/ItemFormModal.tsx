// ============================================================
// ItemFormModal — add or edit an Item.
// Fields: name (required), description, category, location,
// container (filtered by selected location), quantity, tags,
// status, photo (Phase 5).
// ============================================================

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  Field,
  Input,
  Textarea,
  Select,
  useFieldId,
} from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { createItem, updateItem, deleteItem } from "@/db/items";
import { db } from "@/db";
import { TagInput } from "./TagInput";
import { PhotoPicker } from "./PhotoPicker";
import type { Item, ItemStatus } from "@/lib/types";

interface ItemFormModalProps {
  open: boolean;
  onClose: () => void;
  item?: Item | null;
  // Optional: preselect a location for new items (when "Add item to this
  // location" is invoked from the locations page in a later phase).
  defaultLocationId?: string | null;
  defaultContainerId?: string | null;
}

// When the user picks a location, the container selector should only show
// containers that belong to that location (plus the "no container" option).
// We don't filter existing items that already point at a container in a
// different location, since editing shouldn't break existing data.

export function ItemFormModal({
  open,
  onClose,
  item,
  defaultLocationId,
  defaultContainerId,
}: ItemFormModalProps) {
  const isEdit = Boolean(item);
  const toast = useToast();

  // Field IDs for a11y
  const nameId = useFieldId("item-name");
  const descId = useFieldId("item-desc");
  const catId = useFieldId("item-cat");
  const locId = useFieldId("item-loc");
  const conId = useFieldId("item-con");
  const qtyId = useFieldId("item-qty");
  const statusId = useFieldId("item-status");

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [locationId, setLocationId] = useState<string>("");
  const [containerId, setContainerId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<ItemStatus>("home");
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [photoThumbnailBlob, setPhotoThumbnailBlob] = useState<Blob | null>(null);

  const [nameError, setNameError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Live data: locations, containers, existing categories (for datalist).
  const data = useLiveQuery(async () => {
    const [locs, cons, items] = await Promise.all([
      db.locations.orderBy("name").toArray(),
      db.containers.orderBy("name").toArray(),
      db.items.toArray(),
    ]);
    const categorySet = new Set<string>();
    for (const it of items) {
      if (it.category) categorySet.add(it.category);
    }
    return {
      locations: locs,
      containers: cons,
      categories: Array.from(categorySet).sort(),
    };
  }, []);

  // Containers filtered by the selected location.
  const visibleContainers = useMemo(() => {
    if (!data) return [];
    if (!locationId) return data.containers; // unfiltered
    return data.containers.filter((c) => c.locationId === locationId);
  }, [data, locationId]);

  // Reset form whenever the modal opens (or item changes).
  useEffect(() => {
    if (open) {
      setName(item?.name ?? "");
      setDescription(item?.description ?? "");
      setCategory(item?.category ?? "");
      setLocationId(item?.locationId ?? defaultLocationId ?? "");
      setContainerId(item?.containerId ?? defaultContainerId ?? "");
      setQuantity(item?.quantity ?? 1);
      setTags(item?.tags ?? []);
      setStatus(item?.status === "borrowed" ? "borrowed" : item?.status ?? "home");
      setPhotoBlob(item?.photoBlob ?? null);
      setPhotoThumbnailBlob(item?.photoThumbnailBlob ?? null);
      setNameError(null);
      setBusy(false);
    }
  }, [open, item, defaultLocationId, defaultContainerId]);

  // If the user changes location and the current container isn't in it,
  // clear the container so we don't save an inconsistent pair.
  useEffect(() => {
    if (!containerId) return;
    if (!visibleContainers.some((c) => c.id === containerId)) {
      // Only clear if we actually had containers in the new location; if there
      // are zero containers in the new location, we still clear (item ends up
      // with no container).
      setContainerId("");
    }
  }, [visibleContainers, containerId]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("Name is required.");
      return;
    }
    setNameError(null);
    setBusy(true);

    // Coerce quantity to a positive integer.
    const qty = Number.isFinite(quantity) && quantity >= 1
      ? Math.floor(quantity)
      : 1;

    const payload = {
      name: trimmedName,
      description: description.trim() || null,
      category: category.trim() || null,
      locationId: locationId || null,
      containerId: containerId || null,
      quantity: qty,
      tags,
      status,
      photoBlob,
      photoThumbnailBlob,
    };

    const op = isEdit
      ? updateItem(item!.id, payload)
      : createItem(payload);

    op
      .then(() => {
        toast.success(isEdit ? "Item updated." : "Item saved.");
        onClose();
      })
      .catch((err) => {
        console.error(err);
        // Surface a friendly message for storage-full or unsupported-browser errors.
        const msg = err instanceof Error ? err.message : "";
        if (/quota/i.test(msg) || /storage/i.test(msg)) {
          toast.error(
            "Your browser's storage is full. Try removing some photos or older items, then try again.",
          );
        } else {
          toast.error("Could not save item. Please try again.");
        }
        setBusy(false);
      });
  }

  // Delete opens a confirmation dialog first — per the brief, all
  // destructive actions require confirmation.
  async function handleDelete() {
    if (!item) return;
    setConfirmDeleteOpen(false);
    setBusy(true);
    try {
      await deleteItem(item.id);
      toast.success(`Deleted “${item.name}”.`);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Could not delete item.");
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={isEdit ? "Edit item" : "Add an item"}
      description={
        isEdit
          ? "Update the details of this item."
          : "Record what it is and where it lives so you can find it later."
      }
      footer={
        <>
          {isEdit && (
            <Button
              variant="danger-ghost"
              onClick={() => setConfirmDeleteOpen(true)}
              disabled={busy}
              className="mr-auto"
            >
              Delete
            </Button>
          )}
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="item-form"
            loading={busy}
            disabled={busy}
          >
            {isEdit ? "Save changes" : "Save item"}
          </Button>
        </>
      }
    >
      <form id="item-form" onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Name"
          htmlFor={nameId}
          required
          error={nameError}
          helper="What is it? Be specific: “HDMI cable”, “Blue umbrella”."
        >
          <Input
            id={nameId}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="HDMI cable"
            autoFocus
            autoComplete="off"
            maxLength={120}
            invalid={Boolean(nameError)}
            disabled={busy}
          />
        </Field>

        <PhotoPicker
          thumbBlob={photoThumbnailBlob}
          onPhotoSelected={(full, thumb) => {
            setPhotoBlob(full);
            setPhotoThumbnailBlob(thumb);
          }}
          onPhotoRemoved={() => {
            setPhotoBlob(null);
            setPhotoThumbnailBlob(null);
          }}
          disabled={busy}
        />

        <Field
          label="Description / notes"
          htmlFor={descId}
          helper="Optional. Color, condition, where you got it — anything that helps."
        >
          <Textarea
            id={descId}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Black, 2m, braided cable…"
            rows={3}
            maxLength={1000}
            disabled={busy}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Category"
            htmlFor={catId}
            helper="Optional. Type a new one or pick an existing."
          >
            <Input
              id={catId}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Electronics"
              list="item-categories"
              autoComplete="off"
              maxLength={60}
              disabled={busy}
            />
            <datalist id="item-categories">
              {(data?.categories ?? []).map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>

          <Field label="Quantity" htmlFor={qtyId} helper="Default is 1.">
            <Input
              id={qtyId}
              type="number"
              min={1}
              step={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              disabled={busy}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Location"
            htmlFor={locId}
            helper="Where in your home is it?"
          >
            <Select
              id={locId}
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              disabled={busy}
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
            label="Container"
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
        </div>

        <TagInput
          id="item-tags"
          label="Tags"
          value={tags}
          onChange={setTags}
          disabled={busy}
          helper="Type a tag and press Enter. Helps with search later."
        />

        <Field
          label="Status"
          htmlFor={statusId}
          helper="Mark as Lost if you can't find it. Borrowed is set when someone takes it."
        >
          <Select
            id={statusId}
            value={status}
            onChange={(e) => setStatus(e.target.value as ItemStatus)}
            disabled={busy}
          >
            <option value="home">Home</option>
            <option value="lost">Lost</option>
            <option value="discarded">Discarded</option>
            {item?.status === "borrowed" && (
              <option value="borrowed">Borrowed</option>
            )}
          </Select>
        </Field>
      </form>

      {/* Confirmation dialog for deleting an item. Stacked above the
          edit modal — both modals remain mounted, the ConfirmDialog
          is z-indexed on top because it's rendered later. */}
      <ConfirmDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title={`Delete “${item?.name ?? ""}”?`}
        description={
          <>
            This item will be permanently removed from your list. Its borrow
            history is kept as an audit trail, but you won't be able to find
            the item by name or by its location anymore.
          </>
        }
        confirmLabel="Delete item"
        destructive
      />
    </Modal>
  );
}
