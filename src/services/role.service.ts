import { apiFetch } from "@/src/services/api";
import type { VaiTro, NhanVienVaiTro } from "@/src/types/role.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GetRolesResult {
  data: VaiTro[];
  total: number;
}

export interface CreateRolePayload {
  name: string;
  description: string;
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
}

// Backend shape — GET /admin/roles returns Role entity directly (no response DTO)
interface BackendRole {
  id: number;
  tenVaiTro: string;
  moTa: string | null;
  permissions?: { id: number; code: string; module?: string; hanhDong?: string }[];
}

function mapRole(r: BackendRole): VaiTro {
  return {
    id: String(r.id),
    name: r.tenVaiTro,
    description: r.moTa ?? "",
    permissions: (r.permissions ?? []).map((p) => p.code),
    employeeCount: 0,
    assignments: [] as NhanVienVaiTro[],
    createdAt: "",
  };
}

// ─── Service ─────────────────────────────────────────────────────────────────

export async function getRoles(): Promise<GetRolesResult> {
  const roles = await apiFetch<BackendRole[]>("/admin/roles");
  const mapped = (roles ?? []).map(mapRole);
  return { data: mapped, total: mapped.length };
}

export async function getRoleById(id: string): Promise<VaiTro | null> {
  try {
    const role = await apiFetch<BackendRole>(`/admin/roles/${id}`);
    return mapRole(role);
  } catch {
    return null;
  }
}

export async function createRole(payload: CreateRolePayload): Promise<VaiTro> {
  const role = await apiFetch<BackendRole>("/admin/roles", {
    method: "POST",
    body: JSON.stringify({ tenVaiTro: payload.name, moTa: payload.description }),
  });
  return mapRole(role);
}

export async function updateRole(id: string, payload: UpdateRolePayload): Promise<VaiTro> {
  const body: Record<string, unknown> = {};
  if (payload.name !== undefined)        body.tenVaiTro = payload.name;
  if (payload.description !== undefined) body.moTa      = payload.description;
  const role = await apiFetch<BackendRole>(`/admin/roles/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return mapRole(role);
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
