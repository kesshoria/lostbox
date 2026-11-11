// Date/time formatting helpers.
// All user-facing date display goes through here so we can swap
// to locale-aware formatting or relative time consistently.

import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    if (isToday(d)) return `Today, ${format(d, "h:mm a")}`;
    if (isYesterday(d)) return `Yesterday, ${format(d, "h:mm a")}`;
    return format(d, "MMM d, yyyy");
  } catch {
    return "—";
  }
}

export function formatRelative(iso: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return "—";
  }
}

export function formatDateOnly(iso: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return format(d, "MMM d, yyyy");
  } catch {
    return "—";
  }
}

// Today's date as YYYY-MM-DD for <input type="date"> defaults.
export function todayDateInput(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Convert a YYYY-MM-DD input value to an ISO date string at local midnight.
export function dateInputToIso(value: string): string {
  // value is "YYYY-MM-DD" — make it a proper ISO date
  if (!value) return new Date().toISOString();
  return new Date(`${value}T00:00:00`).toISOString();
}
