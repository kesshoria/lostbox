// ============================================================
// ItemDetailPage — Phase 4a.
// Full item view: name, photo placeholder, location, container,
// quantity, tags, description, status. Buttons to edit, move,
// mark borrowed/returned, delete. Activity log timeline at the
// bottom.
// Phase 4b will wire up the borrow modal; Phase 4c the move modal.
// ============================================================

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Boxes,
  Calendar,
  Clock,
  MapPin,
  Package,
  Pencil,
  Tag,
  Trash2,
  ArrowRightCircle,
  ArrowUpCircle,
  ArrowLeftCircle,
  ImageOff,
  BadgeCheck,
} from "lucide-react";

import { AppShell } from "@/components/layout";
import {
  Button,
  Card,
  Spinner,
  StatusBadge,
  EmptyState,
  ConfirmDialog,
  Modal,
  useToast,
} from "@/components/ui";
import { ItemFormModal } from "@/components/items/ItemFormModal";
import { ActivityTimeline } from "@/components/items/ActivityTimeline";
import { BorrowModal } from "@/components/items/BorrowModal";
import { MoveModal } from "@/components/items/MoveModal";
import { db } from "@/db";
import { deleteItem, markReturned, verifyItem } from "@/db/items";
import { useObjectUrl } from "@/hooks/useObjectUrl";
import { formatDate, formatRelative } from "@/lib/format";
import { getVerificationStatus } from "@/lib/verification";

export function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [editOpen, setEditOpen] = useState(false);
  const [borrowOpen, setBorrowOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmReturnOpen, setConfirmReturnOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Pull item + related data
  const data = useLiveQuery(async () => {
    if (!id) return null;
    const item = await db.items.get(id);
    if (!item) return null;
    const [location, container, activeBorrow] = await Promise.all([
      item.locationId ? db.locations.get(item.locationId) : undefined,
      item.containerId ? db.containers.get(item.containerId) : undefined,
      db.borrowRecords
        .where("itemId")
        .equals(id)
        .filter((r) => r.returnedAt === null)
        .first(),
    ]);
    return { item, location, container, activeBorrow };
  }, [id]);

  // Object URLs for the item's photo + thumbnail. Auto-revoked on
  // unmount/blob-change so we don't leak memory.
  // IMPORTANT: hooks must run on every render, regardless of loading state.
  // So we read item/photoBlob/... out of `data` defensively.
  const photoUrl = useObjectUrl(data?.item?.photoBlob);
  const thumbUrl = useObjectUrl(data?.item?.photoThumbnailBlob);

  // Loading state
  if (data === undefined) {
    return (
      <AppShell title="Item" subtitle="Loading…">
        <div className="app-container py-12 flex justify-center">
          <Spinner size="lg" />
        </div>
      </AppShell>
    );
  }

  // Not found
  if (data === null) {
    return (
      <AppShell title="Item not found" subtitle="">
        <div className="app-container py-12">
          <EmptyState
            icon={<Package size={28} />}
            title="Item not found"
            description="This item may have been deleted, or the link is wrong."
            action={
              <Button variant="primary" onClick={() => navigate("/items")}>
                Back to items
              </Button>
            }
          />
        </div>
      </AppShell>
    );
  }

  const { item, location, container, activeBorrow } = data;
  const verificationStatus = getVerificationStatus(item.lastSeenAt);

  function closeEdit() {
    setEditOpen(false);
  }

  async function handleDelete() {
    if (!item) return;
    setConfirmDeleteOpen(false);
    try {
      await deleteItem(item.id);
      toast.success(`Deleted “${item.name}”.`);
      navigate("/items");
    } catch (err) {
      console.error(err);
      toast.error("Could not delete item.");
    }
  }

  async function handleReturn() {
    if (!item || !activeBorrow) return;
    setConfirmReturnOpen(false);
    try {
      await markReturned(item.id);
      toast.success(
        `“${item.name}” marked as returned by ${activeBorrow.borrowerName}.`,
      );
    } catch (err) {
      console.error(err);
      toast.error("Could not mark as returned.");
    }
  }

  async function handleVerify() {
    if (!item) return;
    setVerifying(true);
    try {
      await verifyItem(item.id);
      toast.success(`Marked “${item.name}” as still here.`);
    } catch (err) {
      console.error(err);
      toast.error("Could not mark as still here.");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <AppShell
      title={item.name}
      subtitle={`Updated ${formatRelative(item.updatedAt)}`}
      actions={
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setEditOpen(true)}
        >
          <Pencil size={16} /> Edit
        </Button>
      }
    >
      <div className="app-container py-6 space-y-5">
        {/* Back link */}
        <button
          onClick={() => navigate("/items")}
          className="inline-flex items-center gap-1.5 text-sm text-content-secondary hover:text-content-primary transition-colors"
        >
          <ArrowLeft size={16} /> Back to items
        </button>

        {/* Header card — name + status + key info */}
        <Card padding="lg">
          <div className="flex items-start gap-4">
            {/* Thumbnail — shows the real photo if present, tappable to
                open the full-size image in a modal. */}
            <button
              type="button"
              onClick={() => photoUrl && setPhotoModalOpen(true)}
              disabled={!photoUrl}
              aria-label={photoUrl ? `View photo of ${item.name}` : `No photo for ${item.name}`}
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-surface-inset text-content-muted overflow-hidden border border-border-subtle transition-colors hover:border-border-strong disabled:cursor-default"
            >
              {thumbUrl ? (
                <img
                  src={thumbUrl}
                  alt={`Photo of ${item.name}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <Boxes size={24} />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold text-content-primary break-words">
                {item.name}
                {item.quantity > 1 && (
                  <span className="ml-2 text-base font-normal text-content-muted">
                    ×{item.quantity}
                  </span>
                )}
              </h1>
              <div className="mt-2">
                <StatusBadge status={item.status} />
              </div>
              {item.category && (
                <p className="mt-2 text-sm text-content-secondary">
                  <span className="text-content-muted">Category:</span>{" "}
                  {item.category}
                </p>
              )}
            </div>
          </div>

          {/* Active borrow banner (Phase 4b wires this up; the data
              layer already supports it) */}
          {activeBorrow && (
            <div className="mt-4 p-3 rounded-xl border border-status-borrowed/30 bg-status-borrowed/10">
              <p className="text-sm font-medium text-status-borrowed">
                Currently borrowed by {activeBorrow.borrowerName}
              </p>
              <p className="text-xs text-content-secondary mt-0.5">
                Borrowed {formatDate(activeBorrow.borrowedAt)}
                {activeBorrow.expectedReturnAt && (
                  <>
                    {" · "}Expected back {formatDate(activeBorrow.expectedReturnAt)}
                  </>
                )}
              </p>
              {activeBorrow.notes && (
                <p className="text-xs text-content-muted mt-1.5">
                  {activeBorrow.notes}
                </p>
              )}
            </div>
          )}
        </Card>

        {/* Where it lives — location + container */}
        <Card padding="md">
          <h2 className="text-sm font-semibold text-content-secondary uppercase tracking-wide mb-3">
            Where it lives
          </h2>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <MapPin
                size={16}
                className="shrink-0 text-content-muted"
                aria-hidden="true"
              />
              <span className="text-body text-content-primary">
                {location ? location.name : "No location set"}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Boxes
                size={16}
                className="shrink-0 text-content-muted"
                aria-hidden="true"
              />
              <span className="text-body text-content-primary">
                {container ? container.name : "No container set"}
              </span>
            </div>
          </div>

          {/* Verification status banner — only shown when stale or overdue.
              Fresh items (<30 days) get no banner to keep the UI calm. */}
          {verificationStatus !== "fresh" && (
            <div
              role="status"
              className={`mt-3 rounded-card border p-2.5 text-sm ${
                verificationStatus === "overdue"
                  ? "border-status-lost/30 bg-status-lost/10 text-status-lost"
                  : "border-status-borrowed/30 bg-status-borrowed/10 text-status-borrowed"
              }`}
            >
              {item.lastSeenAt ? (
                <p>
                  Last verified {formatRelative(item.lastSeenAt)}.
                  {verificationStatus === "overdue"
                    ? " Confirm it's still here?"
                    : " Maybe confirm it's still here?"}
                </p>
              ) : (
                <p>Never verified. Confirm it's still here?</p>
              )}
            </div>
          )}

          {/* Action buttons — move + verify */}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setMoveOpen(true)}
            >
              <ArrowRightCircle size={16} /> Change location
            </Button>
            <Button
              variant={verificationStatus === "fresh" ? "secondary" : "primary"}
              size="sm"
              onClick={handleVerify}
              loading={verifying}
            >
              <BadgeCheck size={16} /> Mark as still here
            </Button>
          </div>
        </Card>

        {/* Details: description, tags, dates */}
        <Card padding="md">
          <h2 className="text-sm font-semibold text-content-secondary uppercase tracking-wide mb-3">
            Details
          </h2>
          <dl className="space-y-3 text-sm">
            {item.description && (
              <div>
                <dt className="text-content-muted">Description</dt>
                <dd className="mt-0.5 text-body text-content-primary whitespace-pre-wrap">
                  {item.description}
                </dd>
              </div>
            )}
            {item.tags.length > 0 && (
              <div>
                <dt className="text-content-muted">Tags</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-pill bg-accent-soft text-accent border border-accent/20 px-2 py-0.5 text-xs font-medium"
                    >
                      <Tag size={10} aria-hidden="true" />
                      {tag}
                    </span>
                  ))}
                </dd>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <dt className="text-content-muted flex items-center gap-1">
                  <Calendar size={12} aria-hidden="true" /> Added
                </dt>
                <dd className="mt-0.5 text-body text-content-primary">
                  {formatDate(item.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-content-muted flex items-center gap-1">
                  <Clock size={12} aria-hidden="true" /> Last verified
                </dt>
                <dd
                  className={`mt-0.5 text-body ${
                    verificationStatus === "overdue"
                      ? "text-status-lost"
                      : verificationStatus === "stale"
                        ? "text-status-borrowed"
                        : "text-content-primary"
                  }`}
                >
                  {item.lastSeenAt ? formatRelative(item.lastSeenAt) : "Never"}
                </dd>
              </div>
            </div>
          </dl>
        </Card>

        {/* Action buttons — borrow/return, edit, delete */}
        <Card padding="md">
          <h2 className="text-sm font-semibold text-content-secondary uppercase tracking-wide mb-3">
            Actions
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {activeBorrow ? (
              <Button
                variant="secondary"
                size="md"
                onClick={() => setConfirmReturnOpen(true)}
              >
                <ArrowLeftCircle size={16} /> Mark returned
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="md"
                onClick={() => setBorrowOpen(true)}
              >
                <ArrowUpCircle size={16} /> Mark borrowed
              </Button>
            )}
            <Button
              variant="secondary"
              size="md"
              onClick={() => setMoveOpen(true)}
            >
              <ArrowRightCircle size={16} /> Change location
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setEditOpen(true)}
            >
              <Pencil size={16} /> Edit details
            </Button>
            <Button
              variant="danger-ghost"
              size="md"
              onClick={() => setConfirmDeleteOpen(true)}
            >
              <Trash2 size={16} /> Delete
            </Button>
          </div>
        </Card>

        {/* Activity timeline */}
        <Card padding="md">
          <h2 className="text-sm font-semibold text-content-secondary uppercase tracking-wide mb-4">
            History
          </h2>
          <ActivityTimeline itemId={item.id} />
        </Card>
      </div>

      {/* Edit modal */}
      <ItemFormModal
        open={editOpen}
        onClose={closeEdit}
        item={item}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title={`Delete “${item.name}”?`}
        description={
          <>
            This item will be permanently removed from your list. Its borrow
            history is kept as an audit trail, but you won't be able to find
            the item by name or by its location anymore.
          </>
        }
        confirmLabel="Delete item"
        destructive
      />

      {/* Borrow modal — Phase 4b */}
      <BorrowModal
        open={borrowOpen}
        onClose={() => setBorrowOpen(false)}
        item={item}
      />

      {/* Move modal — Phase 4c */}
      <MoveModal
        open={moveOpen}
        onClose={() => setMoveOpen(false)}
        item={item}
      />

      {/* Return confirmation */}
      <ConfirmDialog
        open={confirmReturnOpen}
        onClose={() => setConfirmReturnOpen(false)}
        onConfirm={handleReturn}
        title={`Mark “${item.name}” as returned?`}
        description={
          activeBorrow ? (
            <>
              This will mark the item as home. {activeBorrow.borrowerName}{" "}
              borrowed it on {formatDate(activeBorrow.borrowedAt)}.
            </>
          ) : (
            "This item isn't currently borrowed."
          )
        }
        confirmLabel="Mark returned"
      />

      {/* Full-size photo viewer */}
      <Modal
        open={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        title={`Photo of ${item.name}`}
        size="lg"
        footer={
          <Button variant="ghost" onClick={() => setPhotoModalOpen(false)}>
            Close
          </Button>
        }
      >
        {photoUrl ? (
          <div className="flex justify-center">
            <img
              src={photoUrl}
              alt={`Photo of ${item.name}`}
              className="max-w-full max-h-[60vh] rounded-xl object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center text-center py-8 text-content-muted">
            <ImageOff size={28} className="mb-3" />
            <p className="text-sm">This item doesn't have a photo.</p>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
