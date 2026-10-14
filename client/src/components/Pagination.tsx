interface Props {
  page: number;
  totalPages: number;
  total: number;
  searching?: boolean;
  disabled?: boolean;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  total,
  searching = false,
  disabled = false,
  onPageChange,
}: Props) {
  const lastPage = Math.max(totalPages, 1);
  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600"
    >
      <p aria-live="polite">
        {total} {searching ? "matching " : ""}employee{total === 1 ? "" : "s"}
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="btn btn-secondary px-3 py-1.5"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>
        <span>
          Page {page} of {lastPage}
        </span>
        <button
          type="button"
          className="btn btn-secondary px-3 py-1.5"
          disabled={disabled || page >= lastPage}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </nav>
  );
}
