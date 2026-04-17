// ══════════════════════════════════════════════════════════════════════════════
// Homepage Section Configuration Types
// Corresponds to DB tables: homepage_section + homepage_section_item
// ══════════════════════════════════════════════════════════════════════════════

// ─── Enums ────────────────────────────────────────────────────────────────────

/** How products are sourced for this section */
export type HomepageSectionType =
  | "category"      // filter by DanhMuc IDs
  | "promotion"     // products belonging to a KhuyenMai
  | "brand"         // filter by ThuongHieu IDs
  | "manual"        // hand-picked PhienBanSanPham (uses section_item table)
  | "new_arrivals"  // auto: newest by ngayTao
  | "best_selling"; // auto: ranked by total sold quantity

/** Default sort applied when fetching products (except type=manual) */
export type SectionSortBy =
  | "newest"
  | "best_selling"
  | "highest_rated"
  | "price_asc"
  | "price_desc";

/** Visual layout rendered on storefront */
export type SectionLayout =
  | "carousel"   // horizontal scroll, no column cap
  | "grid_3"     // 3-column fixed grid
  | "grid_4"     // 4-column fixed grid
  | "grid_6";    // 6-column compact grid

// ─── Source config per type ───────────────────────────────────────────────────

export interface CategorySourceConfig {
  danhMucIds: number[];
  sortBy: SectionSortBy;
}

export interface PromotionSourceConfig {
  khuyenMaiId: number;
}

export interface BrandSourceConfig {
  thuongHieuIds: number[];
  sortBy: SectionSortBy;
}

export interface AutoSourceConfig {
  /** Optional: restrict auto-query to specific categories. Empty = whole store. */
  danhMucIds?: number[];
}

export type SourceConfig =
  | CategorySourceConfig
  | PromotionSourceConfig
  | BrandSourceConfig
  | AutoSourceConfig
  | null;

// ─── Core entities ────────────────────────────────────────────────────────────

/** Corresponds to homepage_section_item */
export interface SectionItem {
  id: number;
  sectionId: number;
  phienBanId: number;
  sortOrder: number;
  // Joined fields from PhienBanSanPham + SanPham
  tenSanPham: string;
  SKU: string;
  giaBan: number;
  giaGoc: number;
  hinhAnh?: string;
}

/** Corresponds to homepage_section */
export interface HomepageSection {
  sectionId: number;
  title: string;
  subtitle?: string;
  viewAllUrl?: string;
  type: HomepageSectionType;
  sourceConfig: SourceConfig;
  sortBy: SectionSortBy;
  maxProducts: number;
  layout: SectionLayout;
  badgeLabel?: string;
  badgeColor?: string;
  isVisible: boolean;
  sortOrder: number;
  ngayBatDau?: string;   // ISO date string
  ngayKetThuc?: string;  // ISO date string
  // Computed/joined — populated by API
  productCount?: number;
  items?: SectionItem[]; // only when type="manual"
  ngayTao: string;
  ngayCapNhat: string;
}

// ─── Form data ────────────────────────────────────────────────────────────────

export interface HomepageSectionFormData {
  title: string;
  subtitle: string;
  viewAllUrl: string;
  type: HomepageSectionType;
  sourceConfig: SourceConfig;
  sortBy: SectionSortBy;
  maxProducts: number;
  layout: SectionLayout;
  badgeLabel: string;
  badgeColor: string;
  isVisible: boolean;
  ngayBatDau: string;
  ngayKetThuc: string;
  manualItems: SectionItem[]; // used only when type="manual"
}

// ─── Preview ──────────────────────────────────────────────────────────────────

/** Lightweight product card for the preview pane */
export interface PreviewProduct {
  phienBanId: number;
  tenSanPham: string;
  SKU: string;
  giaBan: number;
  giaGoc: number;
  hinhAnh?: string;
  thuongHieu?: string;
  badge?: string; // "NEW" | "HOT" | "SALE" etc.
}

// ─── Option helpers (for Select component) ────────────────────────────────────

export interface DanhMucOption {
  value: number;
  label: string;
  description: string; // slug
}

export interface ThuongHieuOption {
  value: number;
  label: string;
  description?: string;
}

export interface KhuyenMaiOption {
  value: number;
  label: string;
  description: string; // date range
}
