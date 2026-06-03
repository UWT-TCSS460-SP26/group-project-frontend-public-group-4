"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  // Focus trap + Escape key + auto-focus
  useEffect(() => {
    if (!open) return;

    // Auto-focus the cancel button (less destructive) when dialog opens
    cancelBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCancel();
        return;
      }

      // Focus trap: keep Tab/Shift+Tab cycling within dialog
      if (e.key === "Tab") {
        const focusable = [cancelBtnRef.current, confirmBtnRef.current].filter(
          Boolean,
        ) as HTMLElement[];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    // Prevent background scrolling while dialog is open
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <div
      ref={dialogRef}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        aria-hidden="true"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div
        className="relative z-10 w-full max-w-md mx-4 rounded-xl shadow-2xl border p-6"
        style={{
          backgroundColor: "var(--dropdown-bg)",
          borderColor: "var(--dropdown-border)",
        }}
      >
        <h2
          id="confirm-dialog-title"
          className="text-lg font-semibold mb-2"
          style={{ color: "var(--dropdown-text)" }}
        >
          {title}
        </h2>
        <p
          id="confirm-dialog-message"
          className="text-sm mb-6"
          style={{ color: "var(--foreground)" }}
        >
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <button
            ref={cancelBtnRef}
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            style={{
              backgroundColor: "var(--btn-secondary-bg)",
              color: "var(--btn-secondary-text)",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor =
                  "var(--btn-secondary-hover-bg)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--btn-secondary-bg)";
            }}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmBtnRef}
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            style={{
              backgroundColor: "var(--destructive-color)",
              color: "#ffffff",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor =
                  "var(--destructive-hover)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                "var(--destructive-color)";
            }}
          >
            {loading ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
