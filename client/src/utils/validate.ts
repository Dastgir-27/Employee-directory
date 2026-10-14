import type { EmployeeInput } from "../types/employee";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mirrors the backend rules. This improves usability only; the server stays authoritative.
export function validateEmployeeForm(values: EmployeeInput): Record<string, string> {
  const errors: Record<string, string> = {};

  const name = values.name.trim();
  if (!name) errors.name = "Name is required.";
  else if (name.length < 2 || name.length > 100) errors.name = "Name must be between 2 and 100 characters.";

  const email = values.email.trim();
  if (!email) errors.email = "Email is required.";
  else if (email.length > 254 || !EMAIL_REGEX.test(email)) errors.email = "Enter a valid email address.";

  const role = values.role.trim();
  if (!role) errors.role = "Role is required.";
  else if (role.length < 2 || role.length > 100) errors.role = "Role must be between 2 and 100 characters.";

  return errors;
}
