import { apiFetch } from "@/src/services/api";
import type {
  Ticket,
  TicketStats,
  TicketStatus,
  TicketMessage,
  StaffOption,
  TicketListParams,
  PaginatedTickets,
  AddMessagePayload,
  CreateTicketPayload,
  TicketMetaUpdatePayload,
} from "@/src/types/ticket.types";

// ─── Internal list shapes ──────────────────────────────────────────────────────

interface EmployeeListItem {
  id: number;
  maNhanVien: string;
  hoTen: string;
  email: string;
  soDienThoai: string | null;
  anhDaiDien: string | null;
}

interface EmployeeListResult {
  items: EmployeeListItem[];
  total: number;
}

interface AssigneeStatsItem {
  employeeId: number;
  openCount: number;
}

interface CustomerListItem {
  id: number;
  fullName: string;
  email: string;
}

interface OrderListItem {
  numericId: number;
  id: string;
  grandTotal: number;
  createdAt: string;
}

export interface CustomerSelectOption {
  value: string;
  label: string;
  description: string;
}

export interface OrderSelectOption {
  value: string;
  label: string;
  description: string;
}

// ─── Service functions ─────────────────────────────────────────────────────────

export async function getTickets(params: TicketListParams): Promise<PaginatedTickets> {
  const qs = new URLSearchParams();
  qs.set("page", String(params.page));
  if (params.limit)      qs.set("limit", String(params.limit));
  if (params.status)     qs.set("status", params.status);
  if (params.priority)   qs.set("priority", params.priority);
  if (params.loaiVanDe)  qs.set("loaiVanDe", params.loaiVanDe);
  if (params.assignedTo) qs.set("assignedTo", String(params.assignedTo));
  if (params.myOnly)     qs.set("myOnly", "true");
  if (params.dateFrom)   qs.set("dateFrom", params.dateFrom);
  if (params.dateTo)     qs.set("dateTo", params.dateTo);
  if (params.search)     qs.set("search", params.search);
  return apiFetch<PaginatedTickets>(`/admin/tickets?${qs}`);
}

export async function getTicketById(id: number): Promise<Ticket | null> {
  try {
    return await apiFetch<Ticket>(`/admin/tickets/${id}`);
  } catch {
    return null;
  }
}

export async function getTicketStats(): Promise<TicketStats> {
  return apiFetch<TicketStats>("/admin/tickets/stats");
}

export async function getStaffOptions(): Promise<StaffOption[]> {
  const [empResult, stats] = await Promise.all([
    apiFetch<EmployeeListResult>("/admin/employees?limit=100&trangThai=DangLam"),
    apiFetch<AssigneeStatsItem[]>("/admin/tickets/assignee-stats").catch(() => [] as AssigneeStatsItem[]),
  ]);
  const statsMap = new Map(stats.map(s => [s.employeeId, s.openCount]));
  return empResult.items.map(e => ({
    value:           String(e.id),
    maNhanVien:      e.maNhanVien,
    label:           e.hoTen,
    avatar:          e.anhDaiDien ?? undefined,
    email:           e.email,
    phone:           e.soDienThoai ?? undefined,
    openTicketCount: statsMap.get(e.id) ?? 0,
  }));
}

export async function getCustomerOptions(search?: string): Promise<CustomerSelectOption[]> {
  const qs = new URLSearchParams({ limit: "100", status: "active" });
  if (search) qs.set("search", search);
  const result = await apiFetch<{ data: CustomerListItem[] }>(`/admin/customers?${qs}`);
  return result.data.map((c) => ({
    value:       String(c.id),
    label:       c.fullName,
    description: c.email,
  }));
}

export async function getCustomerOrders(customerId: number): Promise<OrderSelectOption[]> {
  const result = await apiFetch<{ data: OrderListItem[] }>(
    `/admin/orders?customerId=${customerId}&limit=50`,
  );
  return result.data.map((o) => ({
    value:       String(o.numericId),
    label:       o.id,
    description: `${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(o.grandTotal)} — ${new Date(o.createdAt).toLocaleDateString("vi-VN")}`,
  }));
}

export async function createTicket(payload: CreateTicketPayload): Promise<Ticket> {
  return apiFetch<Ticket>("/admin/tickets", {
    method: "POST",
    body: JSON.stringify({
      customerId:  payload.khachHangId,
      orderId:     payload.donHangId,
      issueType:   payload.loaiVanDe,
      priority:    payload.mucDoUuTien,
      title:       payload.tieuDe,
      description: payload.moTa,
      channel:     payload.kenhLienHe,
    }),
  });
}

export async function updateTicketMeta(id: number, payload: TicketMetaUpdatePayload): Promise<Ticket> {
  if (payload.nhanVienPhuTrachId !== undefined) {
    await apiFetch(`/admin/tickets/${id}/assign`, {
      method: "PUT",
      body: JSON.stringify({ employeeId: payload.nhanVienPhuTrachId }),
    });
  }
  if (payload.trangThai === "DaDong")      return apiFetch<Ticket>(`/admin/tickets/${id}/close`,   { method: "PUT" });
  if (payload.trangThai === "DaGiaiQuyet") return apiFetch<Ticket>(`/admin/tickets/${id}/resolve`, { method: "PUT" });

  const metaUpdate: Record<string, unknown> = {};
  if (payload.mucDoUuTien !== undefined) metaUpdate.priority = payload.mucDoUuTien;
  if (Object.keys(metaUpdate).length > 0) {
    return apiFetch<Ticket>(`/admin/tickets/${id}`, {
      method: "PATCH",
      body: JSON.stringify(metaUpdate),
    });
  }

  return apiFetch<Ticket>(`/admin/tickets/${id}`);
}

export async function addMessage(ticketId: number, payload: AddMessagePayload): Promise<TicketMessage> {
  return apiFetch<TicketMessage>(`/admin/tickets/${ticketId}/messages`, {
    method: "POST",
    body: JSON.stringify({
      content:     payload.noiDungTinNhan,
      messageType: payload.loaiTinNhan,
    }),
  });
}

export async function assignTicket(ticketId: number, staffId: number | null): Promise<Ticket> {
  return apiFetch<Ticket>(`/admin/tickets/${ticketId}/assign`, {
    method: "PUT",
    body: JSON.stringify({ employeeId: staffId }),
  });
}

export async function changeStatus(ticketId: number, status: TicketStatus): Promise<Ticket> {
  if (status === "DaDong")       return apiFetch<Ticket>(`/admin/tickets/${ticketId}/close`,   { method: "PUT" });
  if (status === "DaGiaiQuyet")  return apiFetch<Ticket>(`/admin/tickets/${ticketId}/resolve`, { method: "PUT" });
  return apiFetch<Ticket>(`/admin/tickets/${ticketId}/reopen`, { method: "PUT" });
}

export async function bulkAssign(ticketIds: number[], staffId: number): Promise<void> {
  await Promise.all(
    ticketIds.map(id =>
      apiFetch(`/admin/tickets/${id}/assign`, {
        method: "PUT",
        body: JSON.stringify({ employeeId: staffId }),
      }),
    ),
  );
}
