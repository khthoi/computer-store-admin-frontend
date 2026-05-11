import { apiFetch } from "@/src/services/api";
import type { NhanVien, EmployeeStatus, AuditLogEntry, GenderType } from "@/src/types/employee.types";

// Backend DTO may return null for optional fields that NhanVien types as non-null string.
// This normalizer ensures runtime values match the TypeScript contract.
function normalizeEmployee(e: NhanVien): NhanVien {
  const raw = e as unknown as Record<string, unknown>;
  return {
    ...e,
    phone:     (raw.phone     as string | null) ?? "",
    hireDate:  (raw.hireDate  as string | null) ?? "",
    avatarUrl: (raw.avatarUrl as string | null | undefined) ?? undefined,
    roleIds:   (raw.roleIds   as string[] | null) ?? [],
    roleNames: (raw.roleNames as string[] | null) ?? [],
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GetEmployeesResult {
  data: NhanVien[];
  total: number;
}

export interface GetEmployeesParams {
  q?: string;
  status?: string;
  roleId?: number;
  page?: number;
  limit?: number;
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
  gender?: GenderType | null;
  dateOfBirth?: string | null;
}

export interface UpdateEmployeePayload {
  fullName?: string;
  phone?: string;
  roleIds?: string[];
  roleNames?: string[];
  status?: EmployeeStatus;
  hireDate?: string;
  gender?: GenderType | null;
  dateOfBirth?: string | null;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export async function getEmployees(params: GetEmployeesParams = {}): Promise<GetEmployeesResult> {
  const { q, status, roleId, page = 1, limit } = params;
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  if (limit)  qs.set("limit", String(limit));
  if (q)      qs.set("search", q);
  if (status) qs.set("status", status);
  if (roleId) qs.set("roleId", String(roleId));
  const result = await apiFetch<GetEmployeesResult>(`/admin/employees?${qs}`);
  return { ...result, data: result.data.map(normalizeEmployee) };
}

export async function getEmployeeByCode(code: string): Promise<NhanVien | null> {
  try {
    const employee = await apiFetch<NhanVien>(`/admin/employees/code/${code}`);
    return normalizeEmployee(employee);
  } catch (err: unknown) {
    const msg = (err as Error)?.message ?? '';
    if (msg.startsWith('HTTP 404') || msg.includes('không tồn tại')) return null;
    throw err;
  }
}

export async function createEmployee(payload: CreateEmployeePayload): Promise<NhanVien> {
  const result = await apiFetch<NhanVien>('/admin/employees', {
    method: 'POST',
    body: JSON.stringify({
      code: payload.code,
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      gender: payload.gender,
      dateOfBirth: payload.dateOfBirth,
      hireDate: payload.hireDate,
      roleIds: payload.roleIds.map(Number),
    }),
  });
  return normalizeEmployee(result);
}

export async function updateEmployee(id: string, payload: UpdateEmployeePayload): Promise<NhanVien> {
  const body: Record<string, unknown> = {};
  if (payload.fullName    !== undefined) body.fullName    = payload.fullName;
  if (payload.phone       !== undefined) body.phone       = payload.phone;
  if (payload.gender      !== undefined) body.gender      = payload.gender;
  if (payload.dateOfBirth !== undefined) body.dateOfBirth = payload.dateOfBirth;
  if (payload.hireDate    !== undefined) body.hireDate    = payload.hireDate;
  if (payload.status      !== undefined) body.status      = payload.status;
  if (payload.roleIds?.length) {
    // Role assignment calls separate endpoint PUT /:id/roles
    const intIds = payload.roleIds.map(Number).filter((n) => Number.isInteger(n) && n > 0);
    if (intIds.length) {
      await apiFetch<NhanVien>(`/admin/employees/${id}/roles`, {
        method: 'PUT',
        body: JSON.stringify({ roleIds: intIds }),
      });
    }
  }
  const result = await apiFetch<NhanVien>(`/admin/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return normalizeEmployee(result);
}

export async function deleteEmployee(id: string): Promise<void> {
  await apiFetch<void>(`/admin/employees/${id}`, { method: 'DELETE' });
}

export interface GetEmployeeAuditLogsParams {
  page?: number;
  limit?: number;
  q?: string;
  action?: string[];
}

export interface GetEmployeeAuditLogsResult {
  data: AuditLogEntry[];
  total: number;
  totalPages: number;
}

export async function getEmployeeAuditLogs(
  employeeId: string,
  params: GetEmployeeAuditLogsParams = {},
): Promise<GetEmployeeAuditLogsResult> {
  const { page = 1, limit = 20, q, action } = params;
  const qs = new URLSearchParams();
  qs.set('page', String(page));
  qs.set('limit', String(limit));
  if (q) qs.set('q', q);
  if (action?.length) qs.set('action', action.join(','));
  return apiFetch<GetEmployeeAuditLogsResult>(`/admin/employees/${employeeId}/audit-logs?${qs}`);
}

export async function bulkUpdateEmployeeStatus(
  ids: string[],
  status: EmployeeStatus
): Promise<void> {
  await Promise.all(
    ids.map((id) =>
      apiFetch<void>(`/admin/employees/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      })
    )
  );
}

export async function resetEmployeePassword(
  employeeId: string,
  payload: { newPassword: string; confirmPassword: string }
): Promise<void> {
  await apiFetch<void>(`/admin/employees/${employeeId}/reset-password`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
