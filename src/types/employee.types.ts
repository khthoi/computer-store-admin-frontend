// ─── Employee domain types ────────────────────────────────────────────────────

export type GenderType = "male" | "female" | "other";

export interface NhanVien {
  id: string;
  /** e.g. "NV-001" */
  code: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  gender?: GenderType | null;
  dateOfBirth?: string | null; // ISO date "YYYY-MM-DD"
  roleIds: string[];
  /** Denormalised for display — kept in sync with roles */
  roleNames: string[];
  status: "active" | "inactive" | "suspended";
  hireDate: string;   // ISO date string
  lastLoginAt?: string; // ISO date string
  createdAt: string;  // ISO date string
}

export type EmployeeRow = NhanVien & Record<string, unknown>;
export type EmployeeStatus = NhanVien["status"];

// ─── Audit log ────────────────────────────────────────────────────────────────

export type AuditActionType =
  // current action types
  | "login_success"
  | "login_failed"
  | "logout"
  | "profile_edit"
  | "password_requested"
  | "password_changed"
  | "avatar_changed"
  | "role_changed"
  | "status_changed"
  // legacy action types (may exist in older DB records)
  | "login"
  | "role_assign"
  | "role_remove"
  | "report_view";

export interface AuditLogEntry {
  id: string;
  action: AuditActionType;
  details: string;
  ipAddress: string;
  createdAt: string; // ISO date-time string
}
