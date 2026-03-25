// ─── Product domain types ─────────────────────────────────────────────────────

export interface ProductVariant {
  id: string;
  sku: string;
  /** Human-readable variant label, e.g. "256GB / Space Grey" */
  name: string;
  price: number;
  stock: number;
  status: "active" | "inactive";
  /**
   * Variant-level thumbnail. Each variant has its own image.
   * Products themselves do not carry a thumbnail — the image is on the variant.
   */
  thumbnailUrl?: string;
  /** ISO date string for when this variant was last modified */
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  brand: string;
  /**
   * Products do NOT have thumbnails — images belong to individual variants.
   * This field is intentionally absent; see ProductVariant.thumbnailUrl.
   */
  basePrice: number;
  totalStock: number;
  status: "published" | "draft" | "archived";
  variants: ProductVariant[];
  /**
   * When true, the product has active orders and cannot be deleted.
   * Populated from the API; used by the delete guard in ProductsTable.
   */
  hasActiveOrders?: boolean;
  createdAt: string;  // ISO date string
  updatedAt: string;  // ISO date string
}

export type ProductStatus = Product["status"];
export type VariantStatus = ProductVariant["status"];
