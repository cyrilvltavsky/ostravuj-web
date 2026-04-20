"use client";

import { useEffect } from "react";

/**
 * In-app confirmation modal — replaces window.confirm() with a styled
 * dialog that matches the rest of the UI. Renders only when `open`.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Smazat",
  cancelLabel = "Zrušit",
  destructive = true,
  pending = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !pending) onCancel();
    }
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, pending, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      className="fixed inset-0 z-[300] flex animate-fade-in items-center justify-center bg-ink/50 p-6 backdrop-blur"
      onClick={(e) => {
        if (e.target === e.currentTarget && !pending) onCancel();
      }}
    >
      <div className="w-full max-w-[440px] animate-slide-up rounded-card-xl bg-card p-7 shadow-soft-lg">
        <h3
          id="confirm-title"
          className="mb-2 text-xl font-extrabold tracking-tight text-ink"
        >
          {title}
        </h3>
        {description ? (
          <div className="mb-6 text-sm leading-relaxed text-ink-muted">
            {description}
          </div>
        ) : (
          <div className="mb-6" />
        )}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="rounded-xl border border-line-hover bg-card px-5 py-2.5 text-sm font-medium text-ink-muted transition hover:bg-surface hover:text-ink disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={
              destructive
                ? "rounded-xl bg-rose-strong px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-soft-md disabled:pointer-events-none disabled:opacity-60"
                : "rounded-xl bg-gradient-to-r from-peach-strong to-rose-strong px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-soft-md disabled:pointer-events-none disabled:opacity-60"
            }
          >
            {pending ? "Mažu…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
