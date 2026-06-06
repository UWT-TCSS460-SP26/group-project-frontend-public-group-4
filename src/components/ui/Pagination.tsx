interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const MAX_VISIBLE = 5;
  const half = Math.floor(MAX_VISIBLE / 2);
  let start = Math.max(0, page - half);
  let end = Math.min(totalPages - 1, start + MAX_VISIBLE - 1);
  if (end - start < MAX_VISIBLE - 1) start = Math.max(0, end - MAX_VISIBLE + 1);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const pageBtn =
    "px-2 py-1.5 rounded-md text-sm transition-colors disabled:cursor-not-allowed";

  return (
    <div className="flex items-center justify-center gap-1 pt-4">
      {(["First", "Prev"] as const).map((label) => {
        const disabled = page === 0;
        const target = label === "First" ? 0 : page - 1;
        return (
          <button
            key={label}
            onClick={() => onChange(Math.max(0, target))}
            disabled={disabled}
            className={`${pageBtn} btn-secondary text-xs`}
            style={{ opacity: disabled ? 0.4 : 1 }}
          >
            {label}
          </button>
        );
      })}

      {pages.map((i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
            i === page ? "btn-primary" : "btn-secondary"
          }`}
        >
          {i + 1}
        </button>
      ))}

      {(["Next", "Last"] as const).map((label) => {
        const disabled = page === totalPages - 1;
        const target = label === "Next" ? page + 1 : totalPages - 1;
        return (
          <button
            key={label}
            onClick={() => onChange(Math.min(totalPages - 1, target))}
            disabled={disabled}
            className={`${pageBtn} btn-secondary text-xs`}
            style={{ opacity: disabled ? 0.4 : 1 }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
