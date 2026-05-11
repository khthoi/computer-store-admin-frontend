import { apiFetch } from "@/src/services/api";
import type {
  ThongBaoRow,
  NotificationStats,
  GetNotificationsParams,
  GetNotificationsResult,
  AutoNotificationRule,
  AutoNotificationRuleGroup,
  NotificationChannel,
  CreateNotificationPayload,
} from "@/src/types/notification.types";

// ─── Tab 1: Lịch sử thông báo ────────────────────────────────────────────────

export async function getNotifications(
  params: GetNotificationsParams = {}
): Promise<GetNotificationsResult> {
  const { page = 1, pageSize, kenhGui = [], trangThai = [], loaiThongBao = [], tuNgay, denNgay, q } = params;
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  if (pageSize)           qs.set("limit", String(pageSize));
  kenhGui.forEach((v) =>  qs.append("kenhGui", v));
  trangThai.forEach((v) => qs.append("trangThai", v));
  loaiThongBao.forEach((v) => qs.append("loaiThongBao", v));
  if (tuNgay)  qs.set("tuNgay", tuNgay);
  if (denNgay) qs.set("denNgay", denNgay);
  if (q)       qs.set("q", q);
  return apiFetch<GetNotificationsResult>(`/admin/notifications?${qs}`);
}

export async function getNotificationStats(): Promise<NotificationStats> {
  return apiFetch<NotificationStats>("/admin/notifications/stats");
}

export async function getNotificationById(id: number): Promise<ThongBaoRow | null> {
  return apiFetch<ThongBaoRow>(`/admin/notifications/${id}`);
}

export async function cancelNotification(id: number): Promise<void> {
  await apiFetch<void>(`/admin/notifications/${id}/cancel`, { method: "PATCH" });
}

export async function retryNotification(id: number): Promise<void> {
  await apiFetch<void>(`/admin/notifications/${id}/retry`, { method: "PATCH" });
}

// ─── Tab 2: Tạo thông báo mới ────────────────────────────────────────────────

export async function createNotification(
  payload: CreateNotificationPayload
): Promise<{ created: number }> {
  return apiFetch<{ created: number }>("/admin/notifications/broadcast", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ─── Tab 3: Cài đặt tự động ──────────────────────────────────────────────────

function mapConfigToRule(cfg: Record<string, unknown>): AutoNotificationRule {
  return {
    id:              String(cfg["id"]),
    trigger:         cfg["triggerKey"] as string,
    tenHienThi:      cfg["displayName"] as string,
    moTa:            (cfg["description"] as string | null) ?? "",
    kenhGui:         cfg["channels"] as NotificationChannel[],
    templateTieuDe:  cfg["templateTitle"] as string,
    templateNoiDung: cfg["templateContent"] as string,
    delayGiay:       cfg["delaySeconds"] as number,
    isActive:        cfg["isActive"] as boolean,
  };
}

export async function getAutoRuleGroups(): Promise<AutoNotificationRuleGroup[]> {
  const configs = await apiFetch<Record<string, unknown>[]>("/admin/notifications/configs");
  const rules = configs.map(mapConfigToRule);
  return [
    { group: "DonHang",   tenNhom: "Đơn hàng",                rules: rules.filter((r) => r.trigger.startsWith("don_hang")) },
    { group: "ThanhToan", tenNhom: "Thanh toán",               rules: rules.filter((r) => r.trigger.startsWith("giao_dich")) },
    { group: "HoanTra",   tenNhom: "Hoàn trả",                 rules: rules.filter((r) => r.trigger.startsWith("hoan_hang")) },
    { group: "Marketing", tenNhom: "Marketing & Khuyến mãi",   rules: rules.filter((r) => ["khuyen_mai", "coupon", "san_pham", "gio_hang"].some((p) => r.trigger.startsWith(p))) },
    { group: "Loyalty",   tenNhom: "Loyalty & Điểm thưởng",    rules: rules.filter((r) => r.trigger.startsWith("loyalty")) },
  ];
}

export async function updateAutoRule(
  id: string,
  patch: Partial<AutoNotificationRule>
): Promise<AutoNotificationRule> {
  const backendPatch: Record<string, unknown> = {};
  if (patch.trigger          !== undefined) backendPatch["triggerKey"]      = patch.trigger;
  if (patch.tenHienThi       !== undefined) backendPatch["displayName"]     = patch.tenHienThi;
  if (patch.moTa             !== undefined) backendPatch["description"]     = patch.moTa;
  if (patch.kenhGui          !== undefined) backendPatch["channels"]        = patch.kenhGui;
  if (patch.templateTieuDe   !== undefined) backendPatch["templateTitle"]   = patch.templateTieuDe;
  if (patch.templateNoiDung  !== undefined) backendPatch["templateContent"] = patch.templateNoiDung;
  if (patch.delayGiay        !== undefined) backendPatch["delaySeconds"]    = patch.delayGiay;
  if (patch.isActive         !== undefined) backendPatch["isActive"]        = patch.isActive;

  const updated = await apiFetch<Record<string, unknown>>(`/admin/notifications/configs/${id}`, {
    method: "PUT",
    body: JSON.stringify(backendPatch),
  });
  return mapConfigToRule(updated);
}

// ─── Tab: Cài đặt chung thông báo ────────────────────────────────────────────

export async function getNotificationSettings() {
  return apiFetch("/admin/settings/notifications");
}

export async function updateNotificationSettings(payload: {
  email_enabled?: string;
  email_from?: string;
  email_from_name?: string;
  low_stock_threshold?: string;
  return_window_days?: string;
  sla_high_priority_hours?: string;
  sla_normal_priority_hours?: string;
}) {
  return apiFetch("/admin/settings/notifications", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
