import type { Product, ProductVariant, ProductVariantDetail, DetailVariantStatus, SpecificationGroup, VariantMedia } from "@/src/types/product.types";
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
