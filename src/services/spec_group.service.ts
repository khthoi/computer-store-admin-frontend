import type {
  SpecGroup,
  SpecGroupFormData,
  SpecType,
  SpecTypeFormData,
} from "@/src/types/spec_group.types";
import {
  MOCK_SPEC_GROUPS,
  MOCK_SPEC_TYPES,
} from "@/src/app/(dashboard)/categories/_spec_mock";

// ─── Spec Group CRUD ──────────────────────────────────────────────────────────

/**
 * Fetch all spec groups, optionally filtered by name query.
 * Mock implementation — replace with GET /admin/spec-groups
 */
export async function getSpecGroups(params: { q?: string } = {}): Promise<SpecGroup[]> {
  await new Promise<void>((r) => setTimeout(r, 50));
  const { q = "" } = params;
  if (!q) return MOCK_SPEC_GROUPS.slice().sort((a, b) => a.displayOrder - b.displayOrder);
  const lower = q.toLowerCase();
  return MOCK_SPEC_GROUPS.filter((g) => g.name.toLowerCase().includes(lower));
}

/**
 * Fetch a single spec group by ID.
 * Mock implementation — replace with GET /admin/spec-groups/:id
 */
export async function getSpecGroupById(id: string): Promise<SpecGroup | null> {
  await new Promise<void>((r) => setTimeout(r, 50));
  return MOCK_SPEC_GROUPS.find((g) => g.id === id) ?? null;
}

/**
 * Create a new spec group.
 * Mock implementation — replace with POST /admin/spec-groups
 */
export async function createSpecGroup(data: SpecGroupFormData): Promise<SpecGroup> {
  await new Promise<void>((r) => setTimeout(r, 600));
  const now = new Date().toISOString();
  return {
    id: `sg-${Date.now()}`,
    name: data.name,
    description: data.description,
    displayOrder: data.displayOrder,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Update a spec group.
 * Mock implementation — replace with PUT /admin/spec-groups/:id
 */
export async function updateSpecGroup(
  id: string,
  data: Partial<SpecGroupFormData>
): Promise<SpecGroup> {
  await new Promise<void>((r) => setTimeout(r, 600));
  const existing = MOCK_SPEC_GROUPS.find((g) => g.id === id);
  if (!existing) throw new Error(`SpecGroup ${id} not found`);
  return { ...existing, ...data, updatedAt: new Date().toISOString() };
}

/**
 * Delete a spec group (cascades to category_spec_groups via FK).
 * Mock implementation — replace with DELETE /admin/spec-groups/:id
 */
export async function deleteSpecGroup(_id: string): Promise<void> {
  await new Promise<void>((r) => setTimeout(r, 600));
}

// ─── Spec Type CRUD ───────────────────────────────────────────────────────────

/**
 * Fetch all spec types for a group, sorted by displayOrder.
 * Mock implementation — replace with GET /admin/spec-groups/:groupId/types
 */
export async function getSpecTypesByGroup(groupId: string): Promise<SpecType[]> {
  await new Promise<void>((r) => setTimeout(r, 50));
  return MOCK_SPEC_TYPES.filter((t) => t.groupId === groupId).sort(
    (a, b) => a.displayOrder - b.displayOrder
  );
}

/**
 * Add a spec type to a group.
 * Mock implementation — replace with POST /admin/spec-groups/:groupId/types
 */
export async function addSpecType(groupId: string, data: SpecTypeFormData): Promise<SpecType> {
  await new Promise<void>((r) => setTimeout(r, 400));
  const now = new Date().toISOString();
  return {
    id: `st-${Date.now()}`,
    groupId,
    name: data.name,
    description: data.description,
    maKyThuat: data.maKyThuat,
    displayOrder: data.displayOrder,
    required: data.required,
    kieuDuLieu: data.kieuDuLieu,
    donVi: data.donVi || undefined,
    coTheLoc: data.coTheLoc,
    widgetLoc: data.widgetLoc || undefined,
    thuTuLoc: data.thuTuLoc,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Update a spec type.
 * Mock implementation — replace with PUT /admin/spec-types/:id
 */
export async function updateSpecType(
  id: string,
  data: Partial<SpecTypeFormData>
): Promise<SpecType> {
  await new Promise<void>((r) => setTimeout(r, 400));
  const existing = MOCK_SPEC_TYPES.find((t) => t.id === id);
  if (!existing) throw new Error(`SpecType ${id} not found`);
  const normalized = { ...data, widgetLoc: data.widgetLoc || undefined };
  return { ...existing, ...normalized, updatedAt: new Date().toISOString() };
}

/**
 * Delete a spec type.
 * Mock implementation — replace with DELETE /admin/spec-types/:id
 */
export async function deleteSpecType(_id: string): Promise<void> {
  await new Promise<void>((r) => setTimeout(r, 400));
}

/**
 * Reorder spec types within a group.
 * Mock implementation — replace with PATCH /admin/spec-groups/:groupId/types/reorder
 */
export async function reorderSpecTypes(_groupId: string, _orderedIds: string[]): Promise<void> {
  await new Promise<void>((r) => setTimeout(r, 300));
}
