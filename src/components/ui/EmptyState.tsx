interface EmptyStateProps {
  message?: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  message = "Nothing to show right now.",
  action,
}: EmptyStateProps) {
  return (
    <div className="surface-card p-8 text-center flex flex-col items-center gap-4">
      <p className="text-sm" style={{ color: "var(--surface-text-dim)" }}>
        {message}
      </p>
      {action}
    </div>
  );
}