import { apiFetch } from "@/src/services/api";
import type {
  FlashSale,
  FlashSaleSummary,
  FlashSaleFormPayload,
  FlashSaleStatus,
  FlashSaleStats,
  FlashSaleListParams,
  PaginatedResponse,
  VariantSearchResult,
} from "@/src/types/flash-sale.types";

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function getFlashSales(
  params: FlashSaleListParams
): Promise<PaginatedResponse<FlashSaleSummary>> {
  const qs = new URLSearchParams();
  qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.status) qs.set("status", params.status);
  if (params.search) qs.set("search", params.search);
  return apiFetch<PaginatedResponse<FlashSaleSummary>>(
    `/admin/flash-sales?${qs}`
  );
}

export async function getFlashSaleById(
  id: string | number
): Promise<FlashSale | null> {
  try {
    return await apiFetch<FlashSale>(`/admin/flash-sales/${id}`);
  } catch {
    return null;
  }
}

export async function createFlashSale(
  payload: FlashSaleFormPayload
): Promise<FlashSale> {
  const body = {
    ten: payload.ten,
    moTa: payload.moTa,
    trangThai: payload.trangThai,
    batDau: payload.batDau,
    ketThuc: payload.ketThuc,
    bannerTitle: payload.bannerTitle,
    bannerImageUrl: payload.bannerImageUrl,
    bannerAlt: payload.bannerAlt,
    items: payload.items.map(({ phienBanId, giaFlash, soLuongGioiHan, thuTuHienThi }) => ({
      phienBanId,
      giaFlash,
      soLuongGioiHan,
      thuTuHienThi,
    })),
  };
  return apiFetch<FlashSale>("/admin/flash-sales", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateFlashSale(
  id: string | number,
  payload: Partial<FlashSaleFormPayload>
): Promise<FlashSale> {
  const body: Record<string, unknown> = {};
  if (payload.ten !== undefined) body.ten = payload.ten;
  if (payload.moTa !== undefined) body.moTa = payload.moTa;
  if (payload.batDau !== undefined) body.batDau = payload.batDau;
  if (payload.ketThuc !== undefined) body.ketThuc = payload.ketThuc;
  if (payload.bannerTitle !== undefined) body.bannerTitle = payload.bannerTitle;
  if (payload.bannerImageUrl !== undefined) body.bannerImageUrl = payload.bannerImageUrl;
  if (payload.bannerAlt !== undefined) body.bannerAlt = payload.bannerAlt;
  if (payload.trangThai !== undefined) body.trangThai = payload.trangThai;
  if (payload.items !== undefined) {
    body.items = payload.items.map(({ phienBanId, giaFlash, soLuongGioiHan, thuTuHienThi }) => ({
      phienBanId,
      giaFlash,
      soLuongGioiHan,
      thuTuHienThi,
    }));
  }
  return apiFetch<FlashSale>(`/admin/flash-sales/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function updateFlashSaleStatus(
  id: string | number,
  status: FlashSaleStatus
): Promise<FlashSale> {
  if (status === "paused") return pauseFlashSale(id);
  if (status === "active") return activateFlashSale(id);
  return updateFlashSale(id, { trangThai: status } as Partial<FlashSaleFormPayload>);
}

export async function pauseFlashSale(id: string | number): Promise<FlashSale> {
  return apiFetch<FlashSale>(`/admin/flash-sales/${id}/pause`, { method: "PATCH" });
}

export async function activateFlashSale(id: string | number): Promise<FlashSale> {
  return apiFetch<FlashSale>(`/admin/flash-sales/${id}/activate`, { method: "PATCH" });
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function getFlashSaleStats(): Promise<FlashSaleStats> {
  return apiFetch<FlashSaleStats>("/admin/flash-sales/stats");
}

// ─── Variant search ───────────────────────────────────────────────────────────

export async function searchVariantsForFlashSale(
  query: string,
  excludeIds?: number[]
): Promise<VariantSearchResult[]> {
  if (!query.trim()) return [];
  const qs = new URLSearchParams({ q: query.trim() });
  if (excludeIds?.length) qs.set("exclude", excludeIds.join(","));
  return apiFetch<VariantSearchResult[]>(
    `/admin/flash-sales/search-variants?${qs}`
  );
}
