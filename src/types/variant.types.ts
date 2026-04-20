// ─── Variant domain types ──────────────────────────────────────────────────

export type PhienBanStatus = "active" | "inactive";

export interface PhienBanSanPham {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
  status: PhienBanStatus;
  thumbnailUrl?: string;
  updatedAt: string; // ISO date string
  createdAt: string; // ISO date string
  /** True for the single variant shown by default on listing/product cards */
  isDefault?: boolean;
}
