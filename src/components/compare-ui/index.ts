// ─── Types ────────────────────────────────────────────────────────────────────
export type {
  ProductCategory,
  CompareProduct,
  CompareSpecGroup as CompareSpecGroupType,
  CompareSpecRow,
  CatalogueProduct,
} from "./types";
export { CATEGORY_LABELS } from "./types";

// ─── Components ───────────────────────────────────────────────────────────────
export { EmptyCompareState } from "./EmptyCompareState";
export type { EmptyCompareStateProps } from "./EmptyCompareState";

export { CompareHighlightToggle } from "./CompareHighlightToggle";
export type { CompareHighlightToggleProps } from "./CompareHighlightToggle";

export { CompareRow } from "./CompareRow";
export type { CompareRowProps } from "./CompareRow";

export { CompareSpecGroup } from "./CompareSpecGroup";
export type { CompareSpecGroupProps } from "./CompareSpecGroup";

export { CompareTable } from "./CompareTable";

export { CompareProductDrawer } from "./CompareProductDrawer";
export type { CompareProductDrawerProps } from "./CompareProductDrawer";
