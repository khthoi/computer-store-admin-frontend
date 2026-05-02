import {
  MOCK_STOCK_MOVEMENTS,
} from "@/src/app/(dashboard)/inventory/_mock";
import { apiFetch } from "@/src/services/api";
import type {
  Supplier,
  InventoryItem,
  StockMovement,
  StockInRecord,
  StockInSummary,
  StockInLineItem,
  InventoryStats,
  StockInStatus,
  InventoryKpiDashboard,
  StockBatch,
  VariantStockLevel,
} from "@/src/types/inventory.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function delay(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mapReceiptStatus(beStatus: string): StockInStatus {
  const map: Record<string, StockInStatus> = {
    ChoDuyet:    "pending",
    DaDuyet:     "received",
    TiepNhanMot: "partial",
    TuChoi:      "cancelled",
  };
  return map[beStatus] ?? "pending";
}

const KNOWN_STATUSES = new Set(["pending", "received", "partial", "cancelled"]);

function mapRawToSummary(raw: any): StockInSummary {
  const rawStatus = raw.status ?? raw.trangThai ?? "";
  return {
    id: String(raw.id),
    receiptCode: raw.receiptCode ?? raw.maPhieuNhap ?? "",
    supplierId: String(raw.supplierId ?? raw.nhaCungCapId ?? ""),
    supplierName: raw.supplierName ?? "",
    status: KNOWN_STATUSES.has(rawStatus) ? (rawStatus as StockInStatus) : mapReceiptStatus(rawStatus),
    itemCount: raw.itemCount ?? (raw.items?.length ?? raw.lineItems?.length ?? 0),
    totalCost: raw.totalCost ?? 0,
    expectedDate: raw.expectedDate ?? raw.ngayDuKien ?? raw.ngayNhap ?? "",
    receivedDate: raw.receivedDate ?? raw.ngayDuyet ?? undefined,
    createdBy: raw.createdBy ?? "",
    createdById: raw.createdById != null ? String(raw.createdById) : undefined,
    createdByCode: raw.createdByCode ?? undefined,
    createdAt: raw.createdAt ?? raw.ngayNhap ?? "",
  };
}

function mapRawToRecord(raw: any): StockInRecord {
  const lineItems: StockInLineItem[] = (raw.lineItems ?? raw.items ?? []).map((i: any) => ({
    id: String(i.id),
    productId: String(i.productId ?? ""),
    variantId: String(i.variantId ?? i.phienBanId ?? ""),
    productName: i.productName ?? "",
    variantName: i.variantName ?? "",
    sku: i.sku ?? "",
    quantityOrdered: i.quantityOrdered ?? i.soLuongDuKien ?? 0,
    quantityReceived: i.quantityReceived ?? i.soLuongThucNhap ?? 0,
    quantityDamaged: i.quantityDamaged ?? 0,
    quantityShort: i.quantityShort ?? 0,
    costPrice: Number(i.costPrice ?? i.donGiaNhap ?? 0),
    sellingPrice: i.sellingPrice != null ? Number(i.sellingPrice) : undefined,
    note: i.note ?? i.ghiChu ?? undefined,
  }));
  const summary = mapRawToSummary(raw);
  return {
    ...summary,
    createdById: raw.createdById != null ? String(raw.createdById) : undefined,
    createdByCode: raw.createdByCode ?? undefined,
    lineItems,
    totalCost: raw.totalCost ?? lineItems.reduce((s, i) => s + i.costPrice * i.quantityOrdered, 0),
    note: raw.note ?? raw.ghiChu ?? undefined,
    updatedAt: raw.updatedAt ?? raw.createdAt ?? raw.ngayNhap ?? "",
    predecessorId: raw.predecessorId != null ? String(raw.predecessorId) : undefined,
    predecessorCode: raw.predecessorCode ?? undefined,
    successorId: raw.successorId != null ? String(raw.successorId) : undefined,
    successorCode: raw.successorCode ?? undefined,
  };
}

// ─── Inventory Overview ───────────────────────────────────────────────────────

export async function getInventoryStats(): Promise<InventoryStats> {
  return apiFetch<InventoryStats>("/admin/inventory/summary");
}

// ─── Inventory Items (server-side paginated) ──────────────────────────────────

export interface InventoryItemParams {
  page?: number;
  limit?: number;
  q?: string;
  alertLevel?: string;
  supplierId?: string;
  categoryId?: string;
  sortKey?: string;
  sortDir?: "asc" | "desc";
  lowStockOnly?: boolean;
}

export interface InventoryItemPage {
  data: InventoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getInventoryItems(
  params: InventoryItemParams = {}
): Promise<InventoryItemPage> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.q) qs.set("q", params.q);
  if (params.alertLevel) qs.set("alertLevel", params.alertLevel);
  if (params.supplierId) qs.set("supplierId", params.supplierId);
  if (params.categoryId) qs.set("categoryId", params.categoryId);
  if (params.sortKey) qs.set("sortKey", params.sortKey);
  if (params.sortDir) qs.set("sortDir", params.sortDir);
  if (params.lowStockOnly) qs.set("lowStockOnly", "true");
  return apiFetch<InventoryItemPage>(`/admin/inventory?${qs}`);
}

export async function getInventorySummary(): Promise<InventoryStats> {
  return apiFetch<InventoryStats>("/admin/inventory/summary");
}

export async function adjustStock(
  variantId: string,
  delta: number,
  loaiGiaoDich: string,
  note: string
): Promise<void> {
  await apiFetch<void>("/admin/inventory/adjust", {
    method: "POST",
    body: JSON.stringify({
      phienBanId: Number(variantId),
      soLuong: delta,
      loaiGiaoDich,
      ghiChu: note,
    }),
  });
}

export async function updateThresholds(
  variantId: string,
  dto: { lowStockThreshold: number; reorderPoint: number }
): Promise<void> {
  await apiFetch<void>(`/admin/inventory/${variantId}/thresholds`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}

// ─── Stock Movements ──────────────────────────────────────────────────────────

export async function getStockMovements(): Promise<StockMovement[]> {
  await delay();
  return [...MOCK_STOCK_MOVEMENTS].sort(
    (a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime()
  );
}

// ─── Suppliers ────────────────────────────────────────────────────────────────

export interface SupplierListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface SupplierListPage {
  data: Supplier[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getSuppliers(params: SupplierListParams = {}): Promise<SupplierListPage> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.search) qs.set("search", params.search);
  if (params.status) qs.set("status", params.status);
  if (params.sortBy) qs.set("sortBy", params.sortBy);
  if (params.sortDir) qs.set("sortDir", params.sortDir);
  return apiFetch<SupplierListPage>(`/admin/suppliers?${qs}`);
}

export async function getSupplierById(id: string): Promise<Supplier> {
  return apiFetch<Supplier>(`/admin/suppliers/${id}`);
}

export async function createSupplier(
  payload: Omit<Supplier, "id" | "productCount" | "totalOrders" | "createdAt" | "updatedAt">
): Promise<Supplier> {
  return apiFetch<Supplier>("/admin/suppliers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateSupplier(
  id: string,
  payload: Partial<Omit<Supplier, "id" | "createdAt">>
): Promise<Supplier> {
  return apiFetch<Supplier>(`/admin/suppliers/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// ─── Stock In ─────────────────────────────────────────────────────────────────

export interface StockInListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface StockInListPage {
  data: StockInSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getStockInList(params: StockInListParams = {}): Promise<StockInListPage> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.search) qs.set("search", params.search);
  if (params.status) qs.set("status", params.status);
  if (params.sortBy) qs.set("sortBy", params.sortBy);
  if (params.sortOrder) qs.set("sortOrder", params.sortOrder);
  const result = await apiFetch<any>(`/admin/inventory/import?${qs}`);
  const items: any[] = Array.isArray(result) ? result : (result?.data ?? []);
  return {
    data: items.map(mapRawToSummary),
    total: result?.total ?? items.length,
    page: result?.page ?? params.page ?? 1,
    limit: result?.limit ?? params.limit ?? items.length,
    totalPages: result?.totalPages ?? 1,
  };
}

export async function getStockInById(id: string): Promise<StockInRecord | null> {
  const raw = await apiFetch<any>(`/admin/inventory/import/${id}`);
  return raw ? mapRawToRecord(raw) : null;
}

export async function createStockIn(
  payload: Pick<StockInRecord, "receiptCode" | "supplierId" | "supplierName" | "expectedDate" | "note" | "lineItems">
): Promise<StockInRecord> {
  const raw = await apiFetch<any>("/admin/inventory/import", {
    method: "POST",
    body: JSON.stringify({
      nhaCungCapId: Number(payload.supplierId),
      ngayDuKien: payload.expectedDate,
      ghiChu: payload.note,
      items: payload.lineItems.map((l) => ({
        phienBanId: Number(l.variantId),
        soLuongDuKien: l.quantityOrdered,
        donGiaNhap: l.costPrice,
        ghiChu: l.note,
      })),
    }),
  });
  return mapRawToRecord(raw);
}

export async function updateStockInStatus(
  id: string,
  status: StockInStatus,
): Promise<StockInRecord> {
  const raw = await apiFetch<any>(`/admin/inventory/import/${id}/reject`, {
    method: "PUT",
  });
  return mapRawToRecord(raw);
}

export async function receiveStockIn(
  id: string,
  receivedQtys: Record<string, number>,
  lineItems: StockInLineItem[],
  notes?: Record<string, string>,
  damaged?: Record<string, number>,
): Promise<StockInRecord> {
  const raw = await apiFetch<any>(`/admin/inventory/import/${id}/approve`, {
    method: "PUT",
    body: JSON.stringify({
      items: lineItems.map((li) => ({
        phienBanId: Number(li.variantId),
        soLuongThucNhap: receivedQtys[li.id] ?? 0,
        soLuongHuHong: damaged?.[li.id] ?? 0,
        ...(notes?.[li.id] !== undefined ? { ghiChu: notes[li.id] } : {}),
      })),
    }),
  });
  return mapRawToRecord(raw);
}

export async function completeStockIn(id: string): Promise<StockInRecord> {
  const raw = await apiFetch<any>(`/admin/inventory/import/${id}/complete`, {
    method: "PUT",
  });
  return mapRawToRecord(raw);
}

export async function resolvePartialReceipt(id: string): Promise<StockInRecord> {
  const raw = await apiFetch<any>(`/admin/inventory/import/${id}/resolve`, {
    method: "PUT",
  });
  return mapRawToRecord(raw);
}

export async function getLowStockItems(
  params: InventoryItemParams = {}
): Promise<InventoryItemPage> {
  // When no specific alertLevel is requested, restrict to risk items only
  const effectiveParams = params.alertLevel
    ? params
    : { ...params, lowStockOnly: true };
  return getInventoryItems(effectiveParams);
}

// ─── KPI Dashboard ────────────────────────────────────────────────────────────

export async function getInventoryKpiDashboard(
  params: { period?: string; startDate?: string; endDate?: string } = {}
): Promise<InventoryKpiDashboard> {
  const qs = new URLSearchParams();
  if (params.period) qs.set("period", params.period);
  if (params.startDate) qs.set("startDate", params.startDate);
  if (params.endDate) qs.set("endDate", params.endDate);
  const query = qs.toString();
  return apiFetch<InventoryKpiDashboard>(`/admin/inventory/kpi/dashboard${query ? `?${query}` : ""}`);
}

// ─── Stock Movements (server-side paginated) ──────────────────────────────────

export interface StockMovementParams {
  page?: number;
  limit?: number;
  types?: string[];
  variantId?: string;
  dateFrom?: string;
  dateTo?: string;
  referenceType?: string;
  q?: string;
  sortBy?: string;
  sortDir?: string;
}

export interface StockMovementPage {
  data: StockMovement[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getStockMovementsPaginated(
  params: StockMovementParams = {}
): Promise<StockMovementPage> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.types && params.types.length > 0) qs.set("types", params.types.join(","));
  if (params.variantId) qs.set("variantId", params.variantId);
  if (params.dateFrom) qs.set("dateFrom", params.dateFrom);
  if (params.dateTo) qs.set("dateTo", params.dateTo);
  if (params.referenceType) qs.set("referenceType", params.referenceType);
  if (params.q) qs.set("q", params.q);
  if (params.sortBy) qs.set("sortBy", params.sortBy);
  if (params.sortDir) qs.set("sortDir", params.sortDir);
  return apiFetch<StockMovementPage>(`/admin/inventory/movements?${qs}`);
}

// ─── Receipt Code Preview ─────────────────────────────────────────────────────

export async function getNextReceiptCode(): Promise<string> {
  const res = await apiFetch<{ code: string }>("/admin/inventory/import/next-code");
  return res.code;
}

// ─── Stock Batches ────────────────────────────────────────────────────────────

export async function getVariantStockLevel(variantId: string): Promise<VariantStockLevel> {
  return apiFetch<VariantStockLevel>(`/admin/inventory/${variantId}/stock-level`);
}

export async function getBatchesByVariant(variantId: string): Promise<StockBatch[]> {
  return apiFetch<StockBatch[]>(`/admin/inventory/${variantId}/batches`);
}


export async function getVariantHistory(
  variantId: string,
  params: { page?: number; limit?: number; startDate?: string; endDate?: string; loaiGiaoDich?: string } = {}
): Promise<StockMovementPage> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.startDate) qs.set("startDate", params.startDate);
  if (params.endDate) qs.set("endDate", params.endDate);
  if (params.loaiGiaoDich) qs.set("loaiGiaoDich", params.loaiGiaoDich);
  return apiFetch<StockMovementPage>(`/admin/inventory/${variantId}/history?${qs}`);
}
