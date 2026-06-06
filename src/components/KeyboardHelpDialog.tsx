"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface KeyboardHelpDialogProps {
  open: boolean;
  onClose: () => void;
}

interface ShortcutGroup {
  title: string;
  shortcuts: { keys: string; action: string }[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: "Global",
    shortcuts: [
      { keys: "Ctrl + K  or  /", action: "Open search overlay" },
      { keys: "Alt + M", action: "Open search in Movies mode" },
      { keys: "Alt + T", action: "Open search in TV Shows mode" },
      { keys: "?", action: "Show this help dialog" },
      { keys: "Escape", action: "Close overlay / dialog" },
      { keys: "Ctrl + Alt + T", action: "Toggle light/dark theme" },
    ],
  },
  {
    title: "Navigation (g + letter)",
    shortcuts: [
      { keys: "g  h", action: "Go to Home" },
      { keys: "g  m", action: "Go to Movies" },
      { keys: "g  t", action: "Go to TV Shows" },
      { keys: "g  p", action: "Go to Profile" },
      { keys: "g  a", action: "Go to About" },
    ],
  },
  {
    title: "Search Overlay",
    shortcuts: [
      { keys: "Tab", action: "Toggle Movies / TV mode" },
      { keys: "Enter", action: "Submit search" },
      { keys: "Escape", action: "Close overlay" },
    ],
  },
  {
    title: "Detail Pages",
    shortcuts: [
      { keys: "Ctrl + Enter", action: "Submit review" },
    ],
  },
  {
    title: "Profile Page",
    shortcuts: [
      { keys: "Ctrl + Enter", action: "Save edited review" },
    ],
  },
];

export default function KeyboardHelpDialog({
  open,
  onClose,
}: KeyboardHelpDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeBtnRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      ref={dialogRef}
      className="fixed inset-0 z-100 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className="relative z-10 w-full max-w-lg mx-4 rounded-xl shadow-2xl border p-6 max-h-[85vh] overflow-y-auto"
        style={{
          backgroundColor: "var(--dropdown-bg)",
          borderColor: "var(--dropdown-border)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            id="shortcuts-dialog-title"
            className="text-lg font-semibold"
            style={{ color: "var(--dropdown-text)" }}
          >
            Keyboard Shortcuts
          </h2>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="px-3 py-1 rounded-md text-sm font-medium transition-colors"
            style={{
              backgroundColor: "var(--btn-secondary-bg)",
              color: "var(--btn-secondary-text)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                "var(--btn-secondary-hover-bg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--btn-secondary-bg)";
            }}
          >
            Close
          </button>
        </div>

        {SHORTCUT_GROUPS.map((group) => (
          <div key={group.title} className="mb-5 last:mb-0">
            <h3
              className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              {group.title}
            </h3>
            <div
              className="rounded-lg border overflow-hidden"
              style={{ borderColor: "var(--dropdown-divider)" }}
            >
              {group.shortcuts.map(({ keys, action }) => (
                <div
                  key={keys + action}
                  className="flex items-center justify-between px-3 py-2 text-sm"
                  style={{
                    borderBottom: "1px solid var(--dropdown-divider)",
                  }}
                >
                  <span style={{ color: "var(--foreground)" }}>{action}</span>
                  <kbd
                    className="px-2 py-0.5 rounded text-xs font-mono"
                    style={{
                      backgroundColor: "var(--tab-bar-bg)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--dropdown-divider)",
                    }}
                  >
                    {keys}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        ))}

        <p className="text-xs mt-4" style={{ color: "var(--text-secondary)" }}>
          Tip: press{" "}
          <kbd
            className="px-1.5 py-0.5 rounded text-xs font-mono"
            style={{
              backgroundColor: "var(--tab-bar-bg)",
              color: "var(--text-secondary)",
              border: "1px solid var(--dropdown-divider)",
            }}
          >
            ?
          </kbd>{" "}
          again or{" "}
          <kbd
            className="px-1.5 py-0.5 rounded text-xs font-mono"
            style={{
              backgroundColor: "var(--tab-bar-bg)",
              color: "var(--text-secondary)",
              border: "1px solid var(--dropdown-divider)",
            }}
          >
            Escape
          </kbd>{" "}
          to close this dialog.
        </p>
      </div>
    </div>,
    document.body,
  );
}
