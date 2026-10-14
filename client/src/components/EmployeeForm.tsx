import { useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { EmployeeInput } from "../types/employee";
import { validateEmployeeForm } from "../utils/validate";
import Spinner from "./Spinner";

interface Props {
  initialValues: EmployeeInput;
  submitLabel: string;
  submitting: boolean;
  serverErrors: Record<string, string>;
  formError: string | null;
  onSubmit: (values: EmployeeInput) => void;
  onCancel: () => void;
}

const FIELDS = [
  { name: "name", label: "Name", type: "text", maxLength: 100 },
  { name: "email", label: "Email", type: "email", maxLength: 254 },
  { name: "role", label: "Role", type: "text", maxLength: 100 },
] as const;

export default function EmployeeForm({
  initialValues,
  submitLabel,
  submitting,
  serverErrors,
  formError,
  onSubmit,
  onCancel,
}: Props) {
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<EmployeeInput>(initialValues);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [serverErr, setServerErr] = useState<Record<string, string>>(serverErrors);

  const focusField = (name: string) =>
    formRef.current?.querySelector<HTMLInputElement>(`[name="${name}"]`)?.focus();

  // Show errors from the API and jump to the first offending field.
  useEffect(() => {
    setServerErr(serverErrors);
    const first = Object.keys(serverErrors)[0];
    if (first) focusField(first);
  }, [serverErrors]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setValues((current) => ({ ...current, [name]: value }));
    setClientErrors(({ [name]: _removed, ...rest }) => rest);
    setServerErr(({ [name]: _removed, ...rest }) => rest);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return; // block duplicate submissions

    const trimmed: EmployeeInput = {
      name: values.name.trim(),
      email: values.email.trim(),
      role: values.role.trim(),
    };
    const errors = validateEmployeeForm(trimmed);
    if (Object.keys(errors).length > 0) {
      setClientErrors(errors);
      focusField(Object.keys(errors)[0]);
      return;
    }
    setClientErrors({});
    onSubmit(trimmed);
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-4">
      {FIELDS.map((field) => {
        const error = clientErrors[field.name] ?? serverErr[field.name];
        const inputId = `${uid}-${field.name}`;
        const errorId = `${inputId}-error`;
        return (
          <div key={field.name}>
            <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-slate-700">
              {field.label}
            </label>
            <input
              id={inputId}
              name={field.name}
              type={field.type}
              value={values[field.name]}
              onChange={handleChange}
              maxLength={field.maxLength}
              autoComplete="off"
              readOnly={submitting}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              className="input"
            />
            {error && (
              <p id={errorId} className="mt-1 text-sm text-red-600">
                {error}
              </p>
            )}
          </div>
        );
      })}

      {formError && (
        <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {formError}
        </p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting && <Spinner className="size-4" />}
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
