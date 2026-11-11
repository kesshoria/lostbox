// ============================================================
// Dexie database setup for "Where Did I Put It?"
//
// Schema version 1 — initial MVP.
// Future versions must add an upgrade() handler and bump the version
// number; never modify existing store schemas in place.
// ============================================================

import Dexie, { type Table } from "dexie";
import type {
  Item,
  Location,
  Container,
  BorrowRecord,
  ActivityEntry,
  Setting,
} from "@/lib/types";

export const DB_NAME = "where_did_i_put_it";
export const DB_VERSION = 1;

export class WhereDidIPutItDB extends Dexie {
  items!: Table<Item, string>;
  locations!: Table<Location, string>;
  containers!: Table<Container, string>;
  borrowRecords!: Table<BorrowRecord, string>;
  activityLog!: Table<ActivityEntry, string>;
  settings!: Table<Setting, string>;

  constructor() {
    super(DB_NAME);
    this.version(DB_VERSION).stores({
      // & = primary key, * = multi-entry (for arrays), + unique index
      items:
        "id, name, category, locationId, containerId, status, updatedAt, lastSeenAt, *tags",
      locations: "id, name",
      containers: "id, name, locationId",
      borrowRecords: "id, itemId, borrowerName, borrowedAt, returnedAt",
      activityLog: "id, itemId, action, createdAt",
      settings: "key",
    });
  }
}

// Singleton instance — every module imports the same one.
export const db = new WhereDidIPutItDB();

// Convenience: detect if IndexedDB is usable in the current browser.
// We check on demand rather than at module-load so SSR/test envs don't break.
export function isIndexedDbAvailable(): boolean {
  try {
    return (
      typeof indexedDB !== "undefined" &&
      typeof IDBKeyRange !== "undefined"
    );
  } catch {
    return false;
  }
}

// Wipe ALL user data from every store. Used by Settings → Clear all data.
// This is permanent and irreversible — caller MUST confirm first.
// Settings rows are also wiped (including theme — but theme is cached in
// localStorage so the app doesn't flash white after wipe).
export async function clearAllData(): Promise<void> {
  await Promise.all([
    db.items.clear(),
    db.locations.clear(),
    db.containers.clear(),
    db.borrowRecords.clear(),
    db.activityLog.clear(),
    db.settings.clear(),
  ]);
}
