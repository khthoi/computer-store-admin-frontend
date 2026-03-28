// ─── Brand domain types ────────────────────────────────────────────────────

export type ThuongHieuStatus = "active" | "inactive";

export interface ThuongHieu {
  id: string;
  name: string;
  slug: string;
  description: string;
  websiteUrl: string;
  logoUrl?: string;
  active: boolean;
  productCount: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
