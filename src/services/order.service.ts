import type { Order, OrderStatus, OrderSummary, OrderInternalNote, OrderReturnRequest } from "@/src/types/order.types";
import { apiFetch } from "@/src/services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GetOrdersParams {
  q?: string;
  status?: OrderStatus | "";
  paymentStatus?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface GetOrdersResult {
  data: OrderSummary[];
  total: number;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export async function getOrders(
  params: GetOrdersParams = {}
): Promise<GetOrdersResult> {
  const { q, status, paymentStatus, page = 1, pageSize, sortBy, sortOrder } = params;

  const qs = new URLSearchParams();
  qs.set("page", String(page));
  if (pageSize) qs.set("limit", String(pageSize));
  if (q) qs.set("q", q);
  if (status) qs.set("trangThai", STATUS_TO_VN[status] ?? "");
  if (paymentStatus) qs.set("trangThaiThanhToan", PAYMENT_STATUS_TO_VN[paymentStatus] ?? "");
  if (sortBy) qs.set("sortBy", sortBy);
  if (sortOrder) qs.set("sortOrder", sortOrder);

  const result = await apiFetch<{ data: OrderSummary[]; total: number }>(
    `/admin/orders?${qs}`
  );
  return { data: result.data, total: result.total };
}

const STATUS_TO_VN: Record<string, string> = {
  pending:    "ChoTT",
  confirmed:  "DaXacNhan",
  processing: "DongGoi",
  shipped:    "DangGiao",
  delivered:  "DaGiao",
  cancelled:  "DaHuy",
  returned:   "HoanTra",
};

const PAYMENT_STATUS_TO_VN: Record<string, string> = {
  unpaid:             "ChuaThanhToan",
  paid:               "DaThanhToan",
  refunded:           "DaHoanTien",
  partially_refunded: "HoanTienMotPhan",
};

export async function getOrderById(id: string): Promise<Order | null> {
  try {
    return await apiFetch<Order>(`/admin/orders/${id}`);
  } catch (err: unknown) {
    const msg = (err as Error)?.message ?? '';
    if (msg === 'Đơn hàng không tồn tại' || msg.startsWith('HTTP 404')) return null;
    throw err;
  }
}

// ─── Payloads ──────────────────────────────────────────────────────────────────

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
  note?: string;
}

export interface UpdateOrderShippingPayload {
  carrier?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export interface AddOrderNotePayload {
  text: string;
  authorName: string;
  authorRole: string;
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Update order status.
 * id must be the numeric order ID (String(order.id)), not the order code.
 */
export async function updateOrderStatus(
  id: string,
  payload: UpdateOrderStatusPayload
): Promise<void> {
  await apiFetch<void>(`/admin/orders/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({
      trangThai: STATUS_TO_VN[payload.status] ?? payload.status,
      ...(payload.note ? { ghiChu: payload.note } : {}),
    }),
  });
}

/**
 * Update shipping info (carrier, tracking number, estimated delivery).
 * PATCH /admin/orders/:id/shipping — returns updated full Order.
 */
export async function updateOrderShipping(
  id: string,
  payload: UpdateOrderShippingPayload
): Promise<Order> {
  return apiFetch<Order>(`/admin/orders/${id}/shipping`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/**
 * Add an internal note to an order.
 * POST /admin/orders/:id/notes — returns the created OrderInternalNote.
 */
export async function addOrderNote(
  id: string,
  payload: AddOrderNotePayload
): Promise<OrderInternalNote> {
  return apiFetch<OrderInternalNote>(`/admin/orders/${id}/notes`, {
    method: "POST",
    body: JSON.stringify({
      text:       payload.text,
      authorName: payload.authorName,
      authorRole: payload.authorRole,
    }),
  });
}

/**
 * Cancel an order by updating its status to "cancelled".
 */
export async function cancelOrder(
  id: string,
  note?: string
): Promise<void> {
  await updateOrderStatus(id, { status: "cancelled", note });
}

/**
 * Fetch all return requests for an order.
 * GET /admin/orders/:id/return-requests
 */
export async function getOrderReturnRequests(id: string): Promise<OrderReturnRequest[]> {
  return apiFetch<OrderReturnRequest[]>(`/admin/orders/${id}/return-requests`);
}

