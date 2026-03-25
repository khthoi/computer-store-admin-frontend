import type { Product, ProductVariant } from "@/src/types/product.types";
import { MOCK_PRODUCTS } from "@/src/app/(dashboard)/products/_mock";

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
        p.brand.toLowerCase().includes(lower) ||
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
