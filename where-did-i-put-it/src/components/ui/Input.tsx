// ============================================================
// Input, Textarea, Select, Label, Field — form primitives
// with consistent styling, label association, and a11y.
// ============================================================

import {
  forwardRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type SelectHTMLAttributes,
  type ReactNode,
  type LabelHTMLAttributes,
  useId,
} from "react";

// ---------- Label ----------
interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}
export function Label({ children, required, className = "", ...rest }: LabelProps) {
  return (
    <label
      className={`block text-sm font-medium text-content-primary mb-1.5 ${className}`}
      {...rest}
    >
      {children}
      {required && (
        <span aria-hidden="true" className="ml-0.5 text-status-lost">
          *
        </span>
      )}
    </label>
  );
}

// ---------- Field (Label + control + helper/error) ----------
interface FieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string | null;
  helper?: string | null;
  children: ReactNode;
}
export function Field({ label, htmlFor, required, error, helper, children }: FieldProps) {
  return (
    <div>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 text-sm text-status-lost">
          {error}
        </p>
      ) : helper ? (
        <p className="mt-1.5 text-sm text-content-muted">{helper}</p>
      ) : null}
    </div>
  );
}

// ---------- Input ----------
const inputBaseClass =
  "block w-full rounded-xl bg-surface-raised border border-border-strong px-3.5 text-body text-content-primary placeholder:text-content-muted transition-colors duration-150 ease-calm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-50 disabled:cursor-not-allowed";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = "", invalid = false, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={`${inputBaseClass} h-11 ${invalid ? "border-status-lost focus:border-status-lost focus:ring-status-lost/30" : ""} ${className}`}
      {...rest}
    />
  );
});

// ---------- Textarea ----------
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className = "", invalid = false, rows = 3, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={`${inputBaseClass} py-2.5 resize-y ${invalid ? "border-status-lost focus:border-status-lost focus:ring-status-lost/30" : ""} ${className}`}
      {...rest}
    />
  );
});

// ---------- Select ----------
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className = "", invalid = false, children, ...rest },
  ref,
) {
  return (
    <select
      ref={ref}
      className={`${inputBaseClass} h-11 appearance-none bg-no-repeat pr-9 ${invalid ? "border-status-lost focus:border-status-lost focus:ring-status-lost/30" : ""} ${className}`}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        backgroundPosition: "right 0.75rem center",
      }}
      {...rest}
    >
      {children}
    </select>
  );
});

// ---------- Field auto-id helper ----------
// Use this in forms to wire label htmlFor to input id without manual ids.
export function useFieldId(prefix: string) {
  const id = useId();
  return `${prefix}-${id}`;
}
