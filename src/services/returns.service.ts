import { apiFetch } from "@/src/services/api";
import type {
  ReturnRequest,
  ReturnRequestSummary,
  ReturnRequestStatus,
  ReturnLineItem,
  ReturnResolutionRecord,
} from "@/src/types/inventory.types";

// ─── Raw types (IDs are numbers from DB) ──────────────────────────────────────

type RawSummary = Omit<ReturnRequestSummary, "id" | "orderId" | "customerId"> & {
  id: number;
  orderId: number;
  orderCode?: string | null;
  customerId: number;
};

type RawLineItem = Omit<ReturnLineItem, "id" | "productId"> & { id: number; productId?: number };

type RawResolutionRecord = Omit<ReturnResolutionRecord, "id"> & { id: number };

type RawReturnRequest = Omit<
  ReturnRequest,
  "id" | "orderId" | "orderCode" | "customerId" | "lineItems" | "resolutionRecord"
> & {
  id: number;
  orderId: number;
  orderCode?: string | null;
  customerId: number;
  lineItems: RawLineItem[];
  resolutionRecord?: RawResolutionRecord;
};

// ─── Public types ──────────────────────────────────────────────────────────────

export interface GetReturnsParams {
  status?: ReturnRequestStatus | "";
  page?: number;
  limit?: number;
}

export interface GetReturnsResult {
  items: ReturnRequestSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface ProcessRefundDto {
  soTienHoan: number;
  phuongThucHoan: string;
  phieuNhapKhoId?: number;
  maGiaoDichHoan?: string;
  nganHangViHoan?: string;
  ghiChu?: string;
}

export interface ProcessExchangeDto {
  phieuNhapKhoId?: number;
  trackingDoiHang?: string;
  carrierDoiHang?: string;
  ghiChu?: string;
}

export interface UpdateWarrantyStatusDto {
  maBaoHanhHang?: string;
  ngayGuiHangBaoHanh?: string;
  ngayNhanHangVe?: string;
  ketQuaBaoHanh?: string;
  tinhTrangHangNhan?: "NguyenVen" | "HuHong" | "ThieuPhuKien";
}

export interface ProcessWarrantyDto {
  trackingTraKhach: string;
  ghiChu?: string;
}

export interface UpdateReturnStatusDto {
  status: ReturnRequestStatus;
  inspectionResult?: string;
  resolution?: string;
}

export interface ReturnAssetItem {
  id: number;
  returnRequestId: number;
  assetId: number;
  assetUrl?: string;
  sortOrder: number;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export async function getReturns(params: GetReturnsParams = {}): Promise<GetReturnsResult> {
  const { status, page = 1, limit } = params;
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  if (limit) qs.set("limit", String(limit));
  if (status) qs.set("status", status);
  const raw = await apiFetch<{ items: RawSummary[]; total: number; page: number; limit: number }>(
    `/admin/returns?${qs}`
  );
  return {
    ...raw,
    items: raw.items.map((r) => ({
      ...r,
      id:         String(r.id),
      orderId:    String(r.orderId),
      orderCode:  r.orderCode ?? undefined,
      customerId: String(r.customerId),
    })),
  };
}

export async function getReturnById(id: string | number): Promise<ReturnRequest | null> {
  try {
    const raw = await apiFetch<RawReturnRequest>(`/admin/returns/${id}`);
    return {
      ...raw,
      id:         String(raw.id),
      orderId:    String(raw.orderId),
      orderCode:  raw.orderCode ?? undefined,
      customerId: String(raw.customerId),
      lineItems:  raw.lineItems.map((li) => ({
        ...li,
        id:        String(li.id),
        productId: li.productId != null ? String(li.productId) : undefined,
      })),
      resolutionRecord: raw.resolutionRecord
        ? { ...raw.resolutionRecord, id: String(raw.resolutionRecord.id) }
        : undefined,
    };
  } catch (err: unknown) {
    const msg = (err as Error)?.message ?? "";
    if (msg.startsWith("HTTP 404") || msg.includes("không tồn tại")) return null;
    throw err;
  }
}

export async function updateReturnStatus(
  id: string | number,
  dto: UpdateReturnStatusDto,
): Promise<void> {
  await apiFetch<void>(`/admin/returns/${id}/status`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });
}

export async function processRefund(
  returnRequestId: string | number,
  dto: ProcessRefundDto,
): Promise<void> {
  await apiFetch<void>(`/admin/returns/${returnRequestId}/process-refund`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export async function processExchange(
  returnRequestId: string | number,
  dto: ProcessExchangeDto,
): Promise<void> {
  await apiFetch<void>(`/admin/returns/${returnRequestId}/process-exchange`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export async function confirmExchangeDelivered(resolutionId: string | number): Promise<void> {
  await apiFetch<void>(`/admin/returns/resolutions/${resolutionId}/confirm-delivered`, {
    method: "PATCH",
  });
}

export async function initWarranty(
  returnRequestId: string | number,
  phieuNhapKhoId?: number | null,
): Promise<void> {
  await apiFetch<void>(`/admin/returns/${returnRequestId}/init-warranty`, {
    method: "POST",
    body: JSON.stringify({ phieuNhapKhoId: phieuNhapKhoId ?? null }),
  });
}

export async function updateWarrantyStatus(
  resolutionId: string | number,
  dto: UpdateWarrantyStatusDto,
): Promise<void> {
  await apiFetch<void>(`/admin/returns/resolutions/${resolutionId}/warranty-status`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}

export async function processWarranty(
  returnRequestId: string | number,
  dto: ProcessWarrantyDto,
): Promise<void> {
  await apiFetch<void>(`/admin/returns/${returnRequestId}/process-warranty`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export async function getReturnAssets(id: string | number): Promise<ReturnAssetItem[]> {
  return apiFetch<ReturnAssetItem[]>(`/admin/returns/${id}/assets`);
}
