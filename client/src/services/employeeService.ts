import axios from "axios";
import type {
  Employee,
  EmployeeInput,
  EmployeeListResponse,
  ListParams,
} from "../types/employee";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

export const employeeService = {
  async getAll(params: ListParams = {}): Promise<EmployeeListResponse> {
    const response = await api.get<EmployeeListResponse>("/employees", { params });
    return response.data;
  },

  async create(employee: EmployeeInput): Promise<Employee> {
    const response = await api.post<{ data: Employee }>("/employees", employee);
    return response.data.data;
  },

  async update(id: number, employee: EmployeeInput): Promise<Employee> {
    const response = await api.put<{ data: Employee }>(`/employees/${id}`, employee);
    return response.data.data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/employees/${id}`);
  },
};
