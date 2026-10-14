export interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string | Date;
}

export interface EmployeeInput {
  name: string;
  email: string;
  role: string;
}

export interface ListQuery {
  search: string;
  page: number;
  limit: number;
}
