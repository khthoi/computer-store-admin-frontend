/**
 * Shared types for the Product Detail page and its components.
 * These supplement the component-level props types with page-level data shapes.
 */

import type { GalleryMedia } from "./ProductImageGallery";

// Re-export for convenience
export type { GalleryMedia };

// ─── Variant types ────────────────────────────────────────────────────────────

export interface VariantOptionData {
  value: string;
  label: string;
  stock: number;
  color?: string;
  /** Numeric delta in VND (e.g. 4000000) */
  priceDelta: number;
}

export interface VariantGroup {
  key: string;
  label: string;
  options: VariantOptionData[];
  type: "button" | "color";
}


// ─── Product Detail (page-level data shape) ───────────────────────────────────

export interface ProductDetail {
  id: string;
  name: string;
  brand: string;
  sku: string;
  slug: string;
  currentPrice: number;
  originalPrice: number;
  discountPct: number;
  rating: number;
  reviewCount: number;
  stockQuantity: number;
  images: GalleryMedia[];
  variantGroups: VariantGroup[];
  descriptionHtml: string;
}
