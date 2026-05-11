import { apiFetch } from "@/src/services/api";
import type { VaiTro, NhanVienVaiTro } from "@/src/types/role.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GetRolesParams {
  q?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface GetRolesResult {
  data: VaiTro[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateRolePayload {
  name: string;
  description: string;
  permissionCodes?: string[];
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
  permissionCodes?: string[];
}

export interface BackendPermission {
  id: number;
  maQuyen: string;
  tenQuyen: string;
  module: string;
  hanhDong: string;
  moTa?: string | null;
}

// Backend shape — GET /admin/roles returns Role entity directly (no response DTO)
interface BackendRole {
  id: number;
  tenVaiTro: string;
  moTa: string | null;
  createdAt?: string;
  employeeCount?: number;
  permissions?: { id: number; maQuyen: string; tenQuyen?: string; module?: string; hanhDong?: string }[];
}

function mapRole(r: BackendRole): VaiTro {
  return {
    id: String(r.id),
    name: r.tenVaiTro,
    description: r.moTa ?? "",
    permissions: (r.permissions ?? []).map((p) => p.maQuyen),
    employeeCount: r.employeeCount ?? 0,
    assignments: [] as NhanVienVaiTro[],
    createdAt: r.createdAt ?? "",
  };
}

// ─── Service ─────────────────────────────────────────────────────────────────

export async function getRoles(params: GetRolesParams = {}): Promise<GetRolesResult> {
  const qs = new URLSearchParams();
  if (params.q)         qs.set("q", params.q);
  if (params.page)      qs.set("page", String(params.page));
  if (params.limit)     qs.set("limit", String(params.limit));
  if (params.sortBy)    qs.set("sortBy", params.sortBy);
  if (params.sortOrder) qs.set("sortOrder", params.sortOrder.toUpperCase());

  const res = await apiFetch<{
    data: BackendRole[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>(`/admin/roles?${qs}`);

  return {
    data: (res?.data ?? []).map(mapRole),
    total: res?.total ?? 0,
    page: res?.page ?? 1,
    totalPages: res?.totalPages ?? 1,
  };
}

export async function getRoleById(id: string): Promise<VaiTro | null> {
  try {
    const role = await apiFetch<BackendRole>(`/admin/roles/${id}`);
    return mapRole(role);
  } catch {
    return null;
  }
}

export async function getPermissions(): Promise<BackendPermission[]> {
  const perms = await apiFetch<BackendPermission[]>("/admin/permissions");
  return perms ?? [];
}

export async function assignPermissions(
  roleId: string,
  permCodes: string[],
  allPerms: BackendPermission[],
): Promise<VaiTro> {
  const permIds = allPerms
    .filter((p) => permCodes.includes(p.maQuyen))
    .map((p) => p.id);
  const role = await apiFetch<BackendRole>(`/admin/roles/${roleId}/permissions`, {
    method: "PUT",
    body: JSON.stringify({ permissionIds: permIds }),
  });
  return mapRole(role);
}

export async function createRole(
  payload: CreateRolePayload,
  allPerms: BackendPermission[] = [],
): Promise<VaiTro> {
  const role = await apiFetch<BackendRole>("/admin/roles", {
    method: "POST",
    body: JSON.stringify({ tenVaiTro: payload.name, moTa: payload.description || null }),
  });
  const created = mapRole(role);

  if (payload.permissionCodes?.length && allPerms.length) {
    return assignPermissions(created.id, payload.permissionCodes, allPerms);
  }
  return created;
}

export async function updateRole(
  id: string,
  payload: UpdateRolePayload,
  allPerms: BackendPermission[] = [],
): Promise<VaiTro> {
  const body: Record<string, unknown> = {};
  if (payload.name !== undefined)        body.tenVaiTro = payload.name;
  if (payload.description !== undefined) body.moTa      = payload.description || null;

  const role = await apiFetch<BackendRole>(`/admin/roles/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  const updated = mapRole(role);

  // Always re-assign permissions (even empty array to clear all)
  if (payload.permissionCodes !== undefined && allPerms.length) {
    return assignPermissions(updated.id, payload.permissionCodes, allPerms);
  }
  return updated;
}

export async function deleteRole(id: string): Promise<void> {
  await apiFetch<void>(`/admin/roles/${id}`, { method: "DELETE" });
}

export async function bulkDeleteRoles(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => deleteRole(id)));
}

export async function assignRole(
  _roleId: string,
  _employeeId: string,
  _employeeName: string,
  _employeeEmail: string
): Promise<NhanVienVaiTro> {
  throw new Error("assignRole: not implemented");
}

export async function removeAssignment(_assignmentId: string): Promise<void> {
  throw new Error("removeAssignment: not implemented");
}
