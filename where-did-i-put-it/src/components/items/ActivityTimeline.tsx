// ============================================================
// ActivityTimeline — vertical timeline of an item's history.
// Shows entries from the activity log with icons + relative time.
// ============================================================

import { useLiveQuery } from "dexie-react-hooks";
import {
  Plus,
  Pencil,
  ArrowRightCircle,
  ArrowLeftCircle,
  ArrowUpCircle,
  Trash2,
  Activity,
} from "lucide-react";
import { db } from "@/db";
import { formatRelative } from "@/lib/format";
import type { ActivityAction } from "@/lib/types";

const ICONS: Record<ActivityAction, typeof Plus> = {
  created: Plus,
  updated: Pencil,
  moved: ArrowRightCircle,
  borrowed: ArrowUpCircle,
  returned: ArrowLeftCircle,
  deleted: Trash2,
};

const LABELS: Record<ActivityAction, string> = {
  created: "Created",
  updated: "Updated",
  moved: "Moved",
  borrowed: "Borrowed",
  returned: "Returned",
  deleted: "Deleted",
};

const TONE_CLASSES: Record<ActivityAction, string> = {
  created: "bg-accent-soft text-accent",
  updated: "bg-surface-inset text-content-secondary",
  moved: "bg-accent-soft text-accent",
  borrowed: "bg-status-borrowed/15 text-status-borrowed",
  returned: "bg-accent-soft text-accent",
  deleted: "bg-status-lost/15 text-status-lost",
};

interface ActivityTimelineProps {
  itemId: string;
  // Limit the number of entries shown. Default: all.
  limit?: number;
}

export function ActivityTimeline({ itemId, limit }: ActivityTimelineProps) {
  const entries = useLiveQuery(
    async () => {
      const all = await db.activityLog
        .where("itemId")
        .equals(itemId)
        .toArray();
      const sorted = all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return limit ? sorted.slice(0, limit) : sorted;
    },
    [itemId, limit],
  );

  if (entries === undefined) {
    return (
      <p className="text-sm text-content-muted py-4">Loading history…</p>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="text-sm text-content-muted py-4">
        No activity yet. Actions like editing, moving, borrowing, and returning
        will show up here.
      </p>
    );
  }

  return (
    <ol className="space-y-3" aria-label="Activity timeline">
      {entries.map((entry, idx) => {
        const Icon = ICONS[entry.action] ?? Activity;
        const tone = TONE_CLASSES[entry.action] ?? "bg-surface-inset text-content-secondary";
        const isLast = idx === entries.length - 1;
        return (
          <li key={entry.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                aria-hidden="true"
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${tone}`}
              >
                <Icon size={14} />
              </div>
              {!isLast && (
                <div
                  aria-hidden="true"
                  className="w-px flex-1 bg-border-subtle mt-1"
                />
              )}
            </div>
            <div className="flex-1 min-w-0 pt-0.5 pb-3">
              <p className="text-sm font-medium text-content-primary">
                {LABELS[entry.action]}
                {entry.details && (
                  <span className="ml-1 text-content-secondary font-normal">
                    {entry.details}
                  </span>
                )}
              </p>
              <p className="text-xs text-content-muted">
                {formatRelative(entry.createdAt)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
