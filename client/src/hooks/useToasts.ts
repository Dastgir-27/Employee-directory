import { useCallback, useState } from "react";

export type ToastType = "success" | "error";

export interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

let nextId = 1;

export function useToasts(durationMs = 4500) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type: ToastType, message: string) => {
      const id = nextId++;
      setToasts((current) => [...current, { id, type, message }]);
      window.setTimeout(() => dismiss(id), durationMs);
    },
    [dismiss, durationMs]
  );

  return { toasts, push, dismiss };
}
