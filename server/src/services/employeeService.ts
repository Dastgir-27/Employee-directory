import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "../config/db";
import { AppError } from "../middleware/errorHandler";
import type { Employee, EmployeeInput, ListQuery } from "../types/employee";

type EmployeeRow = Employee & RowDataPacket;

const COLUMNS = "id, name, email, role, created_at";

const notFound = () => new AppError(404, "NOT_FOUND", "Employee not found.");

const duplicateEmail = () =>
  new AppError(409, "EMAIL_EXISTS", "An employee with this email already exists.", {
    email: "This email is already registered.",
  });

function isDuplicateEntry(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: string }).code === "ER_DUP_ENTRY";
}

// Escape LIKE wildcards so a search for "100%" or "a_b" matches literally.
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

async function findById(id: number): Promise<Employee | null> {
  const [rows] = await pool.execute<EmployeeRow[]>(
    `SELECT ${COLUMNS} FROM employees WHERE id = ?`,
    [id]
  );
  return rows[0] ?? null;
}

export const employeeService = {
  async list({ search, page, limit }: ListQuery) {
    const where = search ? "WHERE name LIKE ?" : "";
    const params: (string | number)[] = search ? [`%${escapeLike(search)}%`] : [];

    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM employees ${where}`,
      params
    );
    const total = Number(countRows[0].total);
    const offset = (page - 1) * limit;

    // pool.query (not execute) because MySQL 8 rejects numeric LIMIT/OFFSET in prepared statements.
    // Values are still passed as ? placeholders and escaped by the driver.
    const [rows] = await pool.query<EmployeeRow[]>(
      `SELECT ${COLUMNS} FROM employees ${where} ORDER BY id ASC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return {
      data: rows as Employee[],
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async create({ name, email, role }: EmployeeInput): Promise<Employee> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        "INSERT INTO employees (name, email, role) VALUES (?, ?, ?)",
        [name, email, role]
      );
      const created = await findById(result.insertId);
      if (!created) throw new Error("Inserted employee could not be read back.");
      return created;
    } catch (err) {
      if (isDuplicateEntry(err)) throw duplicateEmail();
      throw err;
    }
  },

  async update(id: number, { name, email, role }: EmployeeInput): Promise<Employee> {
    // Existence check first: an UPDATE with unchanged values reports 0 affected rows,
    // so affectedRows alone cannot tell "unchanged" apart from "does not exist".
    if (!(await findById(id))) throw notFound();

    try {
      await pool.execute(
        "UPDATE employees SET name = ?, email = ?, role = ? WHERE id = ?",
        [name, email, role, id]
      );
    } catch (err) {
      if (isDuplicateEntry(err)) throw duplicateEmail();
      throw err;
    }

    const updated = await findById(id);
    if (!updated) throw notFound();
    return updated;
  },

  async remove(id: number): Promise<void> {
    const [result] = await pool.execute<ResultSetHeader>(
      "DELETE FROM employees WHERE id = ?",
      [id]
    );
    if (result.affectedRows === 0) throw notFound();
  },
};
