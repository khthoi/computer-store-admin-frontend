// ─── Order domain types ────────────────────────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export type PaymentStatus = "unpaid" | "paid" | "refunded" | "partially_refunded";

export type PaymentMethod = "cod" | "bank_transfer" | "credit_card" | "momo" | "zalopay" | "vnpay";

export type RefundMethod = "original" | "store_credit";

export interface OrderAddress {
  fullName: string;
  phone: string;
  street: string;
  ward: string;
  district: string;
  city: string;
}

export interface OrderLineItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  thumbnailUrl?: string;
  quantity: number;
  unitPrice: number;
  originalPrice: number;
}

// Raw enum values stored in activity log (more granular than main OrderStatus)
export type OrderActivityStatus =
  | "ChoXuLy"
  | "DaXacNhan"
  | "DangXuLy"
  | "DangChuanBiHang"
  | "ChuanBiBanGiao"
  | "DangGiao"
  | "DaGiao";

export interface OrderActivityEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  actorId?: string;
  actorAvatarUrl?: string;
  action: string;
  detail?: string;
  orderStatus?: OrderActivityStatus;
}

export interface OrderInternalNote {
  id: string;
  authorName: string;
  authorRole: string;
  authorId?: string;
  authorAvatarUrl?: string;
  text: string;
  createdAt: string;
}

export interface OrderShipping {
  carrier?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  address: OrderAddress;
}

export interface OrderRefundRecord {
  id: string;
  createdAt: string;
  method: RefundMethod;
  amount: number;
  status: "pending" | "completed" | "rejected";
  items: { productId: string; variantId: string; quantity: number }[];
  processedBy: string;
  processedById?: string;
  // Track A settlement evidence
  externalRef?: string;
  settledAt?: string;
  bank?: string;
  errorNote?: string;
  returnRequestId?: number;
}

// ─── Return request types ──────────────────────────────────────────────────────

export type ReturnRequestStatus = "ChoDuyet" | "DaDuyet" | "TuChoi" | "DangXuLy" | "HoanThanh";
export type ReturnRequestType   = "DoiHang" | "TraHang" | "BaoHanh";
export type ReturnResolution    = "GiaoHangMoi" | "HoanTien" | "BaoHanh";

export interface ReturnRequestItem {
  variantId: string;
  variantName: string;
  productName: string;
  thumbnailUrl?: string;
  requestedQty: number;
  refundedQty: number;
}

export interface OrderReturnRequest {
  id: number;
  requestType: ReturnRequestType;
  reason: string;
  description?: string;
  status: ReturnRequestStatus;
  resolution?: ReturnResolution;
  createdAt: string;
  updatedAt: string;
  processedByName?: string;
  items: ReturnRequestItem[];
}

export interface Order {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  channel: "website" | "pos" | "phone";
  customerId: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    userId: string;
  };
  lineItems: OrderLineItem[];
  shipping: OrderShipping;
  billingAddress?: OrderAddress;
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  shippingFee: number;
  tax: number;
  grandTotal: number;
  customerNote?: string;
  internalNotes: OrderInternalNote[];
  activityLog: OrderActivityEntry[];
  refunds: OrderRefundRecord[];
}

export interface OrderSummary {
  id: string;
  createdAt: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  customerId: string;
  customerName: string;
  customerPhone: string;
  itemCount: number;
  grandTotal: number;
}
