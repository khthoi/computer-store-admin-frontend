import type {
  BuildPCSlot,
  BuildPCSlotFormData,
  BuildPCRule,
  BuildPCRuleFormData,
  BuildPCBuild,
  BuildPCBuildDetail,
  TechKeyOption,
  SlotOption,
  CategoryOption,
} from "@/src/types/buildpc.types";
import { apiFetch } from "@/src/services/api";


// ─── Option data ──────────────────────────────────────────────────────────────

export async function fetchTechKeys(categoryIds?: number[]): Promise<TechKeyOption[]> {
  const qs = categoryIds && categoryIds.length > 0 ? `?categoryIds=${categoryIds.join(",")}` : "";
  const raw = await apiFetch<{ value: string; label: string; unit: string | null; groupId: number; groupName: string }[]>(
    `/admin/build-pc/tech-keys${qs}`
  );
  return raw.map((t) => ({
    value: t.value,
    label: t.label,
    unit: t.unit ?? undefined,
    groupId: t.groupId,
    groupName: t.groupName,
  }));
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: 1, label: "Vi xử lý",          description: "cpu" },
  { value: 2, label: "Bo mạch chủ",        description: "mainboard" },
  { value: 3, label: "Bộ nhớ RAM",         description: "ram" },
  { value: 4, label: "Card đồ họa",        description: "gpu" },
  { value: 5, label: "Nguồn máy tính",     description: "psu" },
  { value: 6, label: "Ổ cứng / SSD",       description: "storage" },
  { value: 7, label: "Tản nhiệt",          description: "cooler" },
  { value: 8, label: "Vỏ case",            description: "case" },
];

// ─── Slot CRUD ────────────────────────────────────────────────────────────────

export async function fetchSlots(): Promise<BuildPCSlot[]> {
  return apiFetch<BuildPCSlot[]>("/admin/build-pc/slots");
}

export async function createSlot(data: BuildPCSlotFormData): Promise<BuildPCSlot> {
  return apiFetch<BuildPCSlot>("/admin/build-pc/slots", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateSlot(id: string, data: BuildPCSlotFormData): Promise<BuildPCSlot> {
  return apiFetch<BuildPCSlot>(`/admin/build-pc/slots/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteSlot(id: string): Promise<void> {
  await apiFetch<void>(`/admin/build-pc/slots/${id}`, { method: "DELETE" });
}

export async function reorderSlots(orderedIds: string[]): Promise<void> {
  await apiFetch<void>("/admin/build-pc/slots/reorder", {
    method: "PATCH",
    body: JSON.stringify({ ids: orderedIds.map(Number) }),
  });
}

// ─── Rule CRUD ────────────────────────────────────────────────────────────────

export async function fetchRules(): Promise<BuildPCRule[]> {
  return apiFetch<BuildPCRule[]>("/admin/build-pc/rules");
}

export async function createRule(data: BuildPCRuleFormData): Promise<BuildPCRule> {
  return apiFetch<BuildPCRule>("/admin/build-pc/rules", {
    method: "POST",
    body: JSON.stringify({
      tenQuyTac: `${data.slotNguonId} → ${data.slotDichId} [${data.maKyThuat}]`,
      slotNguonId: Number(data.slotNguonId),
      slotDichId: data.slotDichId ? Number(data.slotDichId) : undefined,
      maKyThuat: data.maKyThuat,
      loaiKiemTra: data.loaiKiemTra,
      heSo: data.heSo !== "" ? parseFloat(data.heSo) : undefined,
      giaTriMacDinh: data.giaTriMacDinh || undefined,
      moTa: data.moTa || undefined,
      batBuoc: data.batBuoc,
      isActive: data.isActive,
    }),
  });
}

export async function updateRule(id: string, data: BuildPCRuleFormData): Promise<BuildPCRule> {
  return apiFetch<BuildPCRule>(`/admin/build-pc/rules/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      tenQuyTac: `${data.slotNguonId} → ${data.slotDichId} [${data.maKyThuat}]`,
      slotNguonId: Number(data.slotNguonId),
      slotDichId: data.slotDichId ? Number(data.slotDichId) : undefined,
      maKyThuat: data.maKyThuat,
      loaiKiemTra: data.loaiKiemTra,
      heSo: data.heSo !== "" ? parseFloat(data.heSo) : undefined,
      giaTriMacDinh: data.giaTriMacDinh || undefined,
      moTa: data.moTa || undefined,
      batBuoc: data.batBuoc,
      isActive: data.isActive,
    }),
  });
}

export async function deleteRule(id: string): Promise<void> {
  await apiFetch<void>(`/admin/build-pc/rules/${id}`, { method: "DELETE" });
}

// ─── Build read ───────────────────────────────────────────────────────────────

export interface BuildListParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  customerId?: string;
}

export interface BuildListResult {
  data: BuildPCBuild[];
  total: number;
}

export async function fetchBuilds(params: BuildListParams = {}): Promise<BuildListResult> {
  const qs = new URLSearchParams();
  if (params.page)       qs.set("page",       String(params.page));
  if (params.limit)      qs.set("limit",      String(params.limit));
  if (params.status)     qs.set("status",     params.status);
  if (params.search)     qs.set("search",     params.search);
  if (params.customerId) qs.set("customerId", params.customerId);
  return apiFetch<BuildListResult>(`/admin/build-pc/builds?${qs}`);
}

export async function fetchBuildsByCustomerId(customerId: string, params: Omit<BuildListParams, "customerId"> = {}): Promise<BuildPCBuild[]> {
  const result = await fetchBuilds({ ...params, customerId });
  return result?.data ?? [];
}

export async function fetchBuildDetail(id: string): Promise<BuildPCBuildDetail> {
  return apiFetch<BuildPCBuildDetail>(`/admin/build-pc/builds/${id}`);
}

// ─── Slot option helper (derived from live slot list) ─────────────────────────

export function slotsToOptions(slots: BuildPCSlot[]): SlotOption[] {
  return slots.map((s) => ({
    value: s.id,
    label: s.tenKhe,
    description: s.maKhe,
  }));
}
