// ============================================================
// Photo utilities — compress + thumbnail generation.
//
// Per the brief:
//   - Photos are stored as Blobs in IndexedDB (not base64 strings)
//   - Compress uploaded images before storing
//   - Generate a small thumbnail when a photo is uploaded
//
// Strategy: load the source image into an offscreen <canvas>, downscale
// to fit within the target bounds, export as JPEG quality 85%. We
// choose JPEG because it's universally supported and dramatically
// smaller than PNG for photos. We use lossy compression deliberately;
// the user wants to FIND the item, not print it.
//
// All functions are pure and return Promises. No DOM-side-effects
// except creating/canvas/Blob (which we clean up by GC).
// ============================================================

export interface ProcessedPhoto {
  // The "full" image, max 1024px wide, JPEG q85. Suitable for the
  // detail page; small enough that 100+ photos don't blow up the DB.
  full: Blob;
  // The thumbnail, max 400px wide, JPEG q80. Used in list rows.
  thumb: Blob;
}

const MAX_FULL_WIDTH = 1024;
const MAX_FULL_HEIGHT = 1024;
const THUMB_WIDTH = 400;
const THUMB_HEIGHT = 400;
const FULL_QUALITY = 0.85;
const THUMB_QUALITY = 0.8;

// Maximum source file size — 10 MB. The browser will choke on a 50 MB
// RAW photo; users who have one can resize it externally first.
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp"];

// Validate the file BEFORE we try to process it.
export function validatePhotoFile(file: File): string | null {
  if (!file) return "No file selected.";
  if (file.size === 0) return "File is empty.";
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File is too large. Max ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB.`;
  }
  if (!ACCEPTED_TYPES.includes(file.type) && !file.type.startsWith("image/")) {
    return "File isn't an image. Use JPG, PNG, WEBP, or GIF.";
  }
  return null;
}

// Load a File/Blob into an HTMLImageElement, returning a promise that
// rejects if the image fails to decode.
function loadImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image. The file may be corrupted or in an unsupported format."));
    };
    img.src = url;
  });
}

// Compute the destination width/height that fits inside the max bounds
// while preserving the aspect ratio.
function fitWithin(
  srcW: number,
  srcH: number,
  maxW: number,
  maxH: number,
): { width: number; height: number } {
  if (srcW <= maxW && srcH <= maxH) {
    return { width: srcW, height: srcH };
  }
  const ratio = Math.min(maxW / srcW, maxH / srcH);
  return {
    width: Math.round(srcW * ratio),
    height: Math.round(srcH * ratio),
  };
}

// Draw the source image into a canvas at the target size, then export
// as a JPEG blob.
async function drawScaled(
  img: HTMLImageElement,
  targetW: number,
  targetH: number,
  quality: number,
): Promise<Blob> {
  // Create canvas at device pixel ratio for crispness, but cap at 2x
  // to avoid memory blowups on hi-DPI phones.
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = document.createElement("canvas");
  canvas.width = targetW * dpr;
  canvas.height = targetH * dpr;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context.");
  // Draw the image scaled to the canvas size
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // Export as JPEG. type "image/jpeg" with quality 0-1.
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Could not export image as JPEG."));
      },
      "image/jpeg",
      quality,
    );
  });
}

// Process an uploaded photo file. Returns the full-size + thumbnail blobs.
// Throws if the file can't be processed.
export async function processPhoto(file: File): Promise<ProcessedPhoto> {
  // Validate first — fast-fail with a friendly error message.
  const err = validatePhotoFile(file);
  if (err) throw new Error(err);

  // Load the source image into memory
  const img = await loadImage(file);

  // Compute sizes
  const fullFit = fitWithin(img.naturalWidth, img.naturalHeight, MAX_FULL_WIDTH, MAX_FULL_HEIGHT);
  const thumbFit = fitWithin(img.naturalWidth, img.naturalHeight, THUMB_WIDTH, THUMB_HEIGHT);

  // Draw both
  const [full, thumb] = await Promise.all([
    drawScaled(img, fullFit.width, fullFit.height, FULL_QUALITY),
    drawScaled(img, thumbFit.width, thumbFit.height, THUMB_QUALITY),
  ]);

  return { full, thumb };
}

// Convert a Blob into an object URL for display in <img src>.
// Caller is responsible for revoking when the image unmounts.
export function blobToObjectUrl(blob: Blob | null): string | null {
  if (!blob) return null;
  return URL.createObjectURL(blob);
}
