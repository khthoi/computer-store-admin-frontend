import type { NhanVien, EmployeeStatus, AuditLogEntry, GenderType } from "@/src/types/employee.types";
import { MOCK_EMPLOYEES, MOCK_AUDIT_LOGS } from "@/src/app/(dashboard)/employees/_mock";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GetEmployeesResult {
  data: NhanVien[];
  total: number;
}

export interface CreateEmployeePayload {
  code: string;
  fullName: string;
  email: string;
  phone: string;
  roleIds: string[];
  roleNames: string[];
  status: EmployeeStatus;
  hireDate: string;
  avatarUrl?: string;
  gender?: GenderType | null;
  dateOfBirth?: string | null;
  avatarAssetId?: string;
}

export interface UpdateEmployeePayload {
  fullName?: string;
  email?: string;
  phone?: string;
  roleIds?: string[];
  roleNames?: string[];
  status?: EmployeeStatus;
  hireDate?: string;
  avatarUrl?: string;
  gender?: GenderType | null;
  dateOfBirth?: string | null;
}

// ─── Service ─────────────────────────────────────────────────────────────────

/**
 * Fetch all employees.
 * Mock — replace with GET /admin/employees
 */
export async function getEmployees(): Promise<GetEmployeesResult> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  return { data: MOCK_EMPLOYEES, total: MOCK_EMPLOYEES.length };
}

/**
 * Fetch a single employee by ID.
 * Mock — replace with GET /admin/employees/:id
 */
export async function getEmployeeById(id: string): Promise<NhanVien | null> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  return MOCK_EMPLOYEES.find((e) => e.id === id) ?? null;
}

/**
 * Create a new employee.
 * Mock — replace with POST /admin/employees
 */
export async function createEmployee(payload: CreateEmployeePayload): Promise<NhanVien> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  return {
    id: `nv-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...payload,
  };
}

/**
 * Update an employee.
 * Mock — replace with PATCH /admin/employees/:id
 */
export async function updateEmployee(id: string, payload: UpdateEmployeePayload): Promise<NhanVien> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  const existing = MOCK_EMPLOYEES.find((e) => e.id === id);
  if (!existing) throw new Error(`Employee ${id} not found`);
  return { ...existing, ...payload };
}

/**
 * Delete an employee.
 * Mock — replace with DELETE /admin/employees/:id
 */
export async function deleteEmployee(_id: string): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
}

/**
 * Fetch audit log entries for a single employee.
 * Mock — replace with GET /admin/employees/:id/audit-logs
 */
export async function getEmployeeAuditLogs(employeeId: string): Promise<AuditLogEntry[]> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  return MOCK_AUDIT_LOGS[employeeId] ?? MOCK_AUDIT_LOGS["__default__"] ?? [];
}

/**
 * Bulk update employee status.
 * Mock — replace with PATCH /admin/employees/bulk
 */
export async function bulkUpdateEmployeeStatus(
  ids: string[],
  status: EmployeeStatus
): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  void ids; void status;
}
