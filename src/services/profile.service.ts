import { apiFetch } from "@/src/services/api";
import type { NhanVien, AuditLogEntry } from "@/src/types/employee.types";
import type { VaiTro } from "@/src/types/role.types";

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

// ─── Server-safe fetch (used by server component page.tsx) ────────────────────

async function serverFetch<T>(path: string): Promise<T> {
  const { cookies } = await import("next/headers");
  const store = await cookies();
  const raw = store.get("auth_token")?.value;
  const token = raw ? decodeURIComponent(raw) : undefined;

  const API_BASE = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api`;
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? `HTTP ${res.status}`);
  }

  const body = await res.json();
  return (body as { data: T }).data;
}

// ─── Upload helper (bypasses apiFetch to avoid Content-Type: application/json) ─

async function uploadFile<T>(path: string, file: File): Promise<T> {
  const token = document.cookie
    .split("; ")
    .find((c) => c.startsWith("auth_token="))
    ?.split("=")[1];

  const formData = new FormData();
  formData.append("file", file);

  const API_BASE = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api`;
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    body: formData,
    headers: {
      ...(token ? { Authorization: `Bearer ${decodeURIComponent(token)}` } : {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? `HTTP ${res.status}`);
  }

  const body = await res.json();
  return (body as { data: T }).data;
}

// ─── Service functions ────────────────────────────────────────────────────────

/**
 * Fetch the full profile of the currently logged-in employee.
 * Called from the server component — uses next/headers cookies.
 */
export async function getCurrentProfile(): Promise<ProfileData> {
  return serverFetch<ProfileData>("/admin/me");
}

/**
 * Update the profile of the currently logged-in employee.
 * Called from client component ProfileEditForm.
 */
export async function updateCurrentProfile(
  payload: UpdateProfilePayload
): Promise<NhanVien> {
  return apiFetch<NhanVien>("/admin/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/**
 * Request a password change — backend validates current password and sends a
 * confirmation link to the employee's email. The password is not changed until
 * the user clicks the link.
 * Called from client component ChangePasswordForm.
 */
export async function changeCurrentPassword(
  payload: ChangePasswordPayload
): Promise<string> {
  const result = await apiFetch<{ message: string }>("/admin/me/change-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return result.message;
}

/**
 * Upload a new avatar for the current employee.
 * Called from client component ProfileAvatarUploader.
 */
export async function updateCurrentAvatar(
  file: File
): Promise<{ avatarUrl: string }> {
  return uploadFile<{ avatarUrl: string }>("/admin/me/avatar", file);
}
