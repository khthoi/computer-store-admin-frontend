import type { Order, OrderStatus, OrderSummary, OrderInternalNote, OrderShipping, OrderRefundRecord } from "@/src/types/order.types";
import { MOCK_ORDERS, MOCK_ORDER_SUMMARIES } from "@/src/app/(dashboard)/orders/_mock";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GetOrdersParams {
  q?: string;
  status?: OrderStatus | "";
  paymentStatus?: string;
  page?: number;
  pageSize?: number;
}

export interface GetOrdersResult {
  data: OrderSummary[];
  total: number;
}

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * Fetch order summaries with optional filtering and pagination.
 * Mock implementation — replace with GET /admin/orders
 */
export async function getOrders(
  params: GetOrdersParams = {}
): Promise<GetOrdersResult> {
  const { q = "", status = "", paymentStatus = "", page = 1, pageSize = 20 } = params;

  let filtered = [...MOCK_ORDER_SUMMARIES];

  if (q) {
    const lower = q.toLowerCase();
    filtered = filtered.filter(
      (o) =>
        o.id.toLowerCase().includes(lower) ||
        o.customerName.toLowerCase().includes(lower) ||
        o.customerPhone.includes(lower)
    );
  }

  if (status) {
    filtered = filtered.filter((o) => o.status === status);
  }

  if (paymentStatus) {
    filtered = filtered.filter((o) => o.paymentStatus === paymentStatus);
  }

  // Most recent first
  filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const data  = filtered.slice(start, start + pageSize);

  return { data, total };
}

/**
 * Fetch a single order by ID.
 * Mock implementation — replace with GET /admin/orders/:id
 */
export async function getOrderById(id: string): Promise<Order | null> {
  await new Promise<void>((resolve) => setTimeout(resolve, 50));
  return MOCK_ORDERS.find((o) => o.id === id) ?? null;
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

export interface ProcessRefundPayload {
  method: OrderRefundRecord["method"];
  amount: number;
  items: { productId: string; variantId: string; quantity: number }[];
  processedBy: string;
  note?: string;
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Update order status and append a status history entry.
 * Mock implementation — replace with PATCH /admin/orders/:id/status
 */
export async function updateOrderStatus(
  id: string,
  payload: UpdateOrderStatusPayload
): Promise<Order> {
  await new Promise<void>((resolve) => setTimeout(resolve, 500));
  const order = MOCK_ORDERS.find((o) => o.id === id);
  if (!order) throw new Error(`Order ${id} not found`);
  const now = new Date().toISOString();
  order.status    = payload.status;
  order.updatedAt = now;
  order.statusHistory.push({
    status:    payload.status,
    timestamp: now,
    actorName: "Admin",
    actorRole: "Admin",
    note:      payload.note,
  });
  order.activityLog.push({
    id:        `act-${Date.now()}`,
    timestamp: now,
    actorName: "Admin",
    actorRole: "Admin",
    action:    "Status changed",
    detail:    `→ ${payload.status}${payload.note ? `: ${payload.note}` : ""}`,
  });
  return order;
}

/**
 * Update shipping info (carrier, tracking number, estimated delivery).
 * Mock implementation — replace with PATCH /admin/orders/:id/shipping
 */
export async function updateOrderShipping(
  id: string,
  payload: UpdateOrderShippingPayload
): Promise<Order> {
  await new Promise<void>((resolve) => setTimeout(resolve, 400));
  const order = MOCK_ORDERS.find((o) => o.id === id);
  if (!order) throw new Error(`Order ${id} not found`);
  const now = new Date().toISOString();
  order.shipping = { ...order.shipping, ...payload } as OrderShipping;
  order.updatedAt = now;
  order.activityLog.push({
    id:        `act-${Date.now()}`,
    timestamp: now,
    actorName: "Admin",
    actorRole: "Admin",
    action:    "Shipping updated",
    detail:    `Carrier: ${payload.carrier ?? order.shipping.carrier}, Tracking: ${payload.trackingNumber ?? order.shipping.trackingNumber}`,
  });
  return order;
}

/**
 * Add an internal note to an order.
 * Mock implementation — replace with POST /admin/orders/:id/notes
 */
export async function addOrderNote(
  id: string,
  payload: AddOrderNotePayload
): Promise<OrderInternalNote> {
  await new Promise<void>((resolve) => setTimeout(resolve, 300));
  const order = MOCK_ORDERS.find((o) => o.id === id);
  if (!order) throw new Error(`Order ${id} not found`);
  const now  = new Date().toISOString();
  const note: OrderInternalNote = {
    id:         `note-${Date.now()}`,
    authorName: payload.authorName,
    authorRole: payload.authorRole,
    text:       payload.text,
    createdAt:  now,
  };
  order.internalNotes.push(note);
  order.updatedAt = now;
  return note;
}

/**
 * Process a refund for an order.
 * Mock implementation — replace with POST /admin/orders/:id/refunds
 */
export async function processRefund(
  id: string,
  payload: ProcessRefundPayload
): Promise<OrderRefundRecord> {
  await new Promise<void>((resolve) => setTimeout(resolve, 600));
  const order = MOCK_ORDERS.find((o) => o.id === id);
  if (!order) throw new Error(`Order ${id} not found`);
  const now    = new Date().toISOString();
  const refund: OrderRefundRecord = {
    id:          `ref-${Date.now()}`,
    createdAt:   now,
    method:      payload.method,
    amount:      payload.amount,
    items:       payload.items,
    processedBy: payload.processedBy,
  };
  order.refunds.push(refund);
  order.paymentStatus = "refunded";
  order.updatedAt     = now;
  order.activityLog.push({
    id:        `act-${Date.now()}`,
    timestamp: now,
    actorName: payload.processedBy,
    actorRole: "Admin",
    action:    "Refund processed",
    detail:    `${payload.amount.toLocaleString("vi-VN")}₫ via ${payload.method}`,
  });
  return refund;
}

/**
 * Cancel an order.
 * Mock implementation — replace with POST /admin/orders/:id/cancel
 */
export async function cancelOrder(
  id: string,
  note?: string
): Promise<Order> {
  return updateOrderStatus(id, { status: "cancelled", note });
}

/**
 * Fetch all orders for a specific customer, sorted newest first.
 * Mock implementation — replace with GET /admin/customers/:customerId/orders
 */
export async function getOrdersByCustomerId(
  customerId: string
): Promise<OrderSummary[]> {
  await new Promise<void>((resolve) => setTimeout(resolve, 50));
  return MOCK_ORDER_SUMMARIES
    .filter((o) => o.customerId === customerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
