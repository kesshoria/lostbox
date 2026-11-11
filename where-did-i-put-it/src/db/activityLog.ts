// ============================================================
// Activity log helper — every mutation in the data layer
// writes an entry here so the audit trail is always complete.
// ============================================================

import { db } from "./index";
import { uuid, nowIso } from "@/lib/uuid";
import type { ActivityAction } from "@/lib/types";

export async function logActivity(
  itemId: string,
  action: ActivityAction,
  details: string | null = null,
): Promise<void> {
  try {
    await db.activityLog.add({
      id: uuid(),
      itemId,
      action,
      details,
      createdAt: nowIso(),
    });
  } catch (err) {
    // Activity logging must NEVER block a save — swallow + warn.
    console.warn("[activityLog] failed to write entry:", err);
  }
}
