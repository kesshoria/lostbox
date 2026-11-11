// ============================================================
// Export — serialize all app data into a JSON backup file.
//
// Per the brief:
//   - Backup includes items, locations, containers, borrow records,
//     activity log, and settings.
//   - Photos are stored as base64 data URLs (because JSON can't hold
//     Blobs directly). Each photo is keyed by itemId.
//   - Backup file is versioned (BACKUP_VERSION constant in types.ts).
//
// Export does NOT modify any data. It only reads.
// ============================================================

import { db } from "@/db";
import { BACKUP_VERSION, type BackupFile } from "@/lib/types";

// Read a Blob as a base64 data URL string. Returns null if the blob is null.
function blobToDataUrl(blob: Blob | null): Promise<string | null> {
  if (!blob) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read photo as base64."));
    reader.readAsDataURL(blob);
  });
}

export interface ExportResult {
  json: string;
  filename: string;
  byteSize: number;
  itemCount: number;
  locationCount: number;
  containerCount: number;
  photoCount: number;
}

// Build the BackupFile object from current IndexedDB state.
// Photos are serialized in parallel for speed.
export async function buildBackup(): Promise<BackupFile> {
  const [items, locations, containers, borrowRecords, activityLog, settings] =
    await Promise.all([
      db.items.toArray(),
      db.locations.toArray(),
      db.containers.toArray(),
      db.borrowRecords.toArray(),
      db.activityLog.toArray(),
      db.settings.toArray(),
    ]);

  // Strip photoBlob + photoThumbnailBlob from items (we'll add them as
  // base64 in the `photos` map separately).
  const itemsWithoutBlobs: BackupFile["items"] = items.map((item) => {
    const { photoBlob, photoThumbnailBlob, ...rest } = item;
    return rest;
  });

  // Serialize photos in parallel.
  const photoEntries: Array<[string, { photo: string; thumb: string }]> = [];
  const photoResults = await Promise.all(
    items.map(async (item) => {
      if (!item.photoBlob && !item.photoThumbnailBlob) return null;
      const [photo, thumb] = await Promise.all([
        blobToDataUrl(item.photoBlob),
        blobToDataUrl(item.photoThumbnailBlob),
      ]);
      // If both are null, skip the entry entirely.
      if (!photo && !thumb) return null;
      return [
        item.id,
        { photo: photo ?? "", thumb: thumb ?? "" },
      ] as [string, { photo: string; thumb: string }];
    }),
  );
  for (const entry of photoResults) {
    if (entry) photoEntries.push(entry);
  }
  const photos: BackupFile["photos"] = Object.fromEntries(photoEntries);

  return {
    app: "where-did-i-put-it",
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    items: itemsWithoutBlobs,
    locations,
    containers,
    borrowRecords,
    activityLog,
    settings,
    photos,
  };
}

// Build the backup, serialize to JSON, and trigger a download in the browser.
// Returns metadata about the export for the toast message.
export async function exportBackup(): Promise<ExportResult> {
  const backup = await buildBackup();
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: "application/json" });

  // Filename: where-did-i-put-it-backup-YYYY-MM-DD-HHMM.json
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const timeStr = `${pad(now.getHours())}${pad(now.getMinutes())}`;
  const filename = `where-did-i-put-it-backup-${dateStr}-${timeStr}.json`;

  // Trigger a download via a temporary <a> element.
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  // Clean up after a tick — too soon and the download won't start.
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);

  return {
    json,
    filename,
    byteSize: blob.size,
    itemCount: backup.items.length,
    locationCount: backup.locations.length,
    containerCount: backup.containers.length,
    photoCount: Object.keys(backup.photos).length,
  };
}
