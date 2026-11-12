// ============================================================
// Import — parse + validate a JSON backup file, restore data.
//
// Per the brief:
//   - Validate the JSON structure with Zod; show clear errors for
//     invalid/corrupted files.
//   - Support "replace" (wipe current data, restore from backup) and
//     "merge" (add backup data alongside existing).
//   - Handle older backup versions gracefully — fill in missing fields
//     with sensible defaults.
//   - Restore photos from base64 back to Blobs in IndexedDB.
//
// Import IS destructive in "replace" mode. Caller must confirm first.
// ============================================================

import { z } from "zod";
import { db } from "@/db";
import { clearAllData } from "@/db/index";
import { BACKUP_VERSION, type BackupFile, type Item } from "@/lib/types";

// ---------- Zod schema ----------

const isoString = z.string().min(1);

const itemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().nullable(),
  description: z.string().nullable(),
  locationId: z.string().nullable(),
  containerId: z.string().nullable(),
  quantity: z.number().int().min(1).default(1),
  tags: z.array(z.string()).default([]),
  status: z.enum(["home", "borrowed", "lost", "discarded"]).default("home"),
  createdAt: isoString,
  updatedAt: isoString,
  lastSeenAt: isoString.nullable(),
});

const locationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  notes: z.string().nullable(),
  createdAt: isoString,
  updatedAt: isoString,
});

const containerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  locationId: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: isoString,
  updatedAt: isoString,
});

const borrowRecordSchema = z.object({
  id: z.string().min(1),
  itemId: z.string().min(1),
  borrowerName: z.string().min(1),
  borrowedAt: isoString,
  expectedReturnAt: isoString.nullable(),
  returnedAt: isoString.nullable(),
  notes: z.string().nullable(),
});

const activityEntrySchema = z.object({
  id: z.string().min(1),
  itemId: z.string().min(1),
  action: z.enum(["created", "updated", "moved", "borrowed", "returned", "verified", "deleted"]),
  details: z.string().nullable(),
  createdAt: isoString,
});

const settingSchema = z.object({
  key: z.string().min(1),
  value: z.unknown(),
});

const photoEntrySchema = z.object({
  photo: z.string(),
  thumb: z.string(),
});

// The backup file schema. `app` and `version` are validated strictly;
// individual records use the per-record schemas above. `photos` is a
// map of itemId -> { photo, thumb } (both base64 data URLs).
const backupSchema = z.object({
  app: z.literal("where-did-i-put-it"),
  version: z.number().int().min(1),
  exportedAt: isoString,
  items: z.array(itemSchema),
  locations: z.array(locationSchema),
  containers: z.array(containerSchema),
  borrowRecords: z.array(borrowRecordSchema),
  activityLog: z.array(activityEntrySchema),
  settings: z.array(settingSchema),
  photos: z.record(z.string(), photoEntrySchema).default({}),
});

// ---------- Helpers ----------

// Decode a base64 data URL into a Blob. Throws if the data URL is malformed.
async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  if (!dataUrl.startsWith("data:")) {
    throw new Error("Photo entry is not a valid data URL.");
  }
  const res = await fetch(dataUrl);
  return res.blob();
}

// ---------- Public API ----------

export type ImportMode = "replace" | "merge";

export interface ImportResult {
  mode: ImportMode;
  itemCount: number;
  locationCount: number;
  containerCount: number;
  borrowRecordCount: number;
  activityEntryCount: number;
  photoCount: number;
  /** Items that were skipped because an item with the same id already existed (merge mode only). */
  skippedItems: number;
  /** Locations skipped (merge mode only). */
  skippedLocations: number;
  /** Containers skipped (merge mode only). */
  skippedContainers: number;
}

export class ImportValidationError extends Error {
  constructor(message: string, public issues?: string[]) {
    super(message);
    this.name = "ImportValidationError";
  }
}

// Parse + validate a JSON string into a BackupFile. Throws
// ImportValidationError with friendly issues if the structure is wrong.
export function parseBackup(jsonText: string): BackupFile {
  let raw: unknown;
  try {
    raw = JSON.parse(jsonText);
  } catch (err) {
    throw new ImportValidationError(
      "File isn't valid JSON. Make sure you selected a backup file exported from this app.",
    );
  }

  const parsed = backupSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => {
      const path = i.path.length > 0 ? i.path.join(".") : "(root)";
      return `${path}: ${i.message}`;
    });
    throw new ImportValidationError(
      "Backup file structure is invalid.",
      issues.slice(0, 10),
    );
  }

  // For now, we only support BACKUP_VERSION === 1. In the future, we'd
  // upgrade old versions here.
  if (parsed.data.version > BACKUP_VERSION) {
    throw new ImportValidationError(
      `This backup was made by a newer version of the app (v${parsed.data.version}). The current app only supports v${BACKUP_VERSION}. Please update the app and try again.`,
    );
  }

  return parsed.data as BackupFile;
}

// Restore data from a BackupFile into IndexedDB. Returns counts.
export async function restoreBackup(
  backup: BackupFile,
  mode: ImportMode,
): Promise<ImportResult> {
  // Decode photos first (in parallel) so we can attach them to items.
  const photoMap = new Map<string, { photo: Blob | null; thumb: Blob | null }>();
  const photoEntries = Object.entries(backup.photos);
  if (photoEntries.length > 0) {
    const results = await Promise.all(
      photoEntries.map(async ([itemId, entry]) => {
        try {
          const [photo, thumb] = await Promise.all([
            entry.photo ? dataUrlToBlob(entry.photo) : Promise.resolve(null),
            entry.thumb ? dataUrlToBlob(entry.thumb) : Promise.resolve(null),
          ]);
          return [itemId, { photo, thumb }] as const;
        } catch (err) {
          console.warn(`Skipping photo for ${itemId}:`, err);
          return [itemId, { photo: null, thumb: null }] as const;
        }
      }),
    );
    for (const [itemId, blobs] of results) {
      photoMap.set(itemId, blobs);
    }
  }

  // Track skipped counts (merge mode only).
  let skippedItems = 0;
  let skippedLocations = 0;
  let skippedContainers = 0;

  // In "replace" mode, wipe everything first.
  if (mode === "replace") {
    await clearAllData();
  }

  // Bulk-import everything in one transaction. In merge mode, we
  // check for existing IDs and skip if present.
  await db.transaction(
    "rw",
    [db.items, db.locations, db.containers, db.borrowRecords, db.activityLog, db.settings],
    async () => {
      // Locations
      if (mode === "replace") {
        await db.locations.bulkPut(backup.locations);
      } else {
        for (const loc of backup.locations) {
          if (await db.locations.get(loc.id)) {
            skippedLocations++;
          } else {
            await db.locations.put(loc);
          }
        }
      }

      // Containers
      if (mode === "replace") {
        await db.containers.bulkPut(backup.containers);
      } else {
        for (const c of backup.containers) {
          if (await db.containers.get(c.id)) {
            skippedContainers++;
          } else {
            await db.containers.put(c);
          }
        }
      }

      // Items — attach photos back from the photo map
      const itemsWithPhotos: Item[] = backup.items.map((item) => {
        const blobs = photoMap.get(item.id);
        return {
          ...item,
          photoBlob: blobs?.photo ?? null,
          photoThumbnailBlob: blobs?.thumb ?? null,
        };
      });

      if (mode === "replace") {
        await db.items.bulkPut(itemsWithPhotos);
      } else {
        for (const item of itemsWithPhotos) {
          if (await db.items.get(item.id)) {
            skippedItems++;
          } else {
            await db.items.put(item);
          }
        }
      }

      // Borrow records, activity log, settings — restore without skip
      // checks (these are append-only / overwrite-safe by nature).
      await db.borrowRecords.bulkPut(backup.borrowRecords);
      await db.activityLog.bulkPut(backup.activityLog);
      await db.settings.bulkPut(backup.settings);
    },
  );

  return {
    mode,
    itemCount: backup.items.length - skippedItems,
    locationCount: backup.locations.length - skippedLocations,
    containerCount: backup.containers.length - skippedContainers,
    borrowRecordCount: backup.borrowRecords.length,
    activityEntryCount: backup.activityLog.length,
    photoCount: photoEntries.length,
    skippedItems,
    skippedLocations,
    skippedContainers,
  };
}

// Read a File as text. Thin wrapper around FileReader.
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsText(file);
  });
}
