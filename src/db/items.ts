// ============================================================
// Item data-access layer — the core entity.
// Every mutation logs to the activity log and bumps updatedAt.
// ============================================================

import { db } from "./index";
import { logActivity } from "./activityLog";
import { uuid, nowIso } from "@/lib/uuid";
import type { Item, NewItemInput, ItemUpdate } from "@/lib/types";

export async function createItem(input: NewItemInput): Promise<Item> {
  const now = nowIso();
  const item: Item = {
    id: uuid(),
    name: input.name.trim(),
    category: input.category?.trim() || null,
    description: input.description?.trim() || null,
    locationId: input.locationId ?? null,
    containerId: input.containerId ?? null,
    quantity: input.quantity ?? 1,
    tags: input.tags ?? [],
    photoBlob: input.photoBlob ?? null,
    photoThumbnailBlob: input.photoThumbnailBlob ?? null,
    status: input.status ?? "home",
    createdAt: now,
    updatedAt: now,
    lastSeenAt: input.lastSeenAt ?? now,
  };
  await db.items.add(item);
  await logActivity(item.id, "created", `Item added: "${item.name}".`);
  return item;
}

export async function getItem(id: string): Promise<Item | undefined> {
  return db.items.get(id);
}

export async function listItems(): Promise<Item[]> {
  // Default: most recently updated first.
  return db.items.orderBy("updatedAt").reverse().toArray();
}

export async function updateItem(id: string, patch: ItemUpdate): Promise<void> {
  const existing = await db.items.get(id);
  if (!existing) throw new Error("Item not found");

  // Detect a "move" — locationId or containerId changed.
  const moved =
    (patch.locationId !== undefined && patch.locationId !== existing.locationId) ||
    (patch.containerId !== undefined && patch.containerId !== existing.containerId);

  const cleaned: ItemUpdate = {
    ...patch,
    name: patch.name !== undefined ? patch.name.trim() : existing.name,
    category:
      patch.category !== undefined
        ? patch.category?.trim() || null
        : existing.category,
    description:
      patch.description !== undefined
        ? patch.description?.trim() || null
        : existing.description,
    tags: patch.tags ?? existing.tags,
    updatedAt: nowIso(),
  };

  await db.items.update(id, cleaned);

  if (moved) {
    await logActivity(
      id,
      "moved",
      `Moved from ${describeLoc(existing)} to ${describeLoc({
        locationId: cleaned.locationId ?? existing.locationId,
        containerId: cleaned.containerId ?? existing.containerId,
      } as Partial<Item>)}.`,
    );
  } else {
    await logActivity(id, "updated", `Updated "${existing.name}".`);
  }
}

// Delete an item. Borrow records are kept as historical audit trail;
// the UI gracefully handles dangling references in the activity view.
export async function deleteItem(id: string): Promise<void> {
  return db.transaction("rw", db.items, db.borrowRecords, db.activityLog, async () => {
    const item = await db.items.get(id);
    await db.items.delete(id);
    if (item) {
      await logActivity(id, "deleted", `Deleted "${item.name}".`);
    }
  });
}

// Mark item as borrowed (creates borrow record + updates item status).
export async function markBorrowed(
  itemId: string,
  borrowerName: string,
  borrowedAt: string,
  expectedReturnAt: string | null,
  notes: string | null,
): Promise<void> {
  return db.transaction("rw", db.items, db.borrowRecords, db.activityLog, async () => {
    const item = await db.items.get(itemId);
    if (!item) throw new Error("Item not found");

    // Edge case: item already borrowed — don't create duplicate active records.
    const existingActive = await db.borrowRecords
      .where("itemId")
      .equals(itemId)
      .filter((r) => r.returnedAt === null)
      .first();
    if (existingActive) {
      throw new Error("Item is already borrowed. Mark it returned first.");
    }

    await db.borrowRecords.add({
      id: uuid(),
      itemId,
      borrowerName: borrowerName.trim(),
      borrowedAt,
      expectedReturnAt,
      returnedAt: null,
      notes: notes?.trim() || null,
    });
    await db.items.update(itemId, {
      status: "borrowed",
      updatedAt: nowIso(),
    });
    await logActivity(
      itemId,
      "borrowed",
      `Borrowed by ${borrowerName.trim()}.`,
    );
  });
}

// Mark the active borrow record as returned. Idempotent — safe to call twice.
export async function markReturned(itemId: string): Promise<void> {
  return db.transaction("rw", db.items, db.borrowRecords, db.activityLog, async () => {
    const item = await db.items.get(itemId);
    if (!item) throw new Error("Item not found");

    // Edge case: not actually borrowed — idempotent no-op.
    const active = await db.borrowRecords
      .where("itemId")
      .equals(itemId)
      .filter((r) => r.returnedAt === null)
      .first();
    if (!active) {
      return;
    }

    const now = nowIso();
    await db.borrowRecords.update(active.id, { returnedAt: now });
    await db.items.update(itemId, {
      status: "home",
      updatedAt: now,
      lastSeenAt: now,
    });
    await logActivity(itemId, "returned", `Returned by ${active.borrowerName}.`);
  });
}

// "Still here" verification — user confirms the item is still at its
// recorded location. Bumps lastSeenAt + updatedAt and logs a
// "verified" activity entry so the timeline shows it.
// Wrapped in a transaction so the bump + log stay consistent.
export async function verifyItem(itemId: string): Promise<void> {
  return db.transaction("rw", db.items, db.activityLog, async () => {
    const item = await db.items.get(itemId);
    if (!item) throw new Error("Item not found");

    const now = nowIso();
    await db.items.update(itemId, {
      lastSeenAt: now,
      updatedAt: now,
    });
    await logActivity(itemId, "verified", null);
  });
}

// Quick "I just laid eyes on this" — bumps lastSeenAt + updatedAt.
// Kept for backward compat / external callers; prefer verifyItem()
// for the user-facing "Still here" flow (it also writes an activity
// log entry). This one is silent (no activity log).
export async function touchLastSeen(itemId: string): Promise<void> {
  const now = nowIso();
  await db.items.update(itemId, { lastSeenAt: now, updatedAt: now });
}

// Helper: human-readable description for activity log entries.
function describeLoc(item: Partial<Item>): string {
  if (item.containerId && item.locationId) return "new container/location";
  if (item.locationId) return "new location";
  if (item.containerId) return "new container";
  return "unfiled";
}
