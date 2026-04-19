import type { Product, ProductVariant, ProductVariantDetail, DetailVariantStatus, SpecificationGroup, VariantMedia, VariantSalesStats } from "@/src/types/product.types";
import type { ReviewSummary } from "@/src/types/review.types";
import { MOCK_PRODUCTS } from "@/src/app/(dashboard)/products/_mock";
import { MOCK_VARIANT } from "@/src/app/(dashboard)/products/[id]/variants/[variantId]/_mock";
import { MOCK_SPEC_TEMPLATES } from "@/src/app/(dashboard)/products/_mock_spec_templates";

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

/**
 * Fetch products with optional filtering and pagination.
 * Mock implementation — replace body with real fetch call when backend is ready.
 *
 * Real endpoint: GET /admin/products?q=&status=&category=&page=&pageSize=
 */
export async function getProducts(
  params: GetProductsParams = {}
): Promise<GetProductsResult> {
  const { q = "", status = "", category = "", page = 1, pageSize = 100 } = params;

  let filtered: Product[] = MOCK_PRODUCTS;

  if (q) {
    const lower = q.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.slug.includes(lower) ||
        p.brands.some((b) => b.toLowerCase().includes(lower)) ||
        p.category.toLowerCase().includes(lower) ||
        p.variants.some((v) => v.sku.toLowerCase().includes(lower))
    );
  }

  if (status) {
    filtered = filtered.filter((p) => p.status === status);
  }

  if (category) {
    filtered = filtered.filter((p) => p.category === category);
  }

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);

  return { data, total };
}

/**
 * Delete a product by ID.
 * Mock implementation — replace with real DELETE /admin/products/:id
 */
export async function deleteProduct(_id: string): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 600));
}

/**
 * Bulk update product status.
 * Mock implementation — replace with real PATCH /admin/products/bulk
 */
export async function bulkUpdateStatus(
  ids: string[],
  status: Product["status"]
): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 400));
  void ids; void status;
}

/**
 * Delete a single variant by ID.
 * Mock implementation — replace with real DELETE /admin/products/:productId/variants/:variantId
 */
export async function deleteVariant(_variantId: string): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 400));
}

/**
 * Bulk update variant status.
 * Mock implementation — replace with real PATCH /admin/variants/bulk
 */
export async function bulkUpdateVariantStatus(
  variantIds: string[],
  status: ProductVariant["status"]
): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 400));
  void variantIds; void status;
}

/**
 * Fetch a single product by ID.
 * Mock implementation — replace with real GET /admin/products/:id
 */
export async function getProductById(id: string): Promise<Product | null> {
  await new Promise<void>((resolve) => setTimeout(resolve, 50));
  return MOCK_PRODUCTS.find((p) => p.id === id) ?? null;
}

// ─── Payloads ──────────────────────────────────────────────────────────────────

export interface VariantPayload {
  /** Present only when updating an existing variant */
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

/**
 * Create a new product.
 * Mock implementation — replace with real POST /admin/products
 */
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

/**
 * Update an existing product and its variants.
 * Mock implementation — replace with real PUT /admin/products/:id
 */
export async function updateProduct(
  id: string,
  data: UpdateProductPayload
): Promise<Product> {
  await new Promise<void>((resolve) => setTimeout(resolve, 600));
  const existing = MOCK_PRODUCTS.find((p) => p.id === id);
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

/**
 * Fetch a single variant by product ID and variant ID.
 * Mock implementation — replace with real GET /admin/products/:productId/variants/:variantId
 */
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

/**
 * Update a variant's full detail (prices, description, specs, media).
 * Mock implementation — replace with real PUT /admin/products/:productId/variants/:variantId/detail
 */
export async function updateVariantDetail(
  _productId: string,
  _variantId: string,
  _data: UpdateVariantDetailPayload
): Promise<ProductVariantDetail> {
  await new Promise<void>((resolve) => setTimeout(resolve, 600));
  // Mock: return the existing mock variant unchanged
  return MOCK_VARIANT;
}

// ─── New variant spec template ────────────────────────────────────────────────

/**
 * Returns the specification group template for a new variant of the given product.
 * Groups are seeded from the product's category (inherited) and any directly
 * assigned groups, with all values set to "" so the user can fill them in.
 *
 * Mock implementation — replace with real GET /admin/products/:productId/variants/template
 */
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

/**
 * Create a new variant with full detail.
 * Mock implementation — replace with real POST /admin/products/:productId/variants/detail
 */
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

/**
 * Clone a product by ID — creates a draft copy with all variants set to inactive.
 * Mock implementation — replace with real POST /admin/products/:id/clone
 */
export async function cloneProduct(id: string): Promise<Product> {
  await new Promise<void>((resolve) => setTimeout(resolve, 600));
  const source = MOCK_PRODUCTS.find((p) => p.id === id);
  if (!source) throw new Error(`Product ${id} not found`);
  const now = new Date().toISOString();
  const cloneId = `prod-clone-${Date.now()}`;
  const variants: ProductVariant[] = source.variants.map((v, i) => ({
    ...v,
    id: `var-clone-${Date.now()}-${i}`,
    sku: `${v.sku}-copy`,
    status: "inactive" as const,
    updatedAt: now,
  }));
  return {
    ...source,
    id: cloneId,
    name: `Copy of ${source.name}`,
    slug: `${source.slug}-copy`,
    status: "draft" as const,
    hasActiveOrders: false,
    variants,
    totalStock: variants.reduce((s, v) => s + v.stock, 0),
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Clone a single variant — creates an inactive copy with "-copy" SKU suffix.
 * Mock implementation — replace with real POST /admin/products/:productId/variants/:variantId/clone
 */
export async function cloneVariant(
  productId: string,
  variantId: string
): Promise<ProductVariant> {
  await new Promise<void>((resolve) => setTimeout(resolve, 400));
  const product = MOCK_PRODUCTS.find((p) => p.id === productId);
  const variant = product?.variants.find((v) => v.id === variantId);
  if (!variant) throw new Error(`Variant ${variantId} not found`);
  const now = new Date().toISOString();
  return {
    ...variant,
    id: `var-clone-${Date.now()}`,
    name: `Copy of ${variant.name}`,
    sku: `${variant.sku}-copy`,
    status: "inactive" as const,
    updatedAt: now,
  };
}

/**
 * Returns the distinct product categories from the current dataset.
 * Replace with GET /admin/products/categories when backend is ready.
 */
export function getProductCategories(): string[] {
  return [...new Set(MOCK_PRODUCTS.map((p) => p.category))].sort();
}

/**
 * Returns the distinct product brands from the current dataset.
 * Replace with GET /admin/products/brands when backend is ready.
 */
export function getProductBrands(): string[] {
  return [...new Set(MOCK_PRODUCTS.flatMap((p) => p.brands))].sort();
}

// ─── Variant sales stats ──────────────────────────────────────────────────────

/**
 * Returns sales statistics for a specific product variant.
 * Mock implementation — replace with GET /admin/products/:id/variants/:variantId/stats.
 */
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

/**
 * Returns reviews for a specific variant (phienBanId).
 * Mock implementation — replace with GET /admin/variants/:variantId/reviews.
 */
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
    {
      reviewId: 1004,
      phienBanId,
      tenSanPham:      "ASUS ROG Strix GeForce RTX 4090 OC",
      tenPhienBan:     "24GB GDDR6X — Standard Edition",
      anhPhienBan:     "https://picsum.photos/seed/rtx4090/80/80",
      khachHangId:     504,
      khachHangTen:    "Phạm Đức Hùng",
      donHangId:       804,
      maDonHang:       "DH-2024-000804",
      rating:          5,
      tieuDe:          "Tuyệt vời, không có gì để chê",
      noiDung:         "Mua về cắm vào chơi ngay, driver nhận chuẩn. Cyberpunk 2077 bật ultra + ray tracing vẫn 120fps ổn định. Đèn RGB đẹp, đồng bộ với phần mềm Armoury Crate. Recommend 10/10.",
      trangThai:       "Pending",
      daPhanHoi:       false,
      helpfulCount:    0,
      nguon:           "Website",
      createdAt:       "2024-11-15T08:20:00Z",
      updatedAt:       "2024-11-15T08:20:00Z",
    },
    {
      reviewId: 1005,
      phienBanId,
      tenSanPham:      "ASUS ROG Strix GeForce RTX 4090 OC",
      tenPhienBan:     "24GB GDDR6X — Standard Edition",
      anhPhienBan:     "https://picsum.photos/seed/rtx4090/80/80",
      khachHangId:     505,
      khachHangTen:    "Võ Văn Khải",
      donHangId:       805,
      maDonHang:       "DH-2024-000805",
      rating:          2,
      tieuDe:          "Nhận hàng bị lỗi quạt",
      noiDung:         "Quạt số 2 phát ra tiếng kêu lạ sau 1 tuần sử dụng. Đã liên hệ bảo hành nhưng chưa được giải quyết. Chất lượng không tương xứng với giá tiền.",
      trangThai:       "Rejected",
      daPhanHoi:       false,
      helpfulCount:    3,
      nguon:           "Website",
      nguoiDuyetId:    1,
      nguoiDuyetTen:   "Admin Hệ thống",
      lyDoTuChoi:      "Đánh giá không phản ánh chất lượng sản phẩm, vấn đề thuộc về bảo hành. Khách hàng vui lòng liên hệ CSKH.",
      duyetTai:        "2024-11-10T16:30:00Z",
      createdAt:       "2024-11-09T19:00:00Z",
      updatedAt:       "2024-11-10T16:30:00Z",
    },
    {
      reviewId: 1006,
      phienBanId,
      tenSanPham:      "ASUS ROG Strix GeForce RTX 4090 OC",
      tenPhienBan:     "24GB GDDR6X — Standard Edition",
      anhPhienBan:     "https://picsum.photos/seed/rtx4090/80/80",
      khachHangId:     506,
      khachHangTen:    "Đinh Thị Lan",
      donHangId:       806,
      maDonHang:       "DH-2024-000806",
      rating:          3,
      tieuDe:          "Tạm được, còn nhiều điều cần cải thiện",
      noiDung:         "Hiệu năng tốt nhưng giá hơi cao so với thị trường. Driver đôi khi xung đột với một số phần mềm. Đóng gói cẩn thận, giao hàng đúng hẹn.",
      trangThai:       "Hidden",
      daPhanHoi:       false,
      helpfulCount:    1,
      nguon:           "Website",
      nguoiDuyetId:    1,
      nguoiDuyetTen:   "Admin Hệ thống",
      duyetTai:        "2024-11-13T11:00:00Z",
      createdAt:       "2024-11-12T22:30:00Z",
      updatedAt:       "2024-11-13T11:00:00Z",
    },
  ];
}

// ─── Internal delay helper ────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
