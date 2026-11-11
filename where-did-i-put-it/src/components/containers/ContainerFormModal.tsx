// ============================================================
// ContainerFormModal — add or edit a Container.
// Same shape as LocationFormModal, plus a location selector.
// ============================================================

import { useEffect, useState, type FormEvent } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, Select, useFieldId } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { createContainer, updateContainer } from "@/db/containers";
import { db } from "@/db";
import type { Container } from "@/lib/types";

interface ContainerFormModalProps {
  open: boolean;
  onClose: () => void;
  container?: Container | null;
  // Optional: when called from "Add container to this location",
  // we preselect that location.
  defaultLocationId?: string | null;
}

export function ContainerFormModal({
  open,
  onClose,
  container,
  defaultLocationId,
}: ContainerFormModalProps) {
  const isEdit = Boolean(container);
  const toast = useToast();

  const nameId = useFieldId("con-name");
  const locId = useFieldId("con-loc");
  const notesId = useFieldId("con-notes");

  const [name, setName] = useState("");
  const [locationId, setLocationId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Locations for the selector — live query so it always shows current data.
  // We import the db directly here because the form is small + focused.
  // For pages with bigger joins we'd lift this up.
  const locations = useLiveQuery(
    () => db.locations.orderBy("name").toArray(),
    [],
    [],
  );

  // Reset form whenever the modal opens.
  useEffect(() => {
    if (open) {
      setName(container?.name ?? "");
      setLocationId(
        container?.locationId ?? defaultLocationId ?? "",
      );
      setNotes(container?.notes ?? "");
      setNameError(null);
      setBusy(false);
    }
  }, [open, container, defaultLocationId]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("Name is required.");
      return;
    }
    setNameError(null);
    setBusy(true);

    const locValue = locationId || null;
    const op = isEdit
      ? updateContainer(container!.id, {
          name: trimmedName,
          locationId: locValue,
          notes: notes.trim() || null,
        })
      : createContainer({
          name: trimmedName,
          locationId: locValue,
          notes: notes.trim() || null,
        });

    op
      .then(() => {
        toast.success(isEdit ? "Container updated." : "Container added.");
        onClose();
      })
      .catch((err) => {
        console.error(err);
        toast.error("Could not save container. Please try again.");
        setBusy(false);
      });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit container" : "Add a container"}
      description={
        isEdit
          ? "Update this container's name, location, or notes."
          : "A container lives inside a location — a drawer, a shelf, a box."
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="container-form"
            loading={busy}
            disabled={busy}
          >
            {isEdit ? "Save changes" : "Add container"}
          </Button>
        </>
      }
    >
      <form id="container-form" onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Name"
          htmlFor={nameId}
          required
          error={nameError}
          helper="e.g. Drawer under TV, Top shelf, Toolbox"
        >
          <Input
            id={nameId}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Drawer under TV"
            autoFocus
            autoComplete="off"
            maxLength={100}
            invalid={Boolean(nameError)}
            disabled={busy}
          />
        </Field>

        <Field
          label="Location"
          htmlFor={locId}
          helper="Where this container lives. Optional but recommended."
        >
          <Select
            id={locId}
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            disabled={busy}
          >
            <option value="">— No location —</option>
            {(locations ?? []).map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Notes"
          htmlFor={notesId}
          helper="Optional. Anything that helps identify this container."
        >
          <Textarea
            id={notesId}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Top drawer, left side…"
            rows={3}
            maxLength={500}
            disabled={busy}
          />
        </Field>
      </form>
    </Modal>
  );
}
