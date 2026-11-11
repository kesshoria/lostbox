// ============================================================
// PhotoPicker — file input + preview + remove button + processing
// state. Used by ItemFormModal for the item's photo.
// ============================================================

import { useRef, useState } from "react";
import { ImagePlus, Trash2, Loader2 } from "lucide-react";
import { processPhoto, validatePhotoFile } from "@/lib/photos";
import { useObjectUrl } from "@/hooks/useObjectUrl";

interface PhotoPickerProps {
  // Currently selected thumbnail (or null if no photo).
  thumbBlob: Blob | null;
  // Called with new processed blobs (full + thumb) after a successful upload.
  onPhotoSelected: (full: Blob, thumb: Blob) => void;
  // Called when the user taps "Remove".
  onPhotoRemoved: () => void;
  disabled?: boolean;
}

export function PhotoPicker({
  thumbBlob,
  onPhotoSelected,
  onPhotoRemoved,
  disabled = false,
}: PhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewUrl = useObjectUrl(thumbBlob);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Always reset the input value so the same file can be re-picked later.
    if (inputRef.current) inputRef.current.value = "";

    if (!file) return;
    setError(null);

    // Quick pre-validation so we can show an error without trying to load.
    const preErr = validatePhotoFile(file);
    if (preErr) {
      setError(preErr);
      return;
    }

    setBusy(true);
    try {
      const { full, thumb } = await processPhoto(file);
      onPhotoSelected(full, thumb);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Could not process image.");
    } finally {
      setBusy(false);
    }
  }

  function handleClickPick() {
    inputRef.current?.click();
  }

  function handleRemove() {
    setError(null);
    onPhotoRemoved();
  }

  return (
    <div>
      {/* Hidden file input — we trigger it programmatically so the
          visible "button" can be styled properly. */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/bmp"
        onChange={handleFileChange}
        disabled={disabled || busy}
        className="sr-only"
        aria-label="Choose a photo"
      />

      <label className="block text-sm font-medium text-content-primary mb-1.5">
        Photo
      </label>

      {previewUrl ? (
        // Preview state — show the thumbnail + remove button
        <div className="flex items-center gap-3">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border-strong bg-surface-inset">
            <img
              src={previewUrl}
              alt="Selected photo preview"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-content-secondary">
              Photo selected.
            </p>
            <div className="mt-1.5 flex gap-2">
              <button
                type="button"
                onClick={handleClickPick}
                disabled={disabled || busy}
                className="inline-flex items-center gap-1.5 rounded-pill border border-border-strong bg-surface-raised px-3 py-1.5 text-sm font-medium text-content-primary hover:bg-surface-inset disabled:opacity-50"
              >
                <ImagePlus size={14} /> Replace
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled || busy}
                className="inline-flex items-center gap-1.5 rounded-pill border border-status-lost/30 text-status-lost px-3 py-1.5 text-sm font-medium hover:bg-status-lost/10 disabled:opacity-50"
              >
                <Trash2 size={14} /> Remove
              </button>
            </div>
          </div>
        </div>
      ) : busy ? (
        // Processing state — show a spinner placeholder
        <button
          type="button"
          disabled
          className="flex h-20 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong bg-surface-inset text-content-muted"
        >
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Processing photo…</span>
        </button>
      ) : (
        // Empty state — show a dashed-border drop target
        <button
          type="button"
          onClick={handleClickPick}
          disabled={disabled}
          className="flex h-20 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong bg-surface-inset text-content-muted hover:border-accent hover:text-accent hover:bg-accent-soft disabled:opacity-50 disabled:hover:border-border-strong disabled:hover:text-content-muted disabled:hover:bg-surface-inset transition-colors"
        >
          <ImagePlus size={18} />
          <span className="text-sm font-medium">Add a photo</span>
        </button>
      )}

      {error && (
        <p role="alert" className="mt-1.5 text-sm text-status-lost">
          {error}
        </p>
      )}

      <p className="mt-1.5 text-sm text-content-muted">
        Optional. Photos are compressed and stored on your device — never uploaded.
      </p>
    </div>
  );
}
