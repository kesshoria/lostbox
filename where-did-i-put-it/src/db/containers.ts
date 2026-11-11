// ============================================================
// Container data-access layer
// ============================================================

import { db } from "./index";
import { logActivity } from "./activityLog";
import { uuid, nowIso } from "@/lib/uuid";
import type { Container, NewContainerInput, ContainerUpdate } from "@/lib/types";

export async function createContainer(input: NewContainerInput): Promise<Container> {
  const now = nowIso();
  const c: Container = {
    id: uuid(),
    name: input.name.trim(),
    locationId: input.locationId ?? null,
    notes: input.notes?.trim() ?? null,
    createdAt: now,
    updatedAt: now,
  };
  await db.containers.add(c);
  return c;
}

export async function getContainer(id: string): Promise<Container | undefined> {
  return db.containers.get(id);
}

export async function listContainers(): Promise<Container[]> {
  return db.containers.orderBy("name").toArray();
}

export async function listContainersByLocation(
  locationId: string,
): Promise<Container[]> {
  const all = await db.containers.where("locationId").equals(locationId).toArray();
  return all.sort((a, b) => a.name.localeCompare(b.name));
}

export async function updateContainer(id: string, patch: ContainerUpdate): Promise<void> {
  const existing = await db.containers.get(id);
  if (!existing) throw new Error("Container not found");
  await db.containers.update(id, {
    ...patch,
    name: patch.name !== undefined ? patch.name.trim() : existing.name,
    notes: patch.notes !== undefined ? (patch.notes?.trim() ?? null) : existing.notes,
    updatedAt: nowIso(),
  });
}

export async function deleteContainer(id: string): Promise<{ itemsAffected: number }> {
  return db.transaction("rw", db.containers, db.items, db.activityLog, async () => {
    const items = await db.items.where("containerId").equals(id).toArray();
    for (const item of items) {
      await db.items.update(item.id, {
        containerId: null,
        updatedAt: nowIso(),
      });
      await logActivity(item.id, "updated", "Container was deleted; container cleared.");
    }
    await db.containers.delete(id);
    return { itemsAffected: items.length };
  });
}

export async function countItemsInContainer(id: string): Promise<number> {
  return db.items.where("containerId").equals(id).count();
}
