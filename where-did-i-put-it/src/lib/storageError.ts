// ============================================================
// Storage error handling — friendly errors for the three failure
// modes that can happen with IndexedDB:
//   1. Browser doesn't support IndexedDB at all (very old, or
//      private mode in some browsers that disable it).
//   2. Storage quota exceeded (rare, but happens with hundreds of
//      photos).
//   3. Generic write failure (corruption, browser bug, etc.).
//
// All DB write functions should wrap their writes in try/catch and
// re-throw a StorageError with a friendly message via
// `wrapStorageError(...)`.
// ============================================================

import { isIndexedDbAvailable } from "@/db";

export class StorageError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "StorageError";
  }
}

// Detect what kind of storage error this is based on the error name + message.
export function classifyStorageError(err: unknown): StorageError {
  const originalMessage = err instanceof Error ? err.message : String(err);
  const name = (err as { name?: string })?.name ?? "";

  // Quota exceeded
  if (
    name === "QuotaExceededError" ||
    name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    /quota/i.test(originalMessage)
  ) {
    return new StorageError(
      "Your browser's storage is full. Try removing some photos or older items, then try again.",
      err,
    );
  }

  // IndexedDB not available (private mode in some browsers)
  if (!isIndexedDbAvailable()) {
    return new StorageError(
      "This browser doesn't support local storage (IndexedDB). Try a different browser, or disable private/incognito mode.",
      err,
    );
  }

  // Unknown — return the original message wrapped
  return new StorageError(
    `Could not save data: ${originalMessage}. Please try again, or reload the app.`,
    err,
  );
}

// Wrap a promise-returning operation so storage errors are converted to
// friendly StorageError instances. Callers can `catch` and check
// `instanceof StorageError` for friendlier messages.
export async function withStorageError<T>(op: () => Promise<T>): Promise<T> {
  try {
    return await op();
  } catch (err) {
    throw classifyStorageError(err);
  }
}
