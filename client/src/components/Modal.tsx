import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

// Uses the native <dialog> element: it traps focus, handles Esc and restores focus on close.
export default function Modal({ open, title, onClose, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault(); // let the parent decide (it may be mid-request)
        onClose();
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose(); // click on the backdrop
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border-0 bg-white p-0 shadow-xl backdrop:bg-slate-900/50"
    >
      {open && (
        <div className="p-6">
          <h2 id={titleId} className="text-lg font-semibold text-slate-900">
            {title}
          </h2>
          <div className="mt-4">{children}</div>
        </div>
      )}
    </dialog>
  );
}
