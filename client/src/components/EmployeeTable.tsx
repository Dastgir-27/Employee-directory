import type { Employee } from "../types/employee";
import { formatDateTime } from "../utils/format";

interface Props {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

const HEADERS = ["ID", "Name", "Email", "Role", "Created At", "Actions"];

export default function EmployeeTable({ employees, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[44rem] w-full divide-y divide-slate-200 text-left text-sm">
        <caption className="sr-only">Employee directory</caption>
        <thead className="bg-slate-50 text-xs font-semibold tracking-wide text-slate-600 uppercase">
          <tr>
            {HEADERS.map((h) => (
              <th key={h} scope="col" className={`px-4 py-3 ${h === "Actions" ? "text-right" : ""}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {employees.map((employee) => (
            <tr key={employee.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 whitespace-nowrap text-slate-500">{employee.id}</td>
              <td className="px-4 py-3 font-medium text-slate-900">{employee.name}</td>
              <td className="px-4 py-3 break-all text-slate-700">{employee.email}</td>
              <td className="px-4 py-3 text-slate-700">{employee.role}</td>
              <td className="px-4 py-3 whitespace-nowrap text-slate-600">{formatDateTime(employee.created_at)}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary px-3 py-1.5"
                    onClick={() => onEdit(employee)}
                    aria-label={`Edit ${employee.name}`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger-outline px-3 py-1.5"
                    onClick={() => onDelete(employee)}
                    aria-label={`Delete ${employee.name}`}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
