// ============================================================
// Verification helpers — "Still here" feature (v0.1.3).
//
// An item's `lastSeenAt` timestamp records the last time the user
// confirmed the item is still where it's recorded to be. Over time
// that record goes stale, and we want to surface that visually so
// the user knows "maybe go check, this might have moved".
//
// Thresholds:
//   - 0–29 days  → "fresh"   (no hint shown)
//   - 30–89 days → "stale"   (faded "verified N days ago" hint)
//   - 90+ days   → "overdue" (warning tone + appears in
//                             "Needs check" filter)
//   - null       → "overdue" (never verified — pre-feature items
//                             or imported without the field)
// ============================================================

export const STALE_HINT_DAYS = 30;
export const STALE_WARN_DAYS = 90;

export type VerificationStatus = "fresh" | "stale" | "overdue";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Classify how stale an item's `lastSeenAt` is.
 * Returns "overdue" for null/invalid timestamps so the UI and filter
 * treat "never verified" the same as "verified a long time ago".
 */
export function getVerificationStatus(
  lastSeenAt: string | null | undefined,
  now: Date = new Date(),
): VerificationStatus {
  if (!lastSeenAt) return "overdue";
  const then = new Date(lastSeenAt).getTime();
  if (Number.isNaN(then)) return "overdue";
  const ageDays = (now.getTime() - then) / MS_PER_DAY;
  if (ageDays >= STALE_WARN_DAYS) return "overdue";
  if (ageDays >= STALE_HINT_DAYS) return "stale";
  return "fresh";
}

/**
 * True if an item should appear in the "Needs check" filter —
 * i.e. lastSeenAt is older than STALE_WARN_DAYS or missing entirely.
 */
export function needsVerification(
  lastSeenAt: string | null | undefined,
  now: Date = new Date(),
): boolean {
  return getVerificationStatus(lastSeenAt, now) === "overdue";
}
