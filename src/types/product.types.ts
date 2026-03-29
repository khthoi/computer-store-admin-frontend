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

export type CreatorRole = "Admin" | "Editor" | "Staff";

export interface ProductCreator {
  name: string;
  role: CreatorRole;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  /** One or more brand labels associated with this product */
  brands: string[];
  /**
   * Products do NOT have thumbnails — images belong to individual variants.
   * This field is intentionally absent; see ProductVariant.thumbnailUrl.
   */
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
  /** Average customer rating out of 5 */
  averageRating?: number;
  /** Total number of customer reviews */
  reviewCount?: number;
  /** Staff member who created this product entry */
  createdBy?: ProductCreator;
}

export type ProductStatus = Product["status"];
export type VariantStatus = ProductVariant["status"];

// ─── Variant detail types (richer model for the variant detail page) ──────────

export type DetailVariantStatus = "visible" | "hidden" | "out_of_stock";
export type MediaType = "main" | "gallery" | "360";

export interface VariantMedia {
  id: string;
  variantId: string;
  url: string;
  type: MediaType;
  order: number;
  altText?: string;
}

export interface SpecificationItem {
  id: string;
  typeId: string;
  typeLabel: string;
  /** Lightweight HTML — plain text, ul/li, bold/italic only */
  value: string;
}

export interface SpecificationGroup {
  id: string;
  label: string;
  /** true = inherited from parent category; false = directly assigned */
  inherited: boolean;
  items: SpecificationItem[];
}

export interface ProductVariantDetail {
  id: string;
  productId: string;
  /** tenPhienBan */
  name: string;
  sku: string;
  /** giaGoc */
  originalPrice: number;
  /** giaBan */
  salePrice: number;
  /** trongLuong (kg) */
  weight?: number;
  status: DetailVariantStatus;
  updatedAt: string;
  /** moTaChiTiet — full HTML from Quill */
  description: string;
  specificationGroups: SpecificationGroup[];
  media: VariantMedia[];
}
