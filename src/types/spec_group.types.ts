// ─── Specification Group domain types ─────────────────────────────────────────

export type SpecAssignmentType = "include" | "exclude" | "ghi_de_thu_tu";

// ─── Spec Group ────────────────────────────────────────────────────────────────

export interface SpecGroup {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface SpecGroupFormData {
  name: string;
  description: string;
}

// ─── Spec Type ────────────────────────────────────────────────────────────────

/**
 * Kiểu dữ liệu của thông số — ảnh hưởng đến cách nhập liệu ở trang sản phẩm
 * và cách render widget bộ lọc ở trang danh mục phía cửa hàng.
 */
export type SpecDataType = "text" | "number" | "boolean" | "enum";

/**
 * Dạng widget bộ lọc hiển thị ở trang danh sách sản phẩm phía cửa hàng.
 * Chỉ có ý nghĩa khi coTheLoc = true.
 */
export type FilterWidget = "checkbox" | "range" | "toggle" | "select" | "combo-select";

export interface SpecType {
  id: string;
  groupId: string;
  name: string;
  /** Optional description / hint (max 120 words) */
  description: string;
  /**
   * Machine-readable key used by the Build PC compatibility engine.
   * Maps to loai_thong_so.ma_ky_thuat in the ERD.
   * Format: lowercase letters, digits, underscores only (e.g. "cpu_socket", "tdp_watt").
   * Optional — specs not referenced by any compatibility rule can leave this blank.
   */
  maKyThuat?: string;
  displayOrder: number;
  required: boolean;

  // ── Filter / facet fields (ERD: loai_thong_so) ────────────────────────────
  /** Kiểu dữ liệu của giá trị — quyết định widget nhập liệu và bộ lọc */
  kieuDuLieu: SpecDataType;
  /** Đơn vị hiển thị kèm giá trị (chỉ dùng khi kieuDuLieu = 'number'). VD: 'GHz', 'W', 'GB' */
  donVi?: string;
  /** Thông số này có được dùng làm facet filter ở trang sản phẩm không */
  coTheLoc: boolean;
  /** Dạng widget bộ lọc (chỉ có ý nghĩa khi coTheLoc = true) */
  widgetLoc?: FilterWidget;
  /** Thứ tự hiển thị trong sidebar bộ lọc (chỉ có ý nghĩa khi coTheLoc = true) */
  thuTuLoc: number;

  createdAt: string;
  updatedAt: string;
}

export interface SpecTypeFormData {
  name: string;
  description: string;
  /** @see SpecType.maKyThuat */
  maKyThuat: string;
  displayOrder: number;
  required: boolean;
  kieuDuLieu: SpecDataType;
  donVi: string;
  coTheLoc: boolean;
  widgetLoc: FilterWidget | "";
  thuTuLoc: number;
}

// ─── Category ↔ SpecGroup assignment ──────────────────────────────────────────

export interface CategorySpecGroupAssignment {
  id: string;
  categoryId: string;
  specGroupId: string;
  /**
   * - include      : gán trực tiếp nhóm này cho danh mục
   * - exclude      : ẩn nhóm kế thừa từ cha (suppress)
   * - ghi_de_thu_tu: kế thừa từ cha nhưng override displayOrder trong danh mục này
   */
  assignmentType: SpecAssignmentType;
  displayOrder: number;
  /**
   * Nhóm thông số này có hiện ra trong sidebar bộ lọc của trang sản phẩm không.
   * Chỉ có ý nghĩa với assignmentType = 'include' hoặc 'ghi_de_thu_tu'.
   */
  hienThiBoLoc: boolean;
  /**
   * Thứ tự hiển thị của nhóm trong sidebar bộ lọc.
   * Chỉ có ý nghĩa khi hienThiBoLoc = true.
   */
  thuTuBoLoc: number;
  createdAt: string;
}

// ─── Resolved types (post-inheritance) ────────────────────────────────────────

/** A spec group resolved through the inheritance chain, fully hydrated */
export interface EffectiveSpecGroup extends SpecGroup {
  /** Display order within the category (= CategorySpecGroup.thuTuHienThi) */
  displayOrder: number;
  /** True when this group comes from an ancestor, not directly assigned here */
  isInherited: boolean;
  /** The category where this assignment originates */
  sourceCategoryId: string;
  sourceCategoryName: string;
  /** Spec types belonging to this group, sorted by displayOrder */
  specTypes: SpecType[];
  /** Assignment metadata for this specific category (undefined if purely inherited with no override) */
  assignment?: Pick<CategorySpecGroupAssignment, "assignmentType" | "displayOrder" | "hienThiBoLoc" | "thuTuBoLoc">;
}

/** A spec group that this category explicitly suppresses via an exclude record */
export interface ExcludedSpecGroup {
  specGroupId: string;
  specGroupName: string;
  /** The ancestor category where the include originally came from */
  sourceCategoryId: string;
  sourceCategoryName: string;
}

/**
 * Full view of a category's spec group assignments, split into three buckets
 * for the three UI sections in Panel 2.
 */
export interface CategorySpecGroupsView {
  /** Groups with an include record directly on this category */
  directIncludes: EffectiveSpecGroup[];
  /** Groups inherited from ancestors and not suppressed by this category */
  inheritedIncludes: EffectiveSpecGroup[];
  /** Groups explicitly excluded by this category (suppress records) */
  directExcludes: ExcludedSpecGroup[];
}
