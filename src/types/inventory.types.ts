// ─── Inventory domain types ─────────────────────────────────────────────────

// ── Enums / union types ──────────────────────────────────────────────────────

export type StockMovementType =
  | "stock_in"
  | "stock_out"
  | "adjustment"
  | "return";

export type StockInStatus = "pending" | "received" | "partial" | "cancelled";

export type ReturnRequestStatus =
  | "ChoDuyet"
  | "DaDuyet"
  | "TuChoi"
  | "DangXuLy"
  | "HoanThanh";

export type ReturnRequestType = "DoiHang" | "TraHang" | "BaoHanh";

export type ReturnResolution = "GiaoHangMoi" | "HoanTien" | "BaoHanh";

export type SupplierStatus = "active" | "inactive";

export type StockAlertLevel = "ok" | "low_stock" | "out_of_stock_inv";

// ── Supplier ─────────────────────────────────────────────────────────────────

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  status: SupplierStatus;
  leadTimeDays?: number;
  productCount: number;
  totalOrders: number;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

// ── Variant Stock Level ───────────────────────────────────────────────────────

export interface VariantStockLevel {
  quantityOnHand: number;
  lowStockThreshold: number;
  averageCostPrice: number;
  reorderPoint: number;
  alertLevel: StockAlertLevel;
  updatedAt: string | null;
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
  performedById?: string;
  performedByCode?: string;
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
  quantityDamaged: number;
  quantityShort: number;
  costPrice: number;
  sellingPrice?: number;
  note?: string;
}

export interface StockInRecord {
  id: string;
  receiptCode: string;
  supplierId: string;
  supplierName: string;
  status: StockInStatus;
  lineItems: StockInLineItem[];
  expectedDate: string;
  receivedDate?: string;
  totalCost: number;
  note?: string;
  createdBy: string;
  createdById?: string;
  createdByCode?: string;
  createdAt: string;
  updatedAt: string;
  predecessorId?: string;
  predecessorCode?: string;
  successorId?: string;
  successorCode?: string;
}

export interface StockInSummary {
  id: string;
  receiptCode: string;
  supplierId: string;
  supplierName: string;
  status: StockInStatus;
  itemCount: number;
  totalCost: number;
  expectedDate: string;
  receivedDate?: string;
  createdBy: string;
  createdById?: string;
  createdByCode?: string;
  createdAt: string;
}

// ── Return Request ────────────────────────────────────────────────────────────

export interface ReturnLineItem {
  id: string;
  productId?: string;
  variantId: string;
  variantName: string;
  productName: string;
  sku?: string;
  thumbnailUrl?: string;
  quantity: number;
  refundedQty: number;
}

export interface ReturnResolutionRecord {
  id: string;
  resolution: ReturnResolution;
  status: "DangXuLy" | "HoanThanh" | "ThatBai";
  soTienHoan?: number;
  phuongThucHoan?: string;
  maBaoHanhHang?: string;
  ngayGuiHangBaoHanh?: string;
  ngayNhanHangVe?: string;
  ketQuaBaoHanh?: string;
  createdAt: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  orderCode?: string;
  customerId: string;
  customerName: string;
  requestType: ReturnRequestType;
  status: ReturnRequestStatus;
  reason: string;
  description?: string;
  resolution?: ReturnResolution;
  resolutionRecord?: ReturnResolutionRecord;
  lineItems: ReturnLineItem[];
  inspectionResult?: string;
  processedByName?: string;
  processedById?: string;
  requestedAt: string;
  updatedAt: string;
}

export interface ReturnRequestSummary {
  id: string;
  orderId: string;
  orderCode?: string;
  customerId: string;
  customerName?: string;
  requestType: ReturnRequestType;
  status: ReturnRequestStatus;
  reason: string;
  resolution?: ReturnResolution;
  itemCount: number;
  requestedAt: string;
  processedByName?: string;
  processedById?: string;
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

export interface TopMovingSku {
  variantId: string;
  sku: string;
  productName: string;
  variantName: string;
  thumbnailUrl?: string;
  totalSold: number;
  turnoverRate: number;
}

export interface UrgentReorderItem {
  variantId: string;
  sku: string;
  productName: string;
  variantName: string;
  quantityOnHand: number;
  reorderPoint: number;
  urgency: "khan_cap" | "can_som" | "binh_thuong";
}

export interface InventoryKpiDashboard {
  basicStats: InventoryStats;
  deadStockCount: number;
  deadStockValue: number;
  pendingImportValue: number;
  turnoverRate: number;
  fillRate: number;
  topMovingSkus: TopMovingSku[];
  urgentReorders: UrgentReorderItem[];
}

// ── Stock Batch ───────────────────────────────────────────────────────────────

export interface StockBatch {
  id: string;
  maLo: string;
  variantId: string;
  importReceiptId: string;
  receiptCode: string;
  quantityImported: number;
  quantityRemaining: number;
  costPrice: number;
  importedAt: string;
  expiresAt?: string;
  note?: string;
  createdBy?: string;
  createdByCode?: string;
  // Enriched by getBatchesByVariant
  productId?: string;
  productName?: string;
  variantName?: string;
  sku?: string;
  sellingPrice?: number;
  thumbnailUrl?: string;
  trangThai?: 'con_hang' | 'da_het';
  /** Oldest batch with remaining stock — next to be deducted by FIFO */
  isNextFifo?: boolean;
}


// ── Export Receipts ───────────────────────────────────────────────────────────

export type LoaiPhieuXuat = "XuatHuy" | "XuatDieuChinh" | "XuatNoiBo" | "XuatBan";

export interface ExportReceiptSummaryDto {
  id: string;
  receiptCode: string;
  loaiPhieu: LoaiPhieuXuat;
  loaiPhieuLabel: string;
  createdById: string;
  createdByCode: string;
  createdBy: string;
  lyDo: string;
  itemCount: number;
  totalQty: number;
  tongGiaVon: number;
  createdAt: string;
}

export interface BatchDeductionDto {
  loId: string;
  maLo: string;
  soLuong: number;
  giaVon: number;
}

export interface ExportReceiptLineItemDto {
  id: string;
  variantId: string;
  productId: string;
  productName: string;
  variantName: string;
  sku: string;
  quantityExported: number;
  costPrice: number;
  totalCost: number;
  batchesDeducted: BatchDeductionDto[];
  note?: string;
}

export interface ExportReceiptDetailDto extends ExportReceiptSummaryDto {
  ghiChu?: string;
  lineItems: ExportReceiptLineItemDto[];
}
