// ============================================================
// Location data-access layer
// ============================================================

import { db } from "./index";
import { logActivity } from "./activityLog";
import { uuid, nowIso } from "@/lib/uuid";
import type { Location, NewLocationInput, LocationUpdate } from "@/lib/types";

export async function createLocation(input: NewLocationInput): Promise<Location> {
  const now = nowIso();
  const loc: Location = {
    id: uuid(),
    name: input.name.trim(),
    notes: input.notes?.trim() ?? null,
    createdAt: now,
    updatedAt: now,
  };
  await db.locations.add(loc);
  return loc;
}

export async function getLocation(id: string): Promise<Location | undefined> {
  return db.locations.get(id);
}

export async function listLocations(): Promise<Location[]> {
  // Sorted by name A–Z for stable display.
  return db.locations.orderBy("name").toArray();
}

export async function updateLocation(id: string, patch: LocationUpdate): Promise<void> {
  const existing = await db.locations.get(id);
  if (!existing) throw new Error("Location not found");
  await db.locations.update(id, {
    ...patch,
    name: patch.name !== undefined ? patch.name.trim() : existing.name,
    notes: patch.notes !== undefined ? (patch.notes?.trim() ?? null) : existing.notes,
    updatedAt: nowIso(),
  });
}

export async function deleteLocation(id: string): Promise<{ itemsAffected: number }> {
  // Edge case: deleting a location with items. We don't hard-block;
  // we null the locationId on the affected items and log it per item.
  // Caller can choose to prevent this by checking countItemsAtLocation first.
  return db.transaction("rw", db.locations, db.items, db.containers, db.activityLog, async () => {
    const items = await db.items.where("locationId").equals(id).toArray();
    const containers = await db.containers.where("locationId").equals(id).toArray();

    for (const item of items) {
      await db.items.update(item.id, {
        locationId: null,
        updatedAt: nowIso(),
      });
      await logActivity(item.id, "updated", "Location was deleted; location cleared.");
    }
    for (const container of containers) {
      await db.containers.update(container.id, { locationId: null });
    }
    await db.locations.delete(id);
    return { itemsAffected: items.length };
  });
}

// How many items are stored at this location (regardless of container).
export async function countItemsAtLocation(id: string): Promise<number> {
  return db.items.where("locationId").equals(id).count();
}
