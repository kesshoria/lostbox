// ============================================================
// BorrowModal — marks an item as borrowed.
// Collects: borrower name (required), borrowed date (defaults
// to today), expected return date (optional), notes (optional).
// Calls items.markBorrowed which sets status + creates a borrow
// record + logs activity in one transaction.
// ============================================================

import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, useFieldId } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { markBorrowed } from "@/db/items";
import {
  dateInputToIso,
  formatDate,
  todayDateInput,
} from "@/lib/format";
import type { Item } from "@/lib/types";

interface BorrowModalProps {
  open: boolean;
  onClose: () => void;
  item: Item | null;
}

export function BorrowModal({ open, onClose, item }: BorrowModalProps) {
  const toast = useToast();

  const nameId = useFieldId("borrower-name");
  const dateId = useFieldId("borrow-date");
  const expectedId = useFieldId("expected-return");
  const notesId = useFieldId("borrow-notes");

  const [borrowerName, setBorrowerName] = useState("");
  const [borrowDate, setBorrowDate] = useState(todayDateInput());
  const [expectedReturn, setExpectedReturn] = useState("");
  const [notes, setNotes] = useState("");

  const [nameError, setNameError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Reset form when opening
  useEffect(() => {
    if (open) {
      setBorrowerName("");
      setBorrowDate(todayDateInput());
      setExpectedReturn("");
      setNotes("");
      setNameError(null);
      setDateError(null);
      setBusy(false);
    }
  }, [open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!item) return;

    const trimmedName = borrowerName.trim();
    if (!trimmedName) {
      setNameError("Borrower name is required.");
      return;
    }
    if (!borrowDate) {
      setDateError("Borrow date is required.");
      return;
    }

    // Validate expected return is after borrow date (if provided)
    if (expectedReturn) {
      const borrowed = new Date(borrowDate);
      const expected = new Date(expectedReturn);
      if (expected < borrowed) {
        setDateError("Expected return can't be before the borrow date.");
        return;
      }
    }

    setNameError(null);
    setDateError(null);
    setBusy(true);

    try {
      await markBorrowed(
        item.id,
        trimmedName,
        dateInputToIso(borrowDate),
        expectedReturn ? dateInputToIso(expectedReturn) : null,
        notes.trim() || null,
      );
      toast.success(`“${item.name}” marked as borrowed by ${trimmedName}.`);
      onClose();
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Could not mark as borrowed.";
      toast.error(msg);
      setBusy(false);
    }
  }

  if (!item) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Mark “${item.name}” as borrowed`}
      description="Who has it, and when should it come back?"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="borrow-form"
            loading={busy}
            disabled={busy}
          >
            Mark as borrowed
          </Button>
        </>
      }
    >
      <form id="borrow-form" onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Borrower name"
          htmlFor={nameId}
          required
          error={nameError}
          helper="Who has the item right now?"
        >
          <Input
            id={nameId}
            value={borrowerName}
            onChange={(e) => setBorrowerName(e.target.value)}
            placeholder="Jane"
            autoFocus
            autoComplete="off"
            maxLength={100}
            invalid={Boolean(nameError)}
            disabled={busy}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Borrowed on"
            htmlFor={dateId}
            required
            error={dateError}
          >
            <Input
              id={dateId}
              type="date"
              value={borrowDate}
              onChange={(e) => setBorrowDate(e.target.value)}
              max={todayDateInput()}
              invalid={Boolean(dateError)}
              disabled={busy}
            />
          </Field>

          <Field
            label="Expected back"
            htmlFor={expectedId}
            helper="Optional."
          >
            <Input
              id={expectedId}
              type="date"
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(e.target.value)}
              min={borrowDate || undefined}
              disabled={busy}
            />
          </Field>
        </div>

        <Field
          label="Notes"
          htmlFor={notesId}
          helper="Optional. Anything else worth remembering."
        >
          <Textarea
            id={notesId}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Returning after the trip…"
            rows={3}
            maxLength={500}
            disabled={busy}
          />
        </Field>

        {/* Helper showing the formatted dates */}
        {(borrowDate || expectedReturn) && (
          <p className="text-xs text-content-muted">
            {borrowDate && <>Borrowed on {formatDate(dateInputToIso(borrowDate))}</>}
            {expectedReturn && (
              <>
                {" · "}expected back {formatDate(dateInputToIso(expectedReturn))}
              </>
            )}
          </p>
        )}
      </form>
    </Modal>
  );
}
