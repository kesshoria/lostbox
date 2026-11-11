// ============================================================
// ImportModal — pick a JSON backup file, preview its contents,
// choose Replace or Merge mode, confirm and restore.
// ============================================================

import { useRef, useState } from "react";
import { Upload, AlertTriangle, FileJson } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  parseBackup,
  restoreBackup,
  readFileAsText,
  ImportValidationError,
  type ImportMode,
  type ImportResult,
} from "@/lib/import";
import type { BackupFile } from "@/lib/types";

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
}

// Format a byte count as a friendly string ("1.2 KB", "3 MB", etc.).
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImportModal({ open, onClose }: ImportModalProps) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorIssues, setErrorIssues] = useState<string[] | null>(null);
  const [backup, setBackup] = useState<BackupFile | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [mode, setMode] = useState<ImportMode>("replace");
  const [confirmOpen, setConfirmOpen] = useState(false);

  function reset() {
    setBusy(false);
    setError(null);
    setErrorIssues(null);
    setBackup(null);
    setFilename(null);
    setFileSize(null);
    setMode("replace");
    setConfirmOpen(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleClose() {
    if (busy) return;
    reset();
    onClose();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (inputRef.current) inputRef.current.value = "";
    if (!file) return;

    setError(null);
    setErrorIssues(null);
    setBackup(null);
    setFilename(file.name);
    setFileSize(file.size);

    try {
      const text = await readFileAsText(file);
      const parsed = parseBackup(text);
      setBackup(parsed);
    } catch (err) {
      if (err instanceof ImportValidationError) {
        setError(err.message);
        setErrorIssues(err.issues ?? null);
      } else {
        setError(err instanceof Error ? err.message : "Could not read file.");
      }
    }
  }

  function handlePickFile() {
    inputRef.current?.click();
  }

  async function handleConfirmImport() {
    if (!backup) return;
    setConfirmOpen(false);
    setBusy(true);
    try {
      const result: ImportResult = await restoreBackup(backup, mode);
      let msg: string;
      if (mode === "replace") {
        msg = `Imported ${result.itemCount} items, ${result.locationCount} locations, ${result.containerCount} containers, ${result.photoCount} photos. Existing data was replaced.`;
      } else {
        msg = `Merged ${result.itemCount} new items, ${result.locationCount} new locations, ${result.containerCount} new containers, ${result.photoCount} photos.`;
        if (result.skippedItems > 0 || result.skippedLocations > 0 || result.skippedContainers > 0) {
          msg += ` Skipped ${result.skippedItems} item(s), ${result.skippedLocations} location(s), ${result.skippedContainers} container(s) that already existed.`;
        }
      }
      toast.success(msg);
      reset();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Import failed. No data was changed.");
      setBusy(false);
    }
  }

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        title="Import backup"
        description="Restore data from a JSON file you previously exported."
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={handleClose} disabled={busy}>
              Cancel
            </Button>
            <Button
              onClick={() => setConfirmOpen(true)}
              disabled={!backup || busy}
              loading={busy}
            >
              <Upload size={18} /> Import data
            </Button>
          </>
        }
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileChange}
          disabled={busy}
          className="sr-only"
          aria-label="Choose a backup JSON file"
        />

        {!backup && !error && (
          <button
            type="button"
            onClick={handlePickFile}
            disabled={busy}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong bg-surface-inset py-8 text-content-muted hover:border-accent hover:text-accent hover:bg-accent-soft transition-colors"
          >
            <FileJson size={28} />
            <p className="text-sm font-medium">Choose a backup JSON file</p>
            <p className="text-xs">File exported from this app's Export feature</p>
          </button>
        )}

        {filename && !backup && !error && (
          <p className="mt-3 text-sm text-content-muted">Reading “{filename}”…</p>
        )}

        {error && (
          <div className="rounded-xl border border-status-lost/30 bg-status-lost/10 p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle
                size={18}
                className="shrink-0 text-status-lost mt-0.5"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-medium text-status-lost">
                  Could not import this file
                </p>
                <p className="mt-1 text-sm text-content-secondary">{error}</p>
                {errorIssues && errorIssues.length > 0 && (
                  <ul className="mt-2 list-disc list-inside text-xs text-content-muted space-y-0.5">
                    {errorIssues.map((issue, i) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handlePickFile}
              className="mt-3 text-sm text-accent hover:underline"
            >
              Try a different file
            </button>
          </div>
        )}

        {backup && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border-strong bg-surface-inset p-4">
              <div className="flex items-start gap-3">
                <FileJson
                  size={20}
                  className="shrink-0 text-accent mt-0.5"
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-content-primary truncate">
                    {filename}
                  </p>
                  <p className="text-xs text-content-muted">
                    Exported {new Date(backup.exportedAt).toLocaleString()}
                    {fileSize !== null && (
                      <> · {formatFileSize(fileSize)}</>
                    )}
                  </p>
                  {fileSize !== null && fileSize > 50 * 1024 * 1024 && (
                    <p className="mt-1.5 text-xs text-status-borrowed">
                      Large backup — import may take a few seconds. Please be patient.
                    </p>
                  )}
                </div>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-content-muted">Items</dt>
                  <dd className="font-medium text-content-primary">{backup.items.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-content-muted">Photos</dt>
                  <dd className="font-medium text-content-primary">{Object.keys(backup.photos).length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-content-muted">Locations</dt>
                  <dd className="font-medium text-content-primary">{backup.locations.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-content-muted">Containers</dt>
                  <dd className="font-medium text-content-primary">{backup.containers.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-content-muted">Borrow records</dt>
                  <dd className="font-medium text-content-primary">{backup.borrowRecords.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-content-muted">Activity entries</dt>
                  <dd className="font-medium text-content-primary">{backup.activityLog.length}</dd>
                </div>
              </dl>
            </div>

            <div>
              <p className="text-sm font-medium text-content-primary mb-2">
                Import mode
              </p>
              <div role="radiogroup" aria-label="Import mode" className="space-y-2">
                <label
                  className={[
                    "flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors",
                    mode === "replace"
                      ? "border-accent bg-accent-soft"
                      : "border-border-subtle bg-surface-raised hover:bg-surface-inset",
                  ].join(" ")}
                >
                  <input
                    type="radio"
                    name="import-mode"
                    value="replace"
                    checked={mode === "replace"}
                    onChange={() => setMode("replace")}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-sm font-medium text-content-primary">
                      Replace all data
                    </p>
                    <p className="text-xs text-content-secondary mt-0.5">
                      Wipe everything on this device first, then restore from
                      the backup. Recommended if you're moving from another device.
                    </p>
                  </div>
                </label>
                <label
                  className={[
                    "flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors",
                    mode === "merge"
                      ? "border-accent bg-accent-soft"
                      : "border-border-subtle bg-surface-raised hover:bg-surface-inset",
                  ].join(" ")}
                >
                  <input
                    type="radio"
                    name="import-mode"
                    value="merge"
                    checked={mode === "merge"}
                    onChange={() => setMode("merge")}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-sm font-medium text-content-primary">
                      Merge with existing data
                    </p>
                    <p className="text-xs text-content-secondary mt-0.5">
                      Add backup items, locations, and containers alongside
                      what's already here. Skip anything with the same ID. Use
                      this to combine two backups.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePickFile}
              disabled={busy}
              className="text-sm text-accent hover:underline"
            >
              Choose a different file
            </button>
          </div>
        )}
      </Modal>

      {/* Confirm dialog — different for replace vs merge */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={mode === "replace" ? "Replace all data?" : "Merge data?"}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button
              variant={mode === "replace" ? "danger" : "primary"}
              onClick={handleConfirmImport}
              loading={busy}
              disabled={busy}
            >
              {mode === "replace" ? "Replace everything" : "Merge data"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-content-secondary">
          {mode === "replace" ? (
            <>
              This will permanently <strong>delete all current data</strong> on this
              device and replace it with the contents of the backup. This can't be
              undone — export your current data first if you might want it later.
            </>
          ) : (
            <>
              Items, locations, and containers from the backup will be added to your
              current data. Anything with the same ID will be skipped (existing data
              wins). No existing data will be deleted.
            </>
          )}
        </p>
      </Modal>
    </>
  );
}
