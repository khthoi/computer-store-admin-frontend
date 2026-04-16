// ─── Category domain types ─────────────────────────────────────────────────

export type DanhMucStatus = "active" | "inactive";

/**
 * node_type mirrors the ERD column added to danh_muc:
 *  - "category"  : a real product category (default)
 *  - "filter"    : a filter-shortcut node whose link is built from filterParams
 *  - "label"     : a visual group header in the megamenu (no link)
 */
export type DanhMucNodeType = "category" | "filter" | "label";

/**
 * Serialised form of the danh_muc.filter_params JSON column.
 * Keys are query-param names (brand, price_min, price_max, …),
 * values are always stored as strings (converted to numbers by the client).
 */
export type FilterParams = Record<string, string>;

export interface DanhMuc {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  description: string;
  displayOrder: number;
  active: boolean;
  productCount: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string

  // ── Mega-menu node type (ERD: node_type + filter_params) ──────────────────
  nodeType: DanhMucNodeType;
  filterParams: FilterParams | null;

  // ── Badge (ERD: badge_text + badge_bg + badge_fg) ─────────────────────────
  badgeText: string | null;
  badgeBg: string | null;  // hex e.g. "#ef4444"
  badgeFg: string | null;  // hex e.g. "#ffffff"
}

/** Tree node shape — mirrors DanhMuc but with recursive children */
export interface DanhMucNode extends DanhMuc {
  children?: DanhMucNode[];
}
