import type { DanhMuc, DanhMucNode, DanhMucNodeType, FilterParams } from "@/src/types/category.types";
import { MOCK_CATEGORIES, buildCategoryTree } from "@/src/app/(dashboard)/categories/_mock";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyCat = any;

// ─── Types ─────────────────────────────────────────────────────────────────

export interface CategoryFormData {
  name: string;
  slug: string;
  parentId?: string;
  description: string;
  displayOrder: number;
  active: boolean;
  // Mega-menu node type + filter shortcut
  nodeType: DanhMucNodeType;
  filterParams: FilterParams | null;
  // Badge
  badgeText: string | null;
  badgeBg: string | null;
  badgeFg: string | null;
}

// ─── Defaults helper ───────────────────────────────────────────────────────
// Existing mock objects predate the node_type/badge columns.
// This ensures every DanhMuc has the new fields regardless.

function withDefaults(c: AnyCat): DanhMuc {
  return {
    parentId: null, description: "", displayOrder: 0, active: true,
    productCount: 0, createdAt: "", updatedAt: "",
    nodeType: "category", filterParams: null,
    badgeText: null, badgeBg: null, badgeFg: null,
    ...c,
  } as DanhMuc;
}

function applyDefaults(list: AnyCat[]): DanhMuc[] {
  return list.map(withDefaults);
}

function applyDefaultsTree(nodes: AnyCat[]): DanhMucNode[] {
  return nodes.map((n) => ({
    ...withDefaults(n),
    children: n.children ? applyDefaultsTree(n.children) : undefined,
  }));
}

// ─── Service ───────────────────────────────────────────────────────────────

/**
 * Fetch all categories as a flat list.
 * Mock implementation — replace with GET /admin/categories
 */
export async function getCategories(): Promise<DanhMuc[]> {
  await new Promise<void>((r) => setTimeout(r, 50));
  return applyDefaults(MOCK_CATEGORIES);
}

/**
 * Fetch categories as a nested tree.
 * Mock implementation — replace with GET /admin/categories/tree
 */
export async function getCategoryTree(): Promise<DanhMucNode[]> {
  await new Promise<void>((r) => setTimeout(r, 50));
  return applyDefaultsTree(buildCategoryTree());
}

/**
 * Fetch a single category by ID.
 * Mock implementation — replace with GET /admin/categories/:id
 */
export async function getCategoryById(id: string): Promise<DanhMuc | null> {
  await new Promise<void>((r) => setTimeout(r, 50));
  return MOCK_CATEGORIES.find((c) => c.id === id) ?? null;
}

/**
 * Create a new category.
 * Mock implementation — replace with POST /admin/categories
 */
export async function createCategory(data: CategoryFormData): Promise<DanhMuc> {
  await new Promise<void>((r) => setTimeout(r, 600));
  const now = new Date().toISOString();
  return {
    id: `cat-${Date.now()}`,
    name: data.name,
    slug: data.slug,
    parentId: data.parentId ?? null,
    description: data.description,
    displayOrder: data.displayOrder,
    active: data.active,
    productCount: 0,
    createdAt: now,
    updatedAt: now,
    nodeType: data.nodeType ?? "category",
    filterParams: data.filterParams ?? null,
    badgeText: data.badgeText ?? null,
    badgeBg: data.badgeBg ?? null,
    badgeFg: data.badgeFg ?? null,
  };
}

/**
 * Update a category.
 * Mock implementation — replace with PUT /admin/categories/:id
 */
export async function updateCategory(
  id: string,
  data: Partial<CategoryFormData>
): Promise<DanhMuc> {
  await new Promise<void>((r) => setTimeout(r, 600));
  const existing = MOCK_CATEGORIES.find((c) => c.id === id);
  if (!existing) throw new Error(`Category ${id} not found`);
  return {
    ...existing,
    ...data,
    parentId: data.parentId !== undefined ? (data.parentId || null) : existing.parentId,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Delete a category by ID.
 * Mock implementation — replace with DELETE /admin/categories/:id
 */
export async function deleteCategory(_id: string): Promise<void> {
  await new Promise<void>((r) => setTimeout(r, 600));
}

/**
 * Reorder children of a given parent.
 * Mock implementation — replace with PATCH /admin/categories/reorder
 */
export async function reorderCategories(
  _parentId: string | null,
  _orderedIds: string[]
): Promise<void> {
  await new Promise<void>((r) => setTimeout(r, 400));
}
