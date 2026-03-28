import type { PhienBanSanPham } from "@/src/types/variant.types";
import { MOCK_PRODUCTS } from "@/src/app/(dashboard)/products/_mock";

// ─── Variant mock data ────────────────────────────────────────────────────────
// Derived from MOCK_PRODUCTS — enriched with productName and createdAt.

export const MOCK_VARIANTS: PhienBanSanPham[] = MOCK_PRODUCTS.flatMap((p) =>
  p.variants.map((v) => ({
    id: v.id,
    productId: p.id,
    productName: p.name,
    sku: v.sku,
    name: v.name,
    price: v.price,
    stock: v.stock,
    status: v.status,
    thumbnailUrl: v.thumbnailUrl,
    updatedAt: v.updatedAt,
    createdAt: v.updatedAt, // use updatedAt as proxy for createdAt in mock
  }))
);

/**
 * Get variants for a specific product.
 */
export function getVariantsForProduct(productId: string): PhienBanSanPham[] {
  return MOCK_VARIANTS.filter((v) => v.productId === productId);
}
