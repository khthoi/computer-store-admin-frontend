import type {
  SpecGroup,
  SpecGroupFormData,
  SpecType,
  SpecTypeFormData,
} from "@/src/types/spec_group.types";
import { apiFetch } from "@/src/services/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function specTypeFormToDto(groupId: string, data: SpecTypeFormData) {
  return {
    nhomThongSoId: Number(groupId),
    tenLoai: data.name,
    moTa: data.description || undefined,
    maKyThuat: data.maKyThuat || undefined,
    thuTuHienThi: data.displayOrder,
    batBuoc: data.required ? "BAT_BUOC" : "TUY_CHON",
    kieuDuLieu: data.kieuDuLieu,
    donVi: data.donVi || undefined,
    coTheLoc: data.coTheLoc,
    widgetLoc: data.widgetLoc || undefined,
    thuTuLoc: data.thuTuLoc,
  };
}

function specTypeUpdateToDto(data: Partial<SpecTypeFormData>) {
  const dto: Record<string, unknown> = {};
  if (data.name !== undefined) dto.tenLoai = data.name;
  if (data.description !== undefined) dto.moTa = data.description || undefined;
  if (data.maKyThuat !== undefined) dto.maKyThuat = data.maKyThuat || undefined;
  if (data.displayOrder !== undefined) dto.thuTuHienThi = data.displayOrder;
  if (data.required !== undefined) dto.batBuoc = data.required ? "BAT_BUOC" : "TUY_CHON";
  if (data.kieuDuLieu !== undefined) dto.kieuDuLieu = data.kieuDuLieu;
  if (data.donVi !== undefined) dto.donVi = data.donVi || undefined;
  if (data.coTheLoc !== undefined) dto.coTheLoc = data.coTheLoc;
  if (data.widgetLoc !== undefined) dto.widgetLoc = data.widgetLoc || undefined;
  if (data.thuTuLoc !== undefined) dto.thuTuLoc = data.thuTuLoc;
  return dto;
}

// ─── Spec Group CRUD ──────────────────────────────────────────────────────────

export async function getSpecGroups(params: { q?: string } = {}): Promise<SpecGroup[]> {
  const groups = await apiFetch<SpecGroup[]>("/admin/specs/groups");
  const { q = "" } = params;
  if (!q) return groups;
  const lower = q.toLowerCase();
  return groups.filter((g) => g.name.toLowerCase().includes(lower));
}

export async function getSpecGroupById(id: string): Promise<SpecGroup | null> {
  try {
    return await apiFetch<SpecGroup>(`/admin/specs/groups/${id}`);
  } catch {
    return null;
  }
}

export async function createSpecGroup(data: SpecGroupFormData): Promise<SpecGroup> {
  return apiFetch<SpecGroup>("/admin/specs/groups", {
    method: "POST",
    body: JSON.stringify({ tenNhom: data.name }),
  });
}

export async function updateSpecGroup(
  id: string,
  data: Partial<SpecGroupFormData>
): Promise<SpecGroup> {
  return apiFetch<SpecGroup>(`/admin/specs/groups/${id}`, {
    method: "PUT",
    body: JSON.stringify({ tenNhom: data.name }),
  });
}

export async function deleteSpecGroup(id: string): Promise<void> {
  await apiFetch<void>(`/admin/specs/groups/${id}`, { method: "DELETE" });
}

// ─── Spec Type CRUD ───────────────────────────────────────────────────────────

export async function getSpecTypesByGroup(groupId: string): Promise<SpecType[]> {
  return apiFetch<SpecType[]>(`/admin/specs/types?groupId=${groupId}`);
}

export async function addSpecType(groupId: string, data: SpecTypeFormData): Promise<SpecType> {
  return apiFetch<SpecType>("/admin/specs/types", {
    method: "POST",
    body: JSON.stringify(specTypeFormToDto(groupId, data)),
  });
}

export async function updateSpecType(
  id: string,
  data: Partial<SpecTypeFormData>
): Promise<SpecType> {
  return apiFetch<SpecType>(`/admin/specs/types/${id}`, {
    method: "PUT",
    body: JSON.stringify(specTypeUpdateToDto(data)),
  });
}

export async function deleteSpecType(id: string): Promise<void> {
  await apiFetch<void>(`/admin/specs/types/${id}`, { method: "DELETE" });
}

export async function reorderSpecTypes(groupId: string, orderedIds: string[]): Promise<void> {
  await apiFetch<void>("/admin/specs/types/reorder", {
    method: "PATCH",
    body: JSON.stringify({ groupId: Number(groupId), orderedIds: orderedIds.map(Number) }),
  });
}
