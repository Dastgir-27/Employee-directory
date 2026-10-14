import { useEffect, useRef, useState } from "react";
import type { Employee, EmployeeInput, Pagination as PaginationInfo } from "../types/employee";
import { employeeService } from "../services/employeeService";
import { parseApiError } from "../services/apiError";
import { useToasts } from "../hooks/useToasts";
import DeleteConfirmation from "./DeleteConfirmation";
import EmployeeForm from "./EmployeeForm";
import EmployeeTable from "./EmployeeTable";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import LoadingState from "./LoadingState";
import Modal from "./Modal";
import Pagination from "./Pagination";
import SearchBar from "./SearchBar";
import ToastContainer from "./Toast";
 
const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;
// A page number far past the end. The fetch effect moves back to the real last page.
const LAST_PAGE_GUESS = 1_000_000;
const EMPTY_FORM: EmployeeInput = { name: "", email: "", role: "" };

type ModalState = { mode: "add" } | { mode: "edit"; employee: Employee } | null;

export default function EmployeeDirectory() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // searchInput follows the keyboard; appliedSearch is what the API is actually queried with.
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const [modal, setModal] = useState<ModalState>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { toasts, push, dismiss } = useToasts();
  const latestRequest = useRef(0);

  const refresh = () => setReloadToken((t) => t + 1);

  // Debounce typing. Applying a new query resets to page 1 in the same render,
  // so only one request is made.
  useEffect(() => {
    const next = searchInput.trim();
    if (next === appliedSearch) return;
    const timer = window.setTimeout(() => {
      setAppliedSearch(next);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput, appliedSearch]);

  // Fetch whenever the page, the applied search or a refresh request changes.
  useEffect(() => {
    const requestId = ++latestRequest.current;
    setLoading(true);
    setLoadError(null);

    employeeService
      .getAll({ search: appliedSearch || undefined, page, limit: PAGE_SIZE })
      .then((result) => {
        if (requestId !== latestRequest.current) return; // a newer request superseded this one
        const { total, totalPages } = result.pagination;
        if (result.data.length === 0 && total > 0 && page > totalPages) {
          setPage(totalPages); // current page no longer exists, move back
          return;
        }
        setEmployees(result.data);
        setPagination(result.pagination);
        setLoading(false);
      })
      .catch((err) => {
        if (requestId !== latestRequest.current) return;
        setLoadError(parseApiError(err).message);
        setLoading(false);
      });
  }, [page, appliedSearch, reloadToken]);

  function clearSearch() {
    setSearchInput("");
    setAppliedSearch("");
    setPage(1);
  }

  function openAdd() {
    setFormError(null);
    setFieldErrors({});
    setModal({ mode: "add" });
  }

  function openEdit(employee: Employee) {
    setFormError(null);
    setFieldErrors({});
    setModal({ mode: "edit", employee });
  }

  function closeModal() {
    if (submitting) return;
    setModal(null);
  }

  async function handleSubmit(values: EmployeeInput) {
    if (submitting || !modal) return;
    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    try {
      if (modal.mode === "add") {
        await employeeService.create(values);
        push("success", "Employee added successfully.");
        setModal(null);
        if (appliedSearch || searchInput) {
          // The new employee may not match the current search, so reset it and go to the end.
          setSearchInput("");
          setAppliedSearch("");
          setPage(LAST_PAGE_GUESS);
        } else {
          // New records sort last, so jump to the page that will contain it.
          const newTotal = (pagination?.total ?? 0) + 1;
          setPage(Math.max(1, Math.ceil(newTotal / PAGE_SIZE)));
        }
        refresh();
      } else {
        const updated = await employeeService.update(modal.employee.id, values);
        setEmployees((list) => list.map((e) => (e.id === updated.id ? updated : e)));
        push("success", "Employee updated successfully.");
        setModal(null);
      }
    } catch (err) {
      const parsed = parseApiError(err);
      if (modal.mode === "edit" && parsed.status === 404) {
        setModal(null);
        push("error", "This employee no longer exists.");
        refresh();
      } else {
        // Keep the modal open with the user's input intact.
        setFieldErrors(parsed.fieldErrors);
        setFormError(Object.keys(parsed.fieldErrors).length > 0 ? null : parsed.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function askDelete(employee: Employee) {
    setDeleteError(null);
    setDeleteTarget(employee);
  }

  async function confirmDelete() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setDeleteError(null);

    try {
      await employeeService.remove(deleteTarget.id);
      push("success", `${deleteTarget.name} was deleted.`);
      setDeleteTarget(null);
      if (employees.length === 1 && page > 1) setPage(page - 1); // last row on this page
      else refresh();
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.status === 404) {
        setDeleteTarget(null);
        push("error", "This employee was already removed.");
        refresh();
      } else {
        setDeleteError(parsed.message); // record stays visible
      }
    } finally {
      setDeleting(false);
    }
  }

  const editing = modal?.mode === "edit" ? modal.employee : null;

  // Hide the search box only for a brand-new, empty directory.
  const hasRecords = (pagination?.total ?? 0) > 0;
  const showToolbar = hasRecords || appliedSearch !== "" || searchInput !== "";

  let content;
  if (loadError) {
    content = <ErrorState message={loadError} onRetry={refresh} />;
  } else if (!pagination) {
    content = <LoadingState />;
  } else if (pagination.total === 0 && appliedSearch) {
    content = (
      <EmptyState
        title="No matching employees"
        description={`No employees match "${appliedSearch}". Try a different name.`}
        action={{ label: "Clear search", onClick: clearSearch }}
      />
    );
  } else if (pagination.total === 0) {
    content = (
      <EmptyState
        title="No employees yet"
        description="Add your first employee to start building the directory."
        action={{ label: "Add Employee", onClick: openAdd }}
      />
    );
  } else {
    content = (
      <div aria-busy={loading} className={loading ? "opacity-60 transition-opacity" : ""}>
        <EmployeeTable employees={employees} onEdit={openEdit} onDelete={askDelete} />
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          searching={appliedSearch !== ""}
          disabled={loading}
          onPageChange={setPage}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Employee Directory</h1>
            <p className="mt-1 text-sm text-slate-600">Manage your organization's employee records</p>
          </div>
          <button type="button" className="btn btn-primary w-full sm:w-auto" onClick={openAdd}>
            Add Employee
          </button>
        </header>

        <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {showToolbar && (
            <div className="border-b border-slate-200 p-4">
              <SearchBar value={searchInput} onChange={setSearchInput} onClear={clearSearch} />
            </div>
          )}
          {content}
        </section>
      </main>

      <Modal open={modal !== null} title={editing ? "Edit employee" : "Add employee"} onClose={closeModal}>
        {modal && (
          <EmployeeForm
            key={editing ? editing.id : "new"}
            initialValues={
              editing ? { name: editing.name, email: editing.email, role: editing.role } : EMPTY_FORM
            }
            submitLabel={editing ? "Save changes" : "Add Employee"}
            submitting={submitting}
            serverErrors={fieldErrors}
            formError={formError}
            onSubmit={handleSubmit}
            onCancel={closeModal}
          />
        )}
      </Modal>

      <DeleteConfirmation
        employee={deleteTarget}
        deleting={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
