// ─── Specification Group domain types ─────────────────────────────────────────

export type SpecAssignmentType = "include" | "exclude";

// ─── Spec Group ────────────────────────────────────────────────────────────────

export interface SpecGroup {
  id: string;
  name: string;
  description: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface SpecGroupFormData {
  name: string;
  description: string;
  displayOrder: number;
}

// ─── Spec Type ────────────────────────────────────────────────────────────────

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
}

// ─── Category ↔ SpecGroup assignment ──────────────────────────────────────────

export interface CategorySpecGroupAssignment {
  id: string;
  categoryId: string;
  specGroupId: string;
  assignmentType: SpecAssignmentType;
  displayOrder: number;
  createdAt: string;
}

// ─── Resolved types (post-inheritance) ────────────────────────────────────────

/** A spec group resolved through the inheritance chain, fully hydrated */
export interface EffectiveSpecGroup extends SpecGroup {
  /** True when this group comes from an ancestor, not directly assigned here */
  isInherited: boolean;
  /** The category where this assignment originates */
  sourceCategoryId: string;
  sourceCategoryName: string;
  /** Spec types belonging to this group, sorted by displayOrder */
  specTypes: SpecType[];
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
