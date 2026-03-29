// ─── CategoryTreeSelect — public API ─────────────────────────────────────────

export { CategoryTreeSelect } from "./CategoryTreeSelect";
export type { CategoryTreeSelectProps, CategoryNode } from "./types";
export { useCategoryTree } from "./useCategoryTree";
export type { UseCategoryTreeOptions, UseCategoryTreeReturn } from "./useCategoryTree";
export {
  buildNodeMap,
  buildBreadcrumb,
  flattenTree,
  filterTree,
  collectAllIds,
} from "./categoryTree.utils";
export type { FlatNode } from "./categoryTree.utils";
