interface ToastProps {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}

export default function Toast({ type, message, onClose }: ToastProps) {
  return (
    <div
        role="alert"
        aria-live="assertive"
        className="fixed bottom-6 right-6 z-50 max-w-sm rounded-lg px-5 py-4 shadow-xl border transition-all duration-300"
        style={
        type === "success"
            ? {
                backgroundColor: "var(--toast-success-bg)",
                borderColor: "var(--toast-success-border)",
                color: "var(--toast-success-text)",
            }
            : {
                backgroundColor: "var(--toast-error-bg)",
                borderColor: "var(--toast-error-border)",
                color: "var(--toast-error-text)",
            }
        }
    >
        <div className="flex items-start gap-3">
        <span className="text-lg shrink-0" aria-hidden="true">
            {type === "success" ? "\u2713" : "\u2715"}
        </span>
        <p className="text-sm leading-relaxed">{message}</p>
        <button
          onClick={onClose}
          aria-label="Close notification"
          className="shrink-0 opacity-60 hover:opacity-100 ml-2 transition-opacity"
        >
            {"\u2715"}
        </button>
        </div>
    </div>
  );
}
