import type { ThuongHieu } from "@/src/types/brand.types";
import { apiFetch } from "@/src/services/api";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface BrandFormData {
  name: string;
  slug: string;
  description: string;
  websiteUrl: string;
  countryOfOrigin: string;
  active: boolean;
  logoUrl?: string;
  logoAlt?: string;
}

export interface GetBrandsParams {
  q?: string;
  active?: boolean;
  page?: number;
  pageSize?: number;
}

export interface GetBrandsResult {
  data: ThuongHieu[];
  total: number;
}

// ─── Service ───────────────────────────────────────────────────────────────

export async function getBrands(params: GetBrandsParams = {}): Promise<GetBrandsResult> {
  const { q, active, page = 1, pageSize } = params;
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  if (pageSize) qs.set("limit", String(pageSize));
  if (q)        qs.set("q", q);
  if (active !== undefined) qs.set("active", String(active));
  return apiFetch<GetBrandsResult>(`/admin/brands?${qs}`);
}

export async function getBrandById(id: string): Promise<ThuongHieu | null> {
  try {
    return await apiFetch<ThuongHieu>(`/admin/brands/${id}`);
  } catch {
    return null;
  }
}

export async function createBrand(data: BrandFormData): Promise<ThuongHieu> {
  return apiFetch<ThuongHieu>("/admin/brands", {
    method: "POST",
    body: JSON.stringify({
      tenThuongHieu: data.name,
      ...(data.slug ? { slug: data.slug } : {}),
      ...(data.description ? { moTa: data.description } : {}),
      trangThai: data.active ? "HienThi" : "An",
      ...(data.logoUrl ? { logo: data.logoUrl } : {}),
      ...(data.logoAlt ? { logoAlt: data.logoAlt } : {}),
      ...(data.websiteUrl ? { websiteUrl: data.websiteUrl } : {}),
    }),
  });
}

export async function updateBrand(
  id: string,
  data: Partial<BrandFormData> & { logoUrl?: string },
): Promise<ThuongHieu> {
  return apiFetch<ThuongHieu>(`/admin/brands/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      ...(data.name !== undefined ? { tenThuongHieu: data.name } : {}),
      ...(data.slug !== undefined ? { slug: data.slug || null } : {}),
      ...(data.description !== undefined ? { moTa: data.description } : {}),
      ...(data.active !== undefined ? { trangThai: data.active ? "HienThi" : "An" } : {}),
      ...(data.logoUrl !== undefined ? { logo: data.logoUrl } : {}),
      ...(data.logoAlt !== undefined ? { logoAlt: data.logoAlt || null } : {}),
      ...(data.websiteUrl !== undefined ? { websiteUrl: data.websiteUrl || undefined } : {}),
    }),
  });
}

export async function deleteBrand(id: string): Promise<void> {
  await apiFetch<void>(`/admin/brands/${id}`, { method: "DELETE" });
}
