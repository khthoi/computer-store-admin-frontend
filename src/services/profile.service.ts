import type { NhanVien, AuditLogEntry } from "@/src/types/employee.types";
import type { VaiTro } from "@/src/types/role.types";
import { MOCK_EMPLOYEES, MOCK_AUDIT_LOGS } from "@/src/app/(dashboard)/employees/_mock";
import { MOCK_ROLES } from "@/src/app/(dashboard)/roles/_mock";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UpdateProfilePayload {
  fullName: string;
  phone: string;
  gender?: "male" | "female" | "other" | null;
  dateOfBirth?: string | null;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ProfileData {
  employee: NhanVien;
  roles: VaiTro[];
  auditLogs: AuditLogEntry[];
}

// ─── Mock — current user is nv-001 ────────────────────────────────────────────
// Replace with: GET /admin/me  (derived from JWT session)

const CURRENT_EMPLOYEE_ID = "nv-001";

/**
 * Fetch the full profile of the currently logged-in employee.
 * Mock — replace with GET /admin/me
 */
export async function getCurrentProfile(): Promise<ProfileData> {
  await new Promise<void>((r) => setTimeout(r, 0));

  const employee = MOCK_EMPLOYEES.find((e) => e.id === CURRENT_EMPLOYEE_ID);
  if (!employee) throw new Error("Current employee not found");

  const roles = (MOCK_ROLES as VaiTro[]).filter((r) =>
    employee.roleIds.includes(r.id)
  );
  const auditLogs =
    MOCK_AUDIT_LOGS[CURRENT_EMPLOYEE_ID] ?? MOCK_AUDIT_LOGS["__default__"] ?? [];

  return { employee, roles, auditLogs };
}

/**
 * Update the profile of the currently logged-in employee.
 * Mock — replace with PATCH /admin/me
 */
export async function updateCurrentProfile(
  payload: UpdateProfilePayload
): Promise<NhanVien> {
  await new Promise<void>((r) => setTimeout(r, 0));
  const employee = MOCK_EMPLOYEES.find((e) => e.id === CURRENT_EMPLOYEE_ID);
  if (!employee) throw new Error("Current employee not found");
  return { ...employee, ...payload };
}

/**
 * Change the password of the currently logged-in employee.
 * Mock — replace with POST /admin/me/change-password
 */
export async function changeCurrentPassword(
  _payload: ChangePasswordPayload
): Promise<void> {
  await new Promise<void>((r) => setTimeout(r, 600));
  // Simulate wrong current password for demo:
  // if (_payload.currentPassword !== "secret") throw new Error("Mật khẩu hiện tại không đúng.");
}

/**
 * Upload a new avatar for the current employee.
 * Mock — replace with POST /admin/me/avatar
 */
export async function updateCurrentAvatar(
  _file: File
): Promise<{ avatarUrl: string }> {
  await new Promise<void>((r) => setTimeout(r, 800));
  return { avatarUrl: URL.createObjectURL(_file) };
}
