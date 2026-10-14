interface Props {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: Props) {
  return (
    <div role="alert" className="px-6 py-16 text-center">
      <h2 className="text-base font-semibold text-red-700">Could not load employees</h2>
      <p className="mt-1 text-sm text-slate-600">{message}</p>
      <button type="button" className="btn btn-secondary mt-5" onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}
