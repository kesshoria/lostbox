// ============================================================
// TagInput — chip-style multi-tag input.
// Type + Enter to add a tag. Backspace on empty removes the last.
// Click x to remove. Unique, lowercase on save.
// ============================================================

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";

interface TagInputProps {
  id?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  helper?: string;
  label?: string;
  disabled?: boolean;
  maxTags?: number;
}

export function TagInput({
  id,
  value,
  onChange,
  placeholder = "Type a tag and press Enter",
  helper,
  label,
  disabled = false,
  maxTags = 20,
}: TagInputProps) {
  const [draft, setDraft] = useState("");

  function addTag(raw: string) {
    const cleaned = raw.trim().toLowerCase();
    if (!cleaned) return;
    if (value.includes(cleaned)) {
      setDraft("");
      return;
    }
    if (value.length >= maxTags) return;
    onChange([...value, cleaned]);
    setDraft("");
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (disabled) return;
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(draft);
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  }

  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-content-primary mb-1.5"
        >
          {label}
        </label>
      )}
      <div
        className={[
          "flex flex-wrap items-center gap-1.5 rounded-xl bg-surface-raised border border-border-strong px-2.5 py-2",
          "focus-within:border-accent focus-within:outline-none focus-within:ring-2 focus-within:ring-accent/30",
          disabled ? "opacity-50" : "",
        ].join(" ")}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-pill bg-accent-soft text-accent border border-accent/20 px-2 py-0.5 text-xs font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              disabled={disabled}
              aria-label={`Remove tag ${tag}`}
              className="rounded-full p-0.5 hover:bg-accent/20"
            >
              <X size={11} />
            </button>
          </span>
        ))}
        <input
          id={id}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKey}
          onBlur={() => draft && addTag(draft)}
          placeholder={value.length === 0 ? placeholder : ""}
          disabled={disabled || value.length >= maxTags}
          aria-label={label ?? "Tags"}
          className="flex-1 min-w-[8rem] border-0 bg-transparent p-1 text-body text-content-primary placeholder:text-content-muted focus:outline-none"
        />
      </div>
      {helper && <p className="mt-1.5 text-sm text-content-muted">{helper}</p>}
    </div>
  );
}
