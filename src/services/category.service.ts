import type { DanhMuc, DanhMucNode, DanhMucNodeType, FilterParams } from "@/src/types/category.types";
import type { CategoryNode } from "@/src/components/admin/CategoryTreeSelect/types";
import { apiFetch } from "@/src/services/api";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface CategoryFormData {
  name: string;
  slug: string;
  parentId?: string;
  description: string;
  displayOrder: number;
  active: boolean;
  nodeType: DanhMucNodeType;
  filterParams: FilterParams | null;
  badgeText: string | null;
  badgeBg: string | null;
  badgeFg: string | null;
  imageUrl?: string | null;
  imageAssetId?: string | null;
  imageAlt?: string | null;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formDataToDto(data: CategoryFormData | Partial<CategoryFormData>) {
  const dto: Record<string, unknown> = {};
  if (data.name !== undefined) dto.tenDanhMuc = data.name;
  if (data.slug !== undefined) dto.slug = data.slug || undefined;
  if (data.description !== undefined) dto.moTa = data.description || undefined;
  if (data.nodeType !== undefined) dto.nodeType = data.nodeType;
  if (data.filterParams !== undefined) dto.filterParams = data.filterParams ?? undefined;
  if (data.parentId !== undefined) dto.danhMucChaId = data.parentId ? Number(data.parentId) : null;
  if (data.displayOrder !== undefined) dto.thuTuHienThi = data.displayOrder;
  if (data.active !== undefined) dto.trangThai = data.active ? "Hien" : "An";
  if (data.imageUrl !== undefined) dto.hinhAnh = data.imageUrl ?? undefined;
  if (data.imageAssetId !== undefined) dto.assetId = data.imageAssetId ? Number(data.imageAssetId) : undefined;
  if (data.imageAlt !== undefined) dto.imageAlt = data.imageAlt ?? undefined;
  if (data.badgeText !== undefined) dto.badgeText = data.badgeText ?? undefined;
  if (data.badgeBg !== undefined) dto.badgeBg = data.badgeBg ?? undefined;
  if (data.badgeFg !== undefined) dto.badgeFg = data.badgeFg ?? undefined;
  return dto;
}

// ─── Service ───────────────────────────────────────────────────────────────

export async function getCategories(): Promise<DanhMuc[]> {
  return apiFetch<DanhMuc[]>("/admin/categories");
}

export async function getCategoryTree(): Promise<DanhMucNode[]> {
  return apiFetch<DanhMucNode[]>("/admin/categories/tree");
}

export async function getCategoryById(id: string): Promise<DanhMuc | null> {
  try {
    return await apiFetch<DanhMuc>(`/admin/categories/${id}`);
  } catch {
    return null;
  }
}

export async function createCategory(data: CategoryFormData): Promise<DanhMuc> {
  return apiFetch<DanhMuc>("/admin/categories", {
    method: "POST",
    body: JSON.stringify(formDataToDto(data)),
  });
}

export async function updateCategory(
  id: string,
  data: Partial<CategoryFormData>
): Promise<DanhMuc> {
  return apiFetch<DanhMuc>(`/admin/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(formDataToDto(data)),
  });
}

export async function deleteCategory(id: string): Promise<void> {
  await apiFetch<void>(`/admin/categories/${id}`, { method: "DELETE" });
}

export async function reorderCategories(
  _parentId: string | null,
  orderedIds: string[]
): Promise<void> {
  await apiFetch<void>("/admin/categories/reorder", {
    method: "PATCH",
    body: JSON.stringify({ orderedIds: orderedIds.map(Number) }),
  });
}

// ─── Product form helper ───────────────────────────────────────────────────

interface CategoryApiNode {
  id: number;
  tenDanhMuc: string;
  children?: CategoryApiNode[];
}

function mapToNode(c: CategoryApiNode): CategoryNode {
  return {
    id: String(c.id),
    label: c.tenDanhMuc,
    children: c.children?.length ? c.children.map(mapToNode) : undefined,
  };
}

export async function getCategoryNodeTree(): Promise<CategoryNode[]> {
  const tree = await apiFetch<CategoryApiNode[]>("/categories");
  return tree.map(mapToNode);
}
