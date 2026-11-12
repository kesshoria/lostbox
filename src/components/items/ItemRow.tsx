// ============================================================
// ItemRow — single item card in the list.
// Shows: thumbnail (real photo if present), name, status badge,
// location/container, quantity, updated time.
// When the item's verification is stale (30+ days) or overdue
// (90+ days / never), shows a faded hint line so the user knows
// "maybe go check, this might have moved".
// Tap opens the item detail page (Phase 4a).
// ============================================================

import { MapPin, Boxes, Clock, BadgeCheck } from "lucide-react";
import { Card, StatusBadge } from "@/components/ui";
import { useObjectUrl } from "@/hooks/useObjectUrl";
import { formatRelative } from "@/lib/format";
import { getVerificationStatus } from "@/lib/verification";
import type { Item } from "@/lib/types";

interface ItemRowProps {
  item: Item;
  locationName?: string | null;
  containerName?: string | null;
  onClick?: () => void;
}

export function ItemRow({
  item,
  locationName,
  containerName,
  onClick,
}: ItemRowProps) {
  // Convert thumbnail blob to URL. Auto-revokes when blob changes or
  // component unmounts (useObjectUrl handles it).
  const thumbUrl = useObjectUrl(item.photoThumbnailBlob);

  // Staleness hint — only show a line when the verification is older
  // than 30 days (or never happened). Fresh items get no extra line.
  const verificationStatus = getVerificationStatus(item.lastSeenAt);
  const showVerificationHint = verificationStatus !== "fresh";

  return (
    <Card
      as="button"
      padding="none"
      interactive
      onClick={onClick}
      aria-label={`View ${item.name}`}
      className="w-full text-left"
    >
      <div className="flex items-stretch gap-3 p-3.5">
        {/* Thumbnail — real photo if present, else neutral placeholder. */}
        <div
          aria-hidden="true"
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-surface-inset text-content-muted overflow-hidden"
        >
          {thumbUrl ? (
            <img
              src={thumbUrl}
              alt=""
              className="h-full w-full object-cover"
              // Don't let a single broken image break the layout.
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <Boxes size={20} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-content-primary truncate">
              {item.name}
              {item.quantity > 1 && (
                <span className="ml-1.5 text-sm font-normal text-content-muted">
                  ×{item.quantity}
                </span>
              )}
            </p>
            <StatusBadge status={item.status} />
          </div>

          <div className="mt-1 space-y-0.5 text-sm text-content-secondary">
            {locationName ? (
              <p className="flex items-center gap-1.5 truncate">
                <MapPin
                  size={12}
                  className="shrink-0 text-content-muted"
                  aria-hidden="true"
                />
                <span className="truncate">{locationName}</span>
                {containerName && (
                  <span className="truncate text-content-muted">
                    {" · "}
                    {containerName}
                  </span>
                )}
              </p>
            ) : containerName ? (
              <p className="flex items-center gap-1.5 truncate">
                <Boxes
                  size={12}
                  className="shrink-0 text-content-muted"
                  aria-hidden="true"
                />
                <span className="truncate">{containerName}</span>
              </p>
            ) : (
              <p className="text-content-muted italic">No location set</p>
            )}

            <p className="flex items-center gap-1.5 text-content-muted">
              <Clock
                size={12}
                className="shrink-0"
                aria-hidden="true"
              />
              Updated {formatRelative(item.updatedAt)}
            </p>

            {showVerificationHint && (
              <p
                className={`flex items-center gap-1.5 ${
                  verificationStatus === "overdue"
                    ? "text-status-lost/80"
                    : "text-status-borrowed/80"
                }`}
              >
                <BadgeCheck
                  size={12}
                  className="shrink-0"
                  aria-hidden="true"
                />
                {item.lastSeenAt
                  ? `Verified ${formatRelative(item.lastSeenAt)}`
                  : "Never verified"}
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
