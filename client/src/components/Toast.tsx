import type { ToastItem } from "../hooks/useToasts";

interface Props {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}
 
export default function ToastContainer({ toasts, onDismiss }: Props) {
  return (
    <div className="fixed inset-x-4 bottom-4 z-50 flex flex-col gap-2 sm:left-auto sm:w-96">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role={toast.type === "error" ? "alert" : "status"}
          className={`flex items-start justify-between gap-3 rounded-md border p-3 text-sm shadow-lg ${
            toast.type === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
            className="rounded px-1 text-lg leading-none opacity-70 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-current"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}
