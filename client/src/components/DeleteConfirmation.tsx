import type { Employee } from "../types/employee";
import Modal from "./Modal";
import Spinner from "./Spinner";

interface Props {
  employee: Employee | null;
  deleting: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmation({ employee, deleting, error, onConfirm, onCancel }: Props) {
  return (
    <Modal open={employee !== null} title="Delete employee" onClose={() => !deleting && onCancel()}>
      {employee && (
        <>
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <strong className="text-slate-900">{employee.name}</strong>? This
            cannot be undone.
          </p>
          {error && (
            <p role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={deleting}>
              Cancel
            </button>
            <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={deleting}>
              {deleting && <Spinner className="size-4" />}
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
