import type { RequestHandler } from "express";
import { AppError } from "./errorHandler";
import type { EmployeeInput, ListQuery } from "../types/employee";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const MAX_SEARCH_LENGTH = 100;

function checkText(
  value: unknown,
  label: string,
  errors: Record<string, string>,
  key: string
): string {
  if (typeof value !== "string" || value.trim() === "") {
    errors[key] = `${label} is required.`;
    return "";
  }
  const trimmed = value.trim();
  if (trimmed.length < 2 || trimmed.length > 100) {
    errors[key] = `${label} must be between 2 and 100 characters.`;
  }
  return trimmed;
}

export function validateEmployeeInput(body: unknown): {
  value: EmployeeInput;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  const data = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>;

  const name = checkText(data.name, "Name", errors, "name");
  const role = checkText(data.role, "Role", errors, "role");

  let email = "";
  if (typeof data.email !== "string" || data.email.trim() === "") {
    errors.email = "Email is required.";
  } else {
    email = data.email.trim().toLowerCase();
    if (email.length > 254 || !EMAIL_REGEX.test(email)) {
      errors.email = "Enter a valid email address.";
    }
  }

  return { value: { name, email, role }, errors };
}

export const validateEmployeeBody: RequestHandler = (req, _res, next) => {
  const { value, errors } = validateEmployeeInput(req.body);
  if (Object.keys(errors).length > 0) {
    return next(new AppError(400, "VALIDATION_ERROR", "Please correct the invalid fields.", errors));
  }
  req.body = value; // trimmed + normalized
  next();
};

export const validateId: RequestHandler = (req, res, next) => {
  const raw = req.params.id;
  const id = Number(raw);
  if (!/^\d+$/.test(raw) || !Number.isSafeInteger(id) || id < 1) {
    return next(new AppError(400, "INVALID_ID", "Employee ID must be a positive integer."));
  }
  res.locals.id = id;
  next();
};

function parsePositiveInt(raw: unknown, fallback: number): number | null {
  if (raw === undefined || raw === "") return fallback;
  if (typeof raw !== "string" || !/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  return Number.isSafeInteger(n) && n >= 1 ? n : null;
}

export const validateListQuery: RequestHandler = (req, res, next) => {
  const errors: Record<string, string> = {};

  let search = "";
  if (req.query.search !== undefined) {
    if (typeof req.query.search !== "string") {
      errors.search = "Search must be text.";
    } else {
      search = req.query.search.trim();
      if (search.length > MAX_SEARCH_LENGTH) {
        errors.search = `Search must be at most ${MAX_SEARCH_LENGTH} characters.`;
      }
    }
  }

  const page = parsePositiveInt(req.query.page, 1);
  if (page === null) errors.page = "Page must be a positive integer.";

  const limit = parsePositiveInt(req.query.limit, DEFAULT_LIMIT);
  if (limit === null) errors.limit = "Limit must be a positive integer.";
  else if (limit > MAX_LIMIT) errors.limit = `Limit cannot exceed ${MAX_LIMIT}.`;

  if (Object.keys(errors).length > 0) {
    return next(new AppError(400, "VALIDATION_ERROR", "Invalid query parameters.", errors));
  }

  const query: ListQuery = { search, page: page as number, limit: limit as number };
  res.locals.listQuery = query;
  next();
};
