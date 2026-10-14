import Spinner from "./Spinner";

export default function LoadingState() {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-16 text-slate-600">
      <Spinner />
      <span>Loading employees...</span>
    </div>
  );
}
