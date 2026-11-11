// ============================================================
// Toast — non-blocking notifications for save/delete/import/export.
// Uses a context provider; render through a portal at the root.
// Announces to screen readers via aria-live region.
// ============================================================

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Check, AlertCircle, Info, X } from "lucide-react";

type ToastTone = "success" | "error" | "info";

interface Toast {
  id: string;
  tone: ToastTone;
  message: string;
  duration: number;
}

interface ToastContextValue {
  toast: (message: string, tone?: ToastTone, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idCounter = useRef(0);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, tone: ToastTone = "info", duration = 3500) => {
      const id = `toast-${idCounter.current++}`;
      setToasts((prev) => [...prev, { id, tone, message, duration }]);
      if (duration > 0) {
        setTimeout(() => remove(id), duration);
      }
    },
    [remove],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      toast,
      success: (m) => toast(m, "success"),
      error: (m) => toast(m, "error", 5000),
      info: (m) => toast(m, "info"),
    }),
    [toast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div
          aria-live="polite"
          aria-atomic="false"
          className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 safe-bottom"
        >
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  // Animate in
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const r = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(r);
  }, []);

  const Icon = toast.tone === "success" ? Check : toast.tone === "error" ? AlertCircle : Info;
  const iconColor =
    toast.tone === "success"
      ? "text-accent"
      : toast.tone === "error"
        ? "text-status-lost"
        : "text-content-secondary";

  return (
    <div
      role="status"
      className={[
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-card bg-surface-overlay border border-border-strong shadow-raised px-4 py-3",
        "transition-all duration-200 ease-calm",
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
      ].join(" ")}
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${iconColor}`} aria-hidden="true" />
      <p className="flex-1 text-body text-content-primary">{toast.message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        className="shrink-0 rounded-md p-1 text-content-muted hover:bg-surface-inset hover:text-content-primary"
      >
        <X size={16} />
      </button>
    </div>
  );
}
