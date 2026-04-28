import type { Product, ProductVariant, ProductVariantDetail, DetailVariantStatus, SpecificationGroup, VariantMedia, VariantSalesStats } from "@/src/types/product.types";
import type { ReviewSummary } from "@/src/types/review.types";
import { apiFetch } from "@/src/services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GetProductsParams {
  q?: string;
  status?: string;
  category?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface GetProductsResult {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export async function getProducts(
  params: GetProductsParams = {}
): Promise<GetProductsResult> {
  const { q, status, category, page = 1, pageSize = 10, sortBy, sortOrder } = params;

  const qs = new URLSearchParams();
  if (q)         qs.set("q", q);
  if (status)    qs.set("status", status);
  if (category)  qs.set("category", category);
  if (sortBy)    qs.set("sortBy", sortBy);
  if (sortOrder) qs.set("sortOrder", sortOrder);
  qs.set("page", String(page));
  qs.set("limit", String(pageSize));

  const result = await apiFetch<{ data: Product[]; total: number; page: number; limit: number; totalPages: number }>(
    `/admin/products?${qs.toString()}`
  );
  return {
    data: result.data,
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  };
}

export async function deleteProduct(id: string): Promise<void> {
  await apiFetch<void>(`/admin/products/${id}`, { method: "DELETE" });
}

export async function bulkUpdateStatus(
  ids: string[],
  status: Product["status"]
): Promise<void> {
  // Sequential calls — no dedicated bulk endpoint yet
  await Promise.all(
    ids.map((id) =>
      apiFetch<unknown>(`/admin/products/${id}`, {
        method: "PUT",
        body: JSON.stringify({ trangThai: statusToTrangThai(status) }),
      })
    )
  );
}

export async function deleteVariant(variantId: string): Promise<void> {
  await apiFetch<void>(`/admin/products/variants/${variantId}`, { method: "DELETE" });
}

export async function setDefaultVariant(
  productId: string,
  variantId: string
): Promise<void> {
  await apiFetch<void>(
    `/admin/products/${productId}/variants/${variantId}/set-default`,
    { method: "PATCH" }
  );
}

export async function bulkUpdateVariantStatus(
  variantIds: string[],
  status: ProductVariant["status"]
): Promise<void> {
  const trangThai = status === "active" ? "HienThi" : "An";
  await Promise.all(
    variantIds.map((id) =>
      apiFetch<unknown>(`/admin/products/variants/${id}`, {
        method: "PUT",
        body: JSON.stringify({ trangThai }),
      })
    )
  );
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    return await apiFetch<Product>(`/admin/products/${id}`);
  } catch (e) {
    // Re-throw Next.js redirect() — it signals via a special error with a digest property
    if (e instanceof Error && "digest" in e) throw e;
    return null;
  }
}

// ─── Payloads ──────────────────────────────────────────────────────────────────

export interface VariantPayload {
  id?: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  status: ProductVariant["status"];
}

export interface CreateProductPayload {
  name: string;
  slug: string;
  category: string;
  brands: string[];
  status: Product["status"];
  variants: VariantPayload[];
}

export interface UpdateProductPayload {
  name?: string;
  slug?: string;
  category?: string;
  brands?: string[];
  status?: Product["status"];
  variants?: VariantPayload[];
}

export async function createProduct(data: CreateProductPayload): Promise<Product> {
  return apiFetch<Product>("/admin/products", {
    method: "POST",
    body: JSON.stringify({
      tenSanPham: data.name,
      maSanPham:  data.slug || data.name.slice(0, 100),
      slug:       data.slug || undefined,
      danhMucId:  Number(data.category),
      trangThai:  statusToTrangThai(data.status),
      brandIds:   data.brands.map(Number),
    }),
  });
}

export async function updateProduct(
  id: string,
  data: UpdateProductPayload
): Promise<Product> {
  return apiFetch<Product>(`/admin/products/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      ...(data.name     && { tenSanPham: data.name }),
      ...(data.slug     && { slug: data.slug }),
      ...(data.category && { danhMucId: Number(data.category) }),
      ...(data.status   && { trangThai: statusToTrangThai(data.status) }),
      ...(data.brands   && { brandIds: data.brands.map(Number) }),
    }),
  });
}

export async function getVariantById(
  productId: string,
  variantId: string
): Promise<ProductVariantDetail | null> {
  try {
    return await apiFetch<ProductVariantDetail>(`/admin/products/${productId}/variants/${variantId}`);
  } catch {
    return null;
  }
}

// ─── Variant detail update ─────────────────────────────────────────────────────

export interface UpdateVariantDetailPayload {
  name?: string;
  sku?: string;
  weight?: number | null;
  originalPrice?: number;
  salePrice?: number;
  status?: ProductVariantDetail["status"];
  description?: string;
  specificationGroups?: ProductVariantDetail["specificationGroups"];
  media?: ProductVariantDetail["media"];
}

export async function updateVariantDetail(
  productId: string,
  variantId: string,
  data: UpdateVariantDetailPayload
): Promise<ProductVariantDetail> {
  const body: Record<string, unknown> = {};
  if (data.name !== undefined)          body.tenPhienBan = data.name;
  if (data.sku !== undefined)           body.sku = data.sku;
  if (data.originalPrice !== undefined) body.giaGoc = data.originalPrice;
  if (data.salePrice !== undefined)     body.giaBan = data.salePrice;
  if (data.weight !== undefined)        body.trongLuong = data.weight;
  if (data.description !== undefined)   body.moTaChiTiet = data.description;
  if (data.status !== undefined)        body.trangThai = detailStatusToDb(data.status);

  if (Object.keys(body).length > 0) {
    await apiFetch<unknown>(`/admin/products/variants/${variantId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  if (data.specificationGroups !== undefined) {
    const specs = data.specificationGroups.flatMap((g) =>
      g.items.map((item) => ({
        loaiThongSoId: Number(item.typeId),
        giaTriThongSo: item.value,
        ...(item.giaTriChuan && { giaTriChuan: item.giaTriChuan }),
        ...(item.giaTriSo != null && { giaTriSo: item.giaTriSo }),
      }))
    );
    await apiFetch<unknown>(`/admin/products/${productId}/variants/${variantId}/specs`, {
      method: "PUT",
      body: JSON.stringify({ specs }),
    });
  }

  if (data.media !== undefined) {
    await apiFetch<unknown>(`/admin/products/${productId}/variants/${variantId}/media`, {
      method: "PUT",
      body: JSON.stringify({
        media: data.media.map((m) => ({
          url: m.url,
          assetId: m.assetId ?? null,
          type: m.type,
          order: m.order,
          ...(m.altText && { altText: m.altText }),
        })),
      }),
    });
  }

  return apiFetch<ProductVariantDetail>(`/admin/products/${productId}/variants/${variantId}`);
}

export async function getNewVariantTemplate(
  productId: string
): Promise<SpecificationGroup[]> {
  const product = await apiFetch<{ categoryId: string }>(`/admin/products/${productId}`);
  if (!product.categoryId) return [];
  return apiFetch<SpecificationGroup[]>(`/admin/specs/template?categoryId=${product.categoryId}`);
}

// ─── Variant detail create ─────────────────────────────────────────────────────

export interface CreateVariantDetailPayload {
  name: string;
  sku: string;
  weight?: number | null;
  originalPrice: number;
  salePrice: number;
  status: DetailVariantStatus;
  description?: string;
  specificationGroups?: SpecificationGroup[];
  media?: VariantMedia[];
}

export async function createVariantDetail(
  productId: string,
  data: CreateVariantDetailPayload
): Promise<ProductVariantDetail> {
  const raw = await apiFetch<{ id: number; sanPhamId: number }>(
    `/admin/products/${productId}/variants`,
    {
      method: "POST",
      body: JSON.stringify({
        tenPhienBan: data.name,
        sku: data.sku,
        giaGoc: data.originalPrice,
        giaBan: data.salePrice,
        ...(data.weight != null && { trongLuong: data.weight }),
        trangThai: detailStatusToDb(data.status),
        ...(data.description && { moTaChiTiet: data.description }),
      }),
    }
  );

  const variantId = String(raw.id);

  if (data.specificationGroups?.length) {
    const specs = data.specificationGroups.flatMap((g) =>
      g.items.map((item) => ({
        loaiThongSoId: Number(item.typeId),
        giaTriThongSo: item.value,
        ...(item.giaTriChuan && { giaTriChuan: item.giaTriChuan }),
        ...(item.giaTriSo != null && { giaTriSo: item.giaTriSo }),
      }))
    );
    await apiFetch<unknown>(`/admin/products/${productId}/variants/${variantId}/specs`, {
      method: "PUT",
      body: JSON.stringify({ specs }),
    });
  }

  if (data.media?.length) {
    await apiFetch<unknown>(`/admin/products/${productId}/variants/${variantId}/media`, {
      method: "PUT",
      body: JSON.stringify({
        media: data.media.map((m) => ({
          url: m.url,
          assetId: m.assetId ?? null,
          type: m.type,
          order: m.order,
          ...(m.altText && { altText: m.altText }),
        })),
      }),
    });
  }

  return apiFetch<ProductVariantDetail>(`/admin/products/${productId}/variants/${variantId}`);
}

export async function cloneProduct(id: string): Promise<Product> {
  return apiFetch<Product>(`/admin/products/${id}/clone`, { method: "POST" });
}

export async function cloneVariant(
  productId: string,
  variantId: string
): Promise<ProductVariant> {
  return apiFetch<ProductVariant>(
    `/admin/products/${productId}/variants/${variantId}/clone`,
    { method: "POST" }
  );
}

/** Sync helper — returns [] until a dedicated dropdown API is wired to the page */
export function getProductCategories(): string[] {
  return [];
}

interface BrandApiItem { id: string; name: string; }

export interface BrandOption { id: string; name: string; }

export async function getProductBrands(): Promise<BrandOption[]> {
  const items = await apiFetch<BrandApiItem[]>("/admin/brands");
  return items.map((b) => ({ id: b.id, name: b.name }));
}

// ─── Variant sales stats ──────────────────────────────────────────────────────

export async function getVariantSalesStats(
  _productId: string,
  _variantId: string
): Promise<VariantSalesStats> {
  await delay(300);
  return {
    tongDonHang:    248,
    tongSoLuongBan: 312,
    doanhThu:       14_644_800_000,
    tyLeHoanTra:    1.6,
  };
}

// ─── Variant reviews ──────────────────────────────────────────────────────────

export interface GetVariantReviewsParams {
  page?: number;
  limit?: number;
  status?: string;
  rating?: number;
}

export interface GetVariantReviewsResult {
  data: ReviewSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: import("@/src/types/product.types").VariantReviewStats;
}

export async function getVariantReviews(
  variantId: string,
  params: GetVariantReviewsParams = {},
): Promise<GetVariantReviewsResult> {
  const { page = 1, limit, status, rating } = params;
  const qs = new URLSearchParams();
  qs.set("variantId", variantId);
  qs.set("page", String(page));
  if (limit) qs.set("limit", String(limit));
  if (status) qs.set("status", status);
  if (rating) qs.set("rating", String(rating));

  const result = await apiFetch<{
    data: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    stats: import("@/src/types/product.types").VariantReviewStats;
  }>(`/admin/reviews?${qs.toString()}`);

  return {
    data: (result?.data ?? []).map(mapToReviewSummary),
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
    stats: result.stats,
  };
}

function mapToReviewSummary(r: any): ReviewSummary {
  return {
    reviewId:        r.id,
    phienBanId:      r.variantId,
    tenSanPham:      r.tenSanPham ?? "",
    tenPhienBan:     r.tenPhienBan ?? "",
    anhPhienBan:     r.anhPhienBan ?? undefined,
    khachHangId:     r.customerId,
    khachHangTen:    r.khachHangTen ?? "",
    khachHangAvatar: r.khachHangAvatar ?? undefined,
    donHangId:       r.orderId,
    maDonHang:       r.maDonHang ?? "",
    rating:          r.rating as 1 | 2 | 3 | 4 | 5,
    tieuDe:          r.title ?? undefined,
    noiDung:         r.content ?? undefined,
    trangThai:       r.status as ReviewSummary["trangThai"],
    daPhanHoi:       Boolean(r.hasReply),
    helpfulCount:    r.helpfulCount ?? 0,
    nguon:           "Website",
    nguoiDuyetId:    r.approvedById ?? undefined,
    nguoiDuyetTen:   r.nguoiDuyetTen ?? undefined,
    lyDoTuChoi:      r.rejectReason ?? undefined,
    duyetTai:        r.approvedAt ?? undefined,
    createdAt:       typeof r.createdAt === "string" ? r.createdAt : new Date(r.createdAt).toISOString(),
    updatedAt:       typeof r.updatedAt === "string" ? r.updatedAt : new Date(r.updatedAt).toISOString(),
  };
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function statusToTrangThai(status: Product["status"]): string {
  const map: Record<Product["status"], string> = {
    published: "DangBan",
    draft: "Nhap",
    archived: "NgungBan",
  };
  return map[status];
}

function detailStatusToDb(status: DetailVariantStatus): string {
  const map: Record<DetailVariantStatus, string> = {
    visible: "HienThi",
    hidden: "An",
    out_of_stock: "HetHang",
  };
  return map[status];
}
