import type {
  CategorySpecGroupAssignment,
  CategorySpecGroupsView,
} from "@/src/types/spec_group.types";
import { apiFetch } from "@/src/services/api";

// ─── Assignment type mapping ──────────────────────────────────────────────────

function toHanhDong(assignmentType: "include" | "exclude" | "ghi_de_thu_tu"): string {
  if (assignmentType === "exclude") return "loai_tru";
  if (assignmentType === "ghi_de_thu_tu") return "ghi_de_thu_tu";
  return "hien_thi";
}

// ─── Direct assignments ───────────────────────────────────────────────────────

export async function getDirectAssignments(
  categoryId: string
): Promise<CategorySpecGroupAssignment[]> {
  return apiFetch<CategorySpecGroupAssignment[]>(
    `/admin/specs/category-groups?categoryId=${categoryId}`
  );
}

// ─── Inheritance resolver ─────────────────────────────────────────────────────

export async function getCategorySpecGroupsView(
  categoryId: string
): Promise<CategorySpecGroupsView> {
  return apiFetch<CategorySpecGroupsView>(
    `/admin/specs/category-groups/resolved?categoryId=${categoryId}`
  );
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function assignSpecGroup(
  categoryId: string,
  specGroupId: string,
  assignmentType: "include" | "exclude",
  displayOrder?: number
): Promise<void> {
  await apiFetch<unknown>("/admin/specs/category-groups", {
    method: "POST",
    body: JSON.stringify({
      danhMucId: Number(categoryId),
      nhomThongSoId: Number(specGroupId),
      hanhDong: toHanhDong(assignmentType),
      ...(displayOrder !== undefined && { thuTuHienThi: displayOrder }),
    }),
  });
}

export async function removeSpecGroupAssignment(
  categoryId: string,
  specGroupId: string
): Promise<void> {
  await apiFetch<void>(
    `/admin/specs/category-groups?categoryId=${categoryId}&groupId=${specGroupId}`,
    { method: "DELETE" }
  );
}

export async function reorderSpecGroupsForCategory(
  categoryId: string,
  orderedSpecGroupIds: string[]
): Promise<void> {
  await apiFetch<void>("/admin/specs/category-groups/reorder", {
    method: "PATCH",
    body: JSON.stringify({
      categoryId: Number(categoryId),
      orderedGroupIds: orderedSpecGroupIds.map(Number),
    }),
  });
}

export async function toggleSpecGroupFilter(
  categoryId: string,
  specGroupId: string,
  hienThiBoLoc: boolean
): Promise<void> {
  // Get direct assignments to find the link ID
  const assignments = await getDirectAssignments(categoryId);
  const link = assignments.find((a) => a.specGroupId === specGroupId);
  if (!link) return;

  await apiFetch<void>(`/admin/specs/category-groups/${link.id}`, {
    method: "PATCH",
    body: JSON.stringify({ hienThiBoLoc }),
  });
}

export async function createOverrideRecord(
  categoryId: string,
  specGroupId: string
): Promise<void> {
  await apiFetch<unknown>("/admin/specs/category-groups", {
    method: "POST",
    body: JSON.stringify({
      danhMucId: Number(categoryId),
      nhomThongSoId: Number(specGroupId),
      hanhDong: "ghi_de_thu_tu",
      thuTuHienThi: 0,
    }),
  });
}

export async function cancelOverrideRecord(
  categoryId: string,
  specGroupId: string
): Promise<void> {
  await apiFetch<void>(
    `/admin/specs/category-groups?categoryId=${categoryId}&groupId=${specGroupId}`,
    { method: "DELETE" }
  );
}
