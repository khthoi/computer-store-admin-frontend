import type { ThuongHieu } from "@/src/types/brand.types";
import { MOCK_BRANDS } from "@/src/app/(dashboard)/brands/_mock";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface BrandFormData {
  name: string;
  slug: string;
  description: string;
  websiteUrl: string;
  countryOfOrigin: string;
  active: boolean;
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

/**
 * Fetch brands with optional filtering and pagination.
 * Mock implementation — replace with GET /admin/brands
 */
export async function getBrands(params: GetBrandsParams = {}): Promise<GetBrandsResult> {
  await new Promise<void>((r) => setTimeout(r, 50));
  const { q = "", active, page = 1, pageSize = 20 } = params;

  let filtered = MOCK_BRANDS.slice();

  if (q) {
    const lower = q.toLowerCase();
    filtered = filtered.filter(
      (b) =>
        b.name.toLowerCase().includes(lower) ||
        b.slug.includes(lower) ||
        b.description.toLowerCase().includes(lower)
    );
  }

  if (active !== undefined) {
    filtered = filtered.filter((b) => b.active === active);
  }

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  return { data: filtered.slice(start, start + pageSize), total };
}

/**
 * Fetch a single brand by ID.
 * Mock implementation — replace with GET /admin/brands/:id
 */
export async function getBrandById(id: string): Promise<ThuongHieu | null> {
  await new Promise<void>((r) => setTimeout(r, 50));
  return MOCK_BRANDS.find((b) => b.id === id) ?? null;
}

/**
 * Create a new brand.
 * Mock implementation — replace with POST /admin/brands
 */
export async function createBrand(data: BrandFormData): Promise<ThuongHieu> {
  await new Promise<void>((r) => setTimeout(r, 600));
  const now = new Date().toISOString();
  return {
    id: `brand-${Date.now()}`,
    name: data.name,
    slug: data.slug,
    description: data.description,
    websiteUrl: data.websiteUrl,
    active: data.active,
    productCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Update a brand.
 * Mock implementation — replace with PUT /admin/brands/:id
 */
export async function updateBrand(
  id: string,
  data: Partial<BrandFormData> & { logoUrl?: string }
): Promise<ThuongHieu> {
  await new Promise<void>((r) => setTimeout(r, 600));
  const existing = MOCK_BRANDS.find((b) => b.id === id);
  if (!existing) throw new Error(`Brand ${id} not found`);
  return {
    ...existing,
    ...data,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Delete a brand by ID.
 * Mock implementation — replace with DELETE /admin/brands/:id
 */
export async function deleteBrand(_id: string): Promise<void> {
  await new Promise<void>((r) => setTimeout(r, 600));
}
