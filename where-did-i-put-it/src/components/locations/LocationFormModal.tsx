// ============================================================
// LocationFormModal — add or edit a Location.
// Used by LocationsPage. Two fields: name (required), notes.
// Validates name is non-empty (trimmed).
// ============================================================

import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, useFieldId } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { createLocation, updateLocation } from "@/db/locations";
import type { Location } from "@/lib/types";

interface LocationFormModalProps {
  open: boolean;
  onClose: () => void;
  // If provided, edit mode. Otherwise, add mode.
  location?: Location | null;
}

export function LocationFormModal({
  open,
  onClose,
  location,
}: LocationFormModalProps) {
  const isEdit = Boolean(location);
  const toast = useToast();

  const nameId = useFieldId("loc-name");
  const notesId = useFieldId("loc-notes");

  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Reset form whenever the modal opens (or location changes).
  useEffect(() => {
    if (open) {
      setName(location?.name ?? "");
      setNotes(location?.notes ?? "");
      setNameError(null);
      setBusy(false);
    }
  }, [open, location]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("Name is required.");
      return;
    }
    setNameError(null);
    setBusy(true);

    const op = isEdit
      ? updateLocation(location!.id, {
          name: trimmedName,
          notes: notes.trim() || null,
        })
      : createLocation({ name: trimmedName, notes: notes.trim() || null });

    op
      .then(() => {
        toast.success(isEdit ? "Location updated." : "Location added.");
        onClose();
      })
      .catch((err) => {
        console.error(err);
        toast.error("Could not save location. Please try again.");
        setBusy(false);
      });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit location" : "Add a location"}
      description={
        isEdit
          ? "Update the name or notes for this place."
          : "A place in your home — a room, a garage, a balcony."
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="location-form"
            loading={busy}
            disabled={busy}
          >
            {isEdit ? "Save changes" : "Add location"}
          </Button>
        </>
      }
    >
      <form id="location-form" onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Name"
          htmlFor={nameId}
          required
          error={nameError}
          helper="e.g. Bedroom, Garage, Kitchen pantry"
        >
          <Input
            id={nameId}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Bedroom"
            autoFocus
            autoComplete="off"
            maxLength={100}
            invalid={Boolean(nameError)}
            disabled={busy}
          />
        </Field>

        <Field
          label="Notes"
          htmlFor={notesId}
          helper="Optional. Anything that helps you remember this place."
        >
          <Textarea
            id={notesId}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Upstairs, second door on the right…"
            rows={3}
            maxLength={500}
            disabled={busy}
          />
        </Field>
      </form>
    </Modal>
  );
}
