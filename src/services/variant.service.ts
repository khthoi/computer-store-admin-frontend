import type { PhienBanSanPham, PhienBanStatus } from "@/src/types/variant.types";
import {
  MOCK_VARIANTS,
  getVariantsForProduct,
} from "@/src/app/(dashboard)/products/[id]/variants/_mock";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface VariantFormData {
  name: string;
  sku: string;
  price: number;
  stock: number;
  status: PhienBanStatus;
}

// ─── Service ───────────────────────────────────────────────────────────────

/**
 * Fetch all variants across all products (for scope selector use case).
 * Mock implementation — replace with GET /admin/variants (or /admin/products/variants/all)
 */
export async function getAllVariants(): Promise<PhienBanSanPham[]> {
  await new Promise<void>((r) => setTimeout(r, 50));
  return MOCK_VARIANTS;
}

/**
 * Fetch all variants for a product.
 * Mock implementation — replace with GET /admin/products/:productId/variants
 */
export async function getVariants(productId: string): Promise<PhienBanSanPham[]> {
  await new Promise<void>((r) => setTimeout(r, 50));
  return getVariantsForProduct(productId);
}

/**
 * Fetch a single variant by ID.
 * Mock implementation — replace with GET /admin/products/:productId/variants/:variantId
 */
export async function getVariantById(
  _productId: string,
  variantId: string
): Promise<PhienBanSanPham | null> {
  await new Promise<void>((r) => setTimeout(r, 50));
  return MOCK_VARIANTS.find((v) => v.id === variantId) ?? null;
}

/**
 * Create a new variant for a product.
 * Mock implementation — replace with POST /admin/products/:productId/variants
 */
export async function createVariant(
  productId: string,
  productName: string,
  data: VariantFormData
): Promise<PhienBanSanPham> {
  await new Promise<void>((r) => setTimeout(r, 600));
  const now = new Date().toISOString();
  return {
    id: `var-${Date.now()}`,
    productId,
    productName,
    sku: data.sku.toUpperCase(),
    name: data.name,
    price: data.price,
    stock: data.stock,
    status: data.status,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Update a variant.
 * Mock implementation — replace with PUT /admin/products/:productId/variants/:variantId
 */
export async function updateVariant(
  _productId: string,
  variantId: string,
  data: Partial<VariantFormData>
): Promise<PhienBanSanPham> {
  await new Promise<void>((r) => setTimeout(r, 600));
  const existing = MOCK_VARIANTS.find((v) => v.id === variantId);
  if (!existing) throw new Error(`Variant ${variantId} not found`);
  return {
    ...existing,
    ...data,
    sku: data.sku ? data.sku.toUpperCase() : existing.sku,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Delete a variant.
 * Mock implementation — replace with DELETE /admin/products/:productId/variants/:variantId
 */
export async function deleteVariant(_productId: string, _variantId: string): Promise<void> {
  await new Promise<void>((r) => setTimeout(r, 600));
}

/**
 * Set a variant as the default for its product.
 * Mock implementation — replace with PATCH /admin/products/:productId/variants/:variantId/set-default
 */
export async function setDefaultVariant(
  _productId: string,
  _variantId: string
): Promise<void> {
  await new Promise<void>((r) => setTimeout(r, 300));
}

/**
 * Bulk update variant status.
 * Mock implementation — replace with PATCH /admin/products/:productId/variants/bulk
 */
export async function bulkUpdateVariantStatus(
  _productId: string,
  _variantIds: string[],
  _status: PhienBanStatus
): Promise<void> {
  await new Promise<void>((r) => setTimeout(r, 400));
}
