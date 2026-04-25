import type { Product, ProductVariant, ProductVariantDetail, DetailVariantStatus, SpecificationGroup, VariantMedia, VariantSalesStats } from "@/src/types/product.types";
import type { ReviewSummary } from "@/src/types/review.types";
import { MOCK_VARIANT } from "@/src/app/(dashboard)/products/[id]/variants/[variantId]/_mock";
import { MOCK_SPEC_TEMPLATES } from "@/src/app/(dashboard)/products/_mock_spec_templates";
import { apiFetch } from "@/src/services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GetProductsParams {
  q?: string;
  status?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}

export interface GetProductsResult {
  data: Product[];
  total: number;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export async function getProducts(
  params: GetProductsParams = {}
): Promise<GetProductsResult> {
  const { q, status, category, page = 1, pageSize = 100 } = params;

  const qs = new URLSearchParams();
  if (q)        qs.set("q", q);
  if (status)   qs.set("status", status);
  if (category) qs.set("category", category);
  qs.set("page", String(page));
  qs.set("pageSize", String(pageSize));

  const result = await apiFetch<{ data: Product[]; total: number }>(
    `/admin/products?${qs.toString()}`
  );
  return { data: result.data, total: result.total };
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
  await new Promise<void>((resolve) => setTimeout(resolve, 400));
  void variantIds; void status;
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
  await new Promise<void>((resolve) => setTimeout(resolve, 600));
  const now = new Date().toISOString();
  const variants: ProductVariant[] = data.variants.map((v, i) => ({
    id: `var-new-${Date.now()}-${i}`,
    name: v.name,
    sku: v.sku,
    price: v.price,
    stock: v.stock,
    status: v.status,
    updatedAt: now,
  }));
  return {
    id: `prod-${Date.now()}`,
    name: data.name,
    slug: data.slug,
    category: data.category,
    brands: data.brands,
    totalStock: variants.reduce((s, v) => s + v.stock, 0),
    status: data.status,
    variants,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateProduct(
  id: string,
  data: UpdateProductPayload
): Promise<Product> {
  await new Promise<void>((resolve) => setTimeout(resolve, 600));
  const existing = await getProductById(id);
  if (!existing) throw new Error(`Product ${id} not found`);
  const now = new Date().toISOString();
  const variants: ProductVariant[] = (data.variants ?? existing.variants).map((v, i) => {
    const existingVariant = existing.variants.find((ev) => ev.id === v.id);
    return {
      id: v.id ?? `var-new-${Date.now()}-${i}`,
      name: v.name,
      sku: v.sku,
      price: v.price,
      stock: v.stock,
      status: v.status,
      thumbnailUrl: existingVariant?.thumbnailUrl,
      updatedAt: now,
    };
  });
  return {
    ...existing,
    name: data.name ?? existing.name,
    slug: data.slug ?? existing.slug,
    category: data.category ?? existing.category,
    brands: data.brands ?? existing.brands,
    status: data.status ?? existing.status,
    variants,
    totalStock: variants.reduce((s, v) => s + v.stock, 0),
    updatedAt: now,
  };
}

export async function getVariantById(
  productId: string,
  variantId: string
): Promise<ProductVariantDetail | null> {
  await new Promise<void>((resolve) => setTimeout(resolve, 50));
  if (MOCK_VARIANT.productId === productId && MOCK_VARIANT.id === variantId) {
    return MOCK_VARIANT;
  }
  return null;
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
  _productId: string,
  _variantId: string,
  _data: UpdateVariantDetailPayload
): Promise<ProductVariantDetail> {
  await new Promise<void>((resolve) => setTimeout(resolve, 600));
  return MOCK_VARIANT;
}

export async function getNewVariantTemplate(
  productId: string
): Promise<SpecificationGroup[]> {
  await new Promise<void>((resolve) => setTimeout(resolve, 50));
  return MOCK_SPEC_TEMPLATES[productId] ?? [];
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
  await new Promise<void>((resolve) => setTimeout(resolve, 600));
  const now = new Date().toISOString();
  return {
    id:                  `var-${Date.now()}`,
    productId,
    name:                data.name,
    sku:                 data.sku,
    originalPrice:       data.originalPrice,
    salePrice:           data.salePrice,
    weight:              data.weight ?? undefined,
    status:              data.status,
    updatedAt:           now,
    description:         data.description ?? "",
    specificationGroups: data.specificationGroups ?? [],
    media:               data.media ?? [],
  };
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

interface BrandApiItem { tenThuongHieu: string; }

export async function getProductBrands(): Promise<string[]> {
  const items = await apiFetch<BrandApiItem[]>("/admin/brands");
  return items.map((b) => b.tenThuongHieu);
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

export async function getVariantReviews(variantId: string): Promise<ReviewSummary[]> {
  await delay(300);
  const phienBanId = Number(variantId) || 101;

  return [
    {
      reviewId: 1001,
      phienBanId,
      tenSanPham:      "ASUS ROG Strix GeForce RTX 4090 OC",
      tenPhienBan:     "24GB GDDR6X — Standard Edition",
      anhPhienBan:     "https://picsum.photos/seed/rtx4090/80/80",
      khachHangId:     501,
      khachHangTen:    "Nguyễn Minh Tuấn",
      donHangId:       801,
      maDonHang:       "DH-2024-000801",
      rating:          5,
      tieuDe:          "Card đồ họa tốt nhất tôi từng dùng",
      noiDung:         "Hiệu năng cực kỳ ấn tượng, chạy 4K 144fps mượt mà. Tản nhiệt tốt, sau 2 giờ gaming nhiệt độ chỉ 72°C. Đóng gói cẩn thận, giao hàng nhanh. Rất hài lòng với sản phẩm!",
      trangThai:       "Approved",
      daPhanHoi:       true,
      helpfulCount:    28,
      nguon:           "Website",
      nguoiDuyetId:    1,
      nguoiDuyetTen:   "Admin Hệ thống",
      duyetTai:        "2024-11-05T09:00:00Z",
      createdAt:       "2024-11-04T15:30:00Z",
      updatedAt:       "2024-11-05T09:00:00Z",
    },
    {
      reviewId: 1002,
      phienBanId,
      tenSanPham:      "ASUS ROG Strix GeForce RTX 4090 OC",
      tenPhienBan:     "24GB GDDR6X — Standard Edition",
      anhPhienBan:     "https://picsum.photos/seed/rtx4090/80/80",
      khachHangId:     502,
      khachHangTen:    "Trần Quốc Bảo",
      donHangId:       802,
      maDonHang:       "DH-2024-000802",
      rating:          4,
      tieuDe:          "Mạnh nhưng hơi nóng",
      noiDung:         "Card chạy rất mạnh, 3DMark đạt điểm cao. Tuy nhiên dưới tải nặng nhiệt độ lên đến 85°C, cần case thông gió tốt. Nhìn chung vẫn xứng đáng với số tiền bỏ ra.",
      trangThai:       "Approved",
      daPhanHoi:       true,
      helpfulCount:    14,
      nguon:           "Website",
      nguoiDuyetId:    1,
      nguoiDuyetTen:   "Admin Hệ thống",
      duyetTai:        "2024-11-08T10:15:00Z",
      createdAt:       "2024-11-07T20:10:00Z",
      updatedAt:       "2024-11-08T10:15:00Z",
    },
    {
      reviewId: 1003,
      phienBanId,
      tenSanPham:      "ASUS ROG Strix GeForce RTX 4090 OC",
      tenPhienBan:     "24GB GDDR6X — Standard Edition",
      anhPhienBan:     "https://picsum.photos/seed/rtx4090/80/80",
      khachHangId:     503,
      khachHangTen:    "Lê Thị Phương Anh",
      donHangId:       803,
      maDonHang:       "DH-2024-000803",
      rating:          4,
      tieuDe:          "Sản phẩm ổn, đáng mua",
      noiDung:         "Dùng để làm việc đồ họa và render video 3D, tốc độ render nhanh hơn card cũ 3 lần. RGB đẹp, thiết kế sang trọng. Chỉ tiếc là kích thước khá lớn, không vừa một số case nhỏ.",
      trangThai:       "Approved",
      daPhanHoi:       false,
      helpfulCount:    9,
      nguon:           "Website",
      nguoiDuyetId:    1,
      nguoiDuyetTen:   "Admin Hệ thống",
      duyetTai:        "2024-11-12T14:00:00Z",
      createdAt:       "2024-11-11T11:45:00Z",
      updatedAt:       "2024-11-12T14:00:00Z",
    },
  ];
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
