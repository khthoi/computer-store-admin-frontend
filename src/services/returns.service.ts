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
  returnTrackingCode?: string | null;
  returnCarrier?: string | null;
  returnReceivedAt?: string | null;
};

type RawLineItem = Omit<ReturnLineItem, "id" | "productId"> & { id: number; productId?: number };

type RawResolutionRecord = Omit<ReturnResolutionRecord, "id"> & {
  id: number;
  trackingDoiHang?: string | null;
  carrierDoiHang?: string | null;
  trackingTraKhach?: string | null;
  defectiveHandling?: import("@/src/types/inventory.types").DefectiveHandling | null;
  defectiveHandledAt?: string | null;
  defectiveHandledById?: number | null;
  defectiveNotes?: string | null;
};

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
  returnTrackingCode?: string | null;
  returnCarrier?: string | null;
  returnReceivedAt?: string | null;
  returnReceivedById?: number | null;
  returnReceivedByName?: string | null;
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
  trackingGuiNhaSanXuat?: string;
  carrierGuiNhaSanXuat?: string;
}

export interface ProcessWarrantyDto {
  trackingTraKhach: string;
  carrierTraKhach: string;
  ghiChu?: string;
}

export interface UpdateReturnStatusDto {
  status: ReturnRequestStatus;
  inspectionResult?: string;
  resolution?: string;
}

export interface ConfirmReceivedDto {
  returnTrackingCode?: string;
  returnCarrier?: string;
}

export interface CompleteReuseDto {
  phieuNhapKhoId: number;
  ghiChu?: string;
}

export interface UpdateDefectiveHandlingDto {
  defectiveHandling: "TraNhaCungCap" | "TieuHuy" | "TaiSuDung";
  defectiveNotes?: string;
}

export interface ReturnAssetItem {
  id: number;
  returnRequestId: number;
  assetId: number;
  assetUrl?: string;
  sortOrder: number;
  loaiAsset: string;
}

export interface RejectAfterInspectionDto {
  rejectTrackingCode?: string;
  rejectCarrier?: string;
  rejectNotes?: string;
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
): Promise<ReturnRequest> {
  const raw = await apiFetch<RawReturnRequest>(`/admin/returns/${id}/status`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });
  return mapRawReturn(raw);
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

function mapRawReturn(raw: RawReturnRequest, fallbackLineItems?: ReturnRequest["lineItems"]): ReturnRequest {
  const lineItems = raw.lineItems?.length
    ? raw.lineItems.map((li) => ({
        ...li,
        id:        String(li.id),
        productId: li.productId != null ? String(li.productId) : undefined,
      }))
    : (fallbackLineItems ?? []);
  return {
    ...raw,
    id:         String(raw.id),
    orderId:    String(raw.orderId),
    orderCode:  raw.orderCode ?? undefined,
    customerId: String(raw.customerId),
    lineItems,
    resolutionRecord: raw.resolutionRecord
      ? { ...raw.resolutionRecord, id: String(raw.resolutionRecord.id) }
      : undefined,
  };
}

export async function confirmReceived(
  returnRequestId: string | number,
  dto: ConfirmReceivedDto = {},
): Promise<ReturnRequest> {
  const raw = await apiFetch<RawReturnRequest>(
    `/admin/returns/${returnRequestId}/confirm-received`,
    { method: "PATCH", body: JSON.stringify(dto) },
  );
  return mapRawReturn(raw);
}

export async function updateInspectionResult(
  id: string | number,
  inspectionResult: string,
): Promise<ReturnRequest> {
  const raw = await apiFetch<RawReturnRequest>(`/admin/returns/${id}/inspection`, {
    method: "PATCH",
    body: JSON.stringify({ inspectionResult }),
  });
  return mapRawReturn(raw);
}

export async function completeInspection(id: string | number): Promise<ReturnRequest> {
  const raw = await apiFetch<RawReturnRequest>(`/admin/returns/${id}/complete-inspection`, {
    method: "POST",
  });
  return mapRawReturn(raw);
}

export async function updateDefectiveHandling(
  resolutionId: string | number,
  dto: UpdateDefectiveHandlingDto,
): Promise<void> {
  await apiFetch<void>(
    `/admin/returns/resolutions/${resolutionId}/defective-handling`,
    { method: "PATCH", body: JSON.stringify(dto) },
  );
}

export async function completeReuse(
  resolutionId: string | number,
  dto: CompleteReuseDto,
): Promise<void> {
  await apiFetch<void>(
    `/admin/returns/resolutions/${resolutionId}/complete-reuse`,
    { method: "PATCH", body: JSON.stringify(dto) },
  );
}

export async function rejectAfterInspection(
  returnRequestId: string | number,
  dto: RejectAfterInspectionDto,
): Promise<ReturnRequest> {
  const raw = await apiFetch<RawReturnRequest>(`/admin/returns/${returnRequestId}/reject-after-inspection`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
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
}

export interface ChangeResolutionDto {
  newResolution: "HoanTien" | "GiaoHangMoi";
  ghiChu?: string;
}

export async function changeResolution(
  returnRequestId: string | number,
  dto: ChangeResolutionDto,
): Promise<ReturnRequest> {
  const raw = await apiFetch<RawReturnRequest>(`/admin/returns/${returnRequestId}/change-resolution`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
  return mapRawReturn(raw);
}

export async function addReturnAsset(
  returnRequestId: string | number,
  assetId: number,
  loaiAsset: "customer_evidence" | "inspection_evidence",
): Promise<ReturnAssetItem[]> {
  return apiFetch<ReturnAssetItem[]>(`/admin/returns/${returnRequestId}/assets`, {
    method: "POST",
    body: JSON.stringify({ assetId, loaiAsset }),
  });
}
