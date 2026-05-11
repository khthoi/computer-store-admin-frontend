import type {
  AuditLogEntry,
  AuditLogFilters,
  AuditLogResult,
  AuditEntityType,
} from "@/src/types/audit-log.types";
import type { AuditEvent } from "@/src/components/admin/shared/AuditLogViewer";
import { apiFetch } from "@/src/services/api";

// ─── Service Functions ────────────────────────────────────────────────────────

export async function getAuditLogs(
  params: AuditLogFilters = {}
): Promise<AuditLogResult> {
  const {
    q,
    entityType = [],
    actionType = [],
    actorId,
    from,
    to,
    page = 1,
    pageSize = 20,
  } = params;

  const qs = new URLSearchParams();
  qs.set("page", String(page));
  qs.set("pageSize", String(pageSize));
  if (q) qs.set("q", q);
  for (const et of entityType) qs.append("entityType[]", et);
  for (const at of actionType) qs.append("actionType[]", at);
  if (actorId) qs.set("actorId", actorId);
  if (from) qs.set("from", from);
  if (to) qs.set("to", to);

  return apiFetch<AuditLogResult>(`/admin/audit-logs?${qs}`);
}

export async function getEntityAuditLogs(
  entityType: AuditEntityType,
  entityId: string
): Promise<AuditLogEntry[]> {
  const qs = new URLSearchParams();
  qs.set("entityType[]", entityType);
  qs.set("entityId", entityId);
  qs.set("pageSize", "100");

  const result = await apiFetch<AuditLogResult>(`/admin/audit-logs?${qs}`);
  return result.data;
}

export async function exportAuditLogs(params: AuditLogFilters = {}): Promise<void> {
  const { q, entityType = [], actionType = [], actorId, from, to } = params;
  const qs = new URLSearchParams();
  if (q) qs.set("q", q);
  for (const et of entityType) qs.append("entityType[]", et);
  for (const at of actionType) qs.append("actionType[]", at);
  if (actorId) qs.set("actorId", actorId);
  if (from) qs.set("from", from);
  if (to) qs.set("to", to);

  const API_BASE = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api`;
  const rawToken = document.cookie.split("; ").find((c) => c.startsWith("auth_token="))?.split("=")[1];
  const token = rawToken ? decodeURIComponent(rawToken) : undefined;

  const res = await fetch(`${API_BASE}/admin/audit-logs/export?${qs}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Export thất bại: HTTP ${res.status}`);

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

export function toAuditEvent(entry: AuditLogEntry): AuditEvent {
  return {
    id: entry.id,
    timestamp: entry.createdAt,
    actorName: entry.actorName,
    actorCode: entry.actorCode ?? undefined,
    actorAvatarUrl: entry.actorAvatarUrl,
    actorRoles: entry.actorRoles,
    action: entry.actionDetail,
    diff: entry.diff,
  };
}
