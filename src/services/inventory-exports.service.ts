import { apiFetch } from "@/src/services/api";
import type {
  ExportReceiptDetailDto,
  ExportReceiptSummaryDto,
  LoaiPhieuXuat,
} from "@/src/types/inventory.types";

export type { LoaiPhieuXuat };

export interface CreateExportReceiptPayload {
  loaiPhieu: Exclude<LoaiPhieuXuat, "XuatBan">;
  lyDo: string;
  ghiChu?: string;
  items: { phienBanId: number; soLuong: number; ghiChu?: string }[];
}

export interface QueryExportReceiptParams {
  page?: number;
  limit?: number;
  loaiPhieu?: LoaiPhieuXuat;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export async function createExportReceipt(payload: CreateExportReceiptPayload) {
  return apiFetch<ExportReceiptDetailDto>("/admin/inventory/export", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getExportReceipts(params: QueryExportReceiptParams = {}) {
  const qs = new URLSearchParams();
  const entries: [string, string | number | undefined][] = [
    ["page", params.page],
    ["limit", params.limit],
    ["loaiPhieu", params.loaiPhieu],
    ["search", params.search],
    ["startDate", params.startDate],
    ["endDate", params.endDate],
    ["sortBy", params.sortBy],
    ["sortOrder", params.sortOrder],
  ];
  entries.forEach(([k, v]) => {
    if (v != null) qs.set(k, String(v));
  });
  return apiFetch<{
    data: ExportReceiptSummaryDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>(`/admin/inventory/export?${qs}`);
}

export async function getExportReceiptById(id: string) {
  return apiFetch<ExportReceiptDetailDto>(`/admin/inventory/export/${id}`);
}
