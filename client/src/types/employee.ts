export interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

// Users never provide the generated id or created_at.
export interface EmployeeInput {
  name: string;
  email: string;
  role: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface EmployeeListResponse {
  data: Employee[];
  pagination: Pagination;
}

export interface ListParams {
  search?: string;
  page?: number;
  limit?: number;
}
