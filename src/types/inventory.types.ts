// ─── Inventory domain types ─────────────────────────────────────────────────

// ── Enums / union types ──────────────────────────────────────────────────────

export type StockMovementType =
  | "stock_in"
  | "stock_out"
  | "adjustment"
  | "return"
  | "transfer";

export type StockInStatus = "pending" | "received" | "partial" | "cancelled";

export type StockOutStatus = "pending" | "packing" | "packed" | "cancelled";

export type StockOutReason =
  | "internal_use"
  | "damage"
  | "loss"
  | "transfer"
  | "promotional"
  | "other";

export type ReturnRequestStatus =
  | "requested"
  | "approved"
  | "rejected"
  | "received"
  | "completed";

export type ReturnReason =
  | "defective"
  | "wrong_item"
  | "damaged_in_transit"
  | "not_as_described"
  | "customer_changed_mind"
  | "other";

export type ReturnResolution = "replacement" | "refund" | "store_credit";

export type SupplierStatus = "active" | "inactive";

export type StockAlertLevel = "ok" | "low_stock" | "out_of_stock_inv";

// ── Warehouse ────────────────────────────────────────────────────────────────

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  isDefault: boolean;
}

// ── Supplier ─────────────────────────────────────────────────────────────────

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  status: SupplierStatus;
  productCount: number;
  totalOrders: number;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

// ── Inventory Item ────────────────────────────────────────────────────────────

export interface InventoryItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  thumbnailUrl?: string;
  supplierId?: string;
  supplierName?: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  lowStockThreshold: number;
  costPrice: number;
  sellingPrice: number;
  location?: string;
  alertLevel: StockAlertLevel;
  lastRestockedAt?: string;
  updatedAt: string;
}

// ── Stock Movement ────────────────────────────────────────────────────────────

export interface StockMovement {
  id: string;
  type: StockMovementType;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  quantityBefore: number;
  quantityChange: number;
  quantityAfter: number;
  referenceId?: string;
  referenceType?: "stock_in" | "stock_out" | "order" | "return" | "manual";
  note?: string;
  performedBy: string;
  performedAt: string;
}

// ── Stock In ──────────────────────────────────────────────────────────────────

export interface StockInLineItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  quantityOrdered: number;
  quantityReceived: number;
  costPrice: number;
  note?: string;
}

export interface StockInRecord {
  id: string;
  receiptCode: string;
  supplierId: string;
  supplierName: string;
  warehouseId: string;
  warehouseName: string;
  status: StockInStatus;
  lineItems: StockInLineItem[];
  expectedDate: string;
  receivedDate?: string;
  totalCost: number;
  note?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockInSummary {
  id: string;
  receiptCode: string;
  supplierId: string;
  supplierName: string;
  warehouseId: string;
  warehouseName: string;
  status: StockInStatus;
  itemCount: number;
  totalCost: number;
  expectedDate: string;
  receivedDate?: string;
  createdBy: string;
  createdAt: string;
}

// ── Stock Out ─────────────────────────────────────────────────────────────────

export interface StockOutLineItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  quantity: number;
  note?: string;
}

export interface StockOutRecord {
  id: string;
  reason: StockOutReason;
  status: StockOutStatus;
  lineItems: StockOutLineItem[];
  scheduledDate?: string;
  completedDate?: string;
  note?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockOutSummary {
  id: string;
  reason: StockOutReason;
  status: StockOutStatus;
  itemCount: number;
  scheduledDate?: string;
  completedDate?: string;
  createdBy: string;
  createdAt: string;
}

// ── Return Request ────────────────────────────────────────────────────────────

export interface ReturnLineItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  quantity: number;
  condition?: "good" | "damaged" | "unusable";
  note?: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  status: ReturnRequestStatus;
  reason: ReturnReason;
  resolution: ReturnResolution;
  lineItems: ReturnLineItem[];
  refundAmount: number;
  requestedAt: string;
  approvedAt?: string;
  receivedAt?: string;
  completedAt?: string;
  adminNote?: string;
  customerNote?: string;
  processedBy?: string;
  updatedAt: string;
}

export interface ReturnRequestSummary {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  status: ReturnRequestStatus;
  reason: ReturnReason;
  resolution: ReturnResolution;
  itemCount: number;
  refundAmount: number;
  requestedAt: string;
  processedBy?: string;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export interface InventoryStats {
  totalSkus: number;
  totalUnits: number;
  lowStockCount: number;
  outOfStockCount: number;
  pendingStockIn: number;
  pendingReturns: number;
  totalInventoryValue: number;
}
