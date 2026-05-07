import { apiFetch } from "@/src/services/api";
import type {
  HomepageSection,
  HomepageSectionFormData,
  PreviewProduct,
  DanhMucOption,
  ThuongHieuOption,
  KhuyenMaiOption,
} from "@/src/types/homepage.types";

// ─── Payload mapper ───────────────────────────────────────────────────────────

function toBackendPayload(data: HomepageSectionFormData) {
  return {
    title: data.title,
    subtitle: data.subtitle || undefined,
    viewAllUrl: data.viewAllUrl || undefined,
    type: data.type,
    sourceConfig: data.type === "manual" ? null : data.sourceConfig,
    sortBy: data.sortBy,
    maxProducts: data.maxProducts,
    layout: data.layout,
    badgeLabel: data.badgeLabel || undefined,
    badgeColor: data.badgeColor || undefined,
    isVisible: data.isVisible,
    startAt: data.ngayBatDau || undefined,
    endAt: data.ngayKetThuc || undefined,
    items:
      data.type === "manual"
        ? data.manualItems.map((item, idx) => ({
            variantId: item.phienBanId,
            sortOrder: idx,
          }))
        : undefined,
  };
}

// ─── Core CRUD ────────────────────────────────────────────────────────────────

export async function getHomepageSections(): Promise<HomepageSection[]> {
  return apiFetch<HomepageSection[]>("/admin/homepage-sections");
}

export async function createHomepageSection(
  data: HomepageSectionFormData
): Promise<HomepageSection> {
  return apiFetch<HomepageSection>("/admin/homepage-sections", {
    method: "POST",
    body: JSON.stringify(toBackendPayload(data)),
  });
}

export async function updateHomepageSection(
  id: number,
  data: HomepageSectionFormData
): Promise<HomepageSection> {
  return apiFetch<HomepageSection>(`/admin/homepage-sections/${id}`, {
    method: "PUT",
    body: JSON.stringify(toBackendPayload(data)),
  });
}

export async function deleteHomepageSection(id: number): Promise<void> {
  await apiFetch<void>(`/admin/homepage-sections/${id}`, { method: "DELETE" });
}

// ─── Clone + Reorder ──────────────────────────────────────────────────────────

export async function duplicateHomepageSection(id: number): Promise<HomepageSection> {
  return apiFetch<HomepageSection>(`/admin/homepage-sections/${id}/clone`, {
    method: "POST",
  });
}

export async function reorderHomepageSections(ids: number[]): Promise<void> {
  await apiFetch<void>("/admin/homepage-sections/reorder", {
    method: "PATCH",
    body: JSON.stringify({ ids }),
  });
}

// ─── Preview products ─────────────────────────────────────────────────────────

export async function getPreviewProducts(
  type: string,
  sourceConfig: unknown,
  maxProducts: number
): Promise<PreviewProduct[]> {
  const qs = new URLSearchParams();
  qs.set("type", type);
  qs.set("maxProducts", String(maxProducts));
  if (sourceConfig) qs.set("sourceConfig", JSON.stringify(sourceConfig));
  return apiFetch<PreviewProduct[]>(`/admin/homepage-sections/preview?${qs}`);
}

// ─── Product search (ManualItemsEditor) ───────────────────────────────────────

type ProductListItem = {
  id: string;
  name: string;
  variants: Array<{
    id: string;
    sku: string;
    price: number;
    thumbnailUrl?: string;
    isDefault?: boolean;
  }>;
};

function toPreviewProduct(p: ProductListItem): PreviewProduct {
  const v = p.variants?.find((v) => v.isDefault) ?? p.variants?.[0];
  return {
    sanPhamId: Number(p.id ?? 0),
    phienBanId: Number(v?.id ?? 0),
    tenSanPham: p.name,
    SKU: v?.sku ?? "",
    giaBan: Number(v?.price ?? 0),
    giaGoc: Number(v?.price ?? 0),
    hinhAnh: v?.thumbnailUrl,
  };
}

export async function searchProducts(
  q: string,
  danhMucId?: number
): Promise<PreviewProduct[]> {
  const qs = new URLSearchParams();
  if (q.trim()) qs.set("q", q.trim());
  if (danhMucId) qs.set("categoryId", String(danhMucId));
  qs.set("limit", "20");
  const result = await apiFetch<{ data: ProductListItem[] }>(`/admin/products?${qs}`);
  return (result?.data ?? []).map(toPreviewProduct);
}

// ─── Reference data loaders ───────────────────────────────────────────────────

type CategoryFlat = { id: string; name: string; slug: string };
type BrandItem = { id: string; name: string; slug?: string };
type PromotionItem = { id: string; name: string; startDate: string; endDate: string };

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export async function getDanhMucOptions(): Promise<DanhMucOption[]> {
  const cats = await apiFetch<CategoryFlat[]>("/admin/categories?flat=true");
  return (cats ?? []).map((c) => ({
    value: Number(c.id),
    label: c.name,
    description: c.slug,
  }));
}

export async function getThuongHieuOptions(): Promise<ThuongHieuOption[]> {
  const result = await apiFetch<{ data: BrandItem[] } | BrandItem[]>("/admin/brands?limit=100");
  const brands = Array.isArray(result) ? result : ((result as { data: BrandItem[] })?.data ?? []);
  return brands.map((b) => ({
    value: Number(b.id),
    label: b.name,
    description: b.slug,
  }));
}

export async function getKhuyenMaiOptions(): Promise<KhuyenMaiOption[]> {
  const result = await apiFetch<{ data: PromotionItem[] }>("/admin/promotions?limit=100");
  return (result?.data ?? []).map((p) => ({
    value: Number(p.id),
    label: p.name,
    description: `${fmtDate(p.startDate)} – ${fmtDate(p.endDate)}`,
  }));
}
