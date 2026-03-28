import type {
  CategorySpecGroupAssignment,
  EffectiveSpecGroup,
  ExcludedSpecGroup,
  CategorySpecGroupsView,
} from "@/src/types/spec_group.types";
import {
  MOCK_SPEC_GROUPS,
  MOCK_SPEC_TYPES,
  MOCK_CATEGORY_SPEC_ASSIGNMENTS,
} from "@/src/app/(dashboard)/categories/_spec_mock";
import { MOCK_CATEGORIES } from "@/src/app/(dashboard)/categories/_mock";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build the ancestor path for a category (inclusive), root first.
 * Returns [rootId, ..., parentId, categoryId].
 */
function getAncestorPath(categoryId: string): string[] {
  const path: string[] = [];
  let currentId: string | null = categoryId;
  while (currentId !== null) {
    const cat = MOCK_CATEGORIES.find((c) => c.id === currentId);
    if (!cat) break;
    path.unshift(cat.id);
    currentId = cat.parentId;
  }
  return path;
}

// ─── Direct assignments ───────────────────────────────────────────────────────

/**
 * Get the explicit assignment records for a single category (no inheritance).
 * Mock implementation — replace with SELECT * FROM category_spec_groups WHERE category_id = ?
 */
export async function getDirectAssignments(
  categoryId: string
): Promise<CategorySpecGroupAssignment[]> {
  await new Promise<void>((r) => setTimeout(r, 50));
  return MOCK_CATEGORY_SPEC_ASSIGNMENTS.filter((a) => a.categoryId === categoryId);
}

// ─── Inheritance resolver ─────────────────────────────────────────────────────

/**
 * Resolve the fully inherited spec group view for a category.
 *
 * Algorithm (root → leaf, last write wins):
 *   - 'include' record → group is active at this node and descendants
 *   - 'exclude' record → group is suppressed at this node and descendants
 *
 * Returns three buckets for Panel 2:
 *   directIncludes   — include records directly on this category
 *   inheritedIncludes — include records from ancestors, not suppressed here
 *   directExcludes   — exclude records directly on this category
 */
export async function getCategorySpecGroupsView(
  categoryId: string
): Promise<CategorySpecGroupsView> {
  await new Promise<void>((r) => setTimeout(r, 60));

  const path = getAncestorPath(categoryId);

  // Map: specGroupId → last-seen assignment (root → leaf resolution)
  const resolved = new Map<
    string,
    { assignmentType: "include" | "exclude"; sourceCategoryId: string; displayOrder: number }
  >();

  for (const catId of path) {
    const assignments = MOCK_CATEGORY_SPEC_ASSIGNMENTS.filter((a) => a.categoryId === catId);
    for (const a of assignments) {
      resolved.set(a.specGroupId, {
        assignmentType: a.assignmentType,
        sourceCategoryId: catId,
        displayOrder: a.displayOrder,
      });
    }
  }

  // Helper: build EffectiveSpecGroup from a specGroupId
  function buildEffective(specGroupId: string, isInherited: boolean): EffectiveSpecGroup {
    const entry = resolved.get(specGroupId)!;
    const group = MOCK_SPEC_GROUPS.find((g) => g.id === specGroupId)!;
    const sourceCat = MOCK_CATEGORIES.find((c) => c.id === entry.sourceCategoryId);
    const specTypes = MOCK_SPEC_TYPES.filter((t) => t.groupId === specGroupId).sort(
      (a, b) => a.displayOrder - b.displayOrder
    );
    return {
      ...group,
      isInherited,
      sourceCategoryId: entry.sourceCategoryId,
      sourceCategoryName: sourceCat?.name ?? "—",
      specTypes,
    };
  }

  const directIncludes: EffectiveSpecGroup[] = [];
  const inheritedIncludes: EffectiveSpecGroup[] = [];
  const directExcludes: ExcludedSpecGroup[] = [];

  for (const [specGroupId, entry] of resolved) {
    if (entry.assignmentType === "include") {
      const isInherited = entry.sourceCategoryId !== categoryId;
      const effective = buildEffective(specGroupId, isInherited);
      if (isInherited) {
        inheritedIncludes.push(effective);
      } else {
        directIncludes.push(effective);
      }
    } else if (
      entry.assignmentType === "exclude" &&
      entry.sourceCategoryId === categoryId
    ) {
      // This category explicitly suppresses a group that was included by an ancestor.
      // Find where the include originally came from (walk ancestors without this category).
      const ancestorPath = path.filter((id) => id !== categoryId);
      let originId: string | null = null;
      for (const catId of [...ancestorPath].reverse()) {
        const a = MOCK_CATEGORY_SPEC_ASSIGNMENTS.find(
          (a) =>
            a.categoryId === catId &&
            a.specGroupId === specGroupId &&
            a.assignmentType === "include"
        );
        if (a) {
          originId = catId;
          break;
        }
      }
      const group = MOCK_SPEC_GROUPS.find((g) => g.id === specGroupId);
      const originCat = MOCK_CATEGORIES.find((c) => c.id === originId);
      if (group) {
        directExcludes.push({
          specGroupId,
          specGroupName: group.name,
          sourceCategoryId: originId ?? "",
          sourceCategoryName: originCat?.name ?? "Không xác định",
        });
      }
    }
  }

  // Sort each bucket by displayOrder
  directIncludes.sort(
    (a, b) => (resolved.get(a.id)?.displayOrder ?? 0) - (resolved.get(b.id)?.displayOrder ?? 0)
  );
  inheritedIncludes.sort(
    (a, b) => (resolved.get(a.id)?.displayOrder ?? 0) - (resolved.get(b.id)?.displayOrder ?? 0)
  );

  return { directIncludes, inheritedIncludes, directExcludes };
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Assign (include) or suppress (exclude) a spec group for a category.
 * Upserts: replaces any existing record for (categoryId, specGroupId).
 * Mock implementation — replace with UPSERT INTO category_spec_groups
 */
export async function assignSpecGroup(
  _categoryId: string,
  _specGroupId: string,
  _assignmentType: "include" | "exclude",
  _displayOrder?: number
): Promise<void> {
  await new Promise<void>((r) => setTimeout(r, 600));
}

/**
 * Remove an explicit assignment record, restoring pure inheritance behavior.
 * Mock implementation — replace with DELETE FROM category_spec_groups WHERE ...
 */
export async function removeSpecGroupAssignment(
  _categoryId: string,
  _specGroupId: string
): Promise<void> {
  await new Promise<void>((r) => setTimeout(r, 400));
}

/**
 * Reorder the direct include assignments for a category.
 * Mock implementation — replace with bulk UPDATE display_order
 */
export async function reorderSpecGroupsForCategory(
  _categoryId: string,
  _orderedSpecGroupIds: string[]
): Promise<void> {
  await new Promise<void>((r) => setTimeout(r, 300));
}
