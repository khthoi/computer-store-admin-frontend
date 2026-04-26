import type { PhienBanSanPham, PhienBanStatus } from "@/src/types/variant.types";
import { apiFetch } from "@/src/services/api";

// Shapes returned by GET /admin/products/:id (backend VariantListResponse + ProductListResponse)
interface VariantListResponse {
  id: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
  status: "active" | "inactive";
  thumbnailUrl: string | null;
  updatedAt: string;
  isDefault: boolean;
}

interface ProductAdminDetail {
  id: string;
  name: string;
  variants: VariantListResponse[];
}

// ─── Types ─────────────────────────────────────────────────────────────────

export interface VariantFormData {
  name: string;
  sku: string;
  price: number;
  stock: number;
  status: PhienBanStatus;
}

// Raw entity shape returned by POST/PUT variant endpoints (before DTO mapping)
interface RawVariantEntity {
  id: number;
  sanPhamId: number;
  tenPhienBan: string;
  sku: string;
  giaGoc: number;
  giaBan: number;
  soLuongTon: number;
  trangThai: string;
  isMacDinh: boolean;
  ngayCapNhat: string | null;
  images?: unknown[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function mapDbStatusToFrontend(trangThai: string): PhienBanStatus {
  return trangThai === "HienThi" ? "active" : "inactive";
}

function mapFrontendStatusToDb(status: PhienBanStatus): string {
  return status === "active" ? "HienThi" : "An";
}

function mapVariantListToPhienBan(
  v: VariantListResponse,
  productId: string,
  productName: string
): PhienBanSanPham {
  return {
    id: v.id,
    productId,
    productName,
    sku: v.sku,
    name: v.name,
    price: v.price,
    stock: v.stock,
    status: v.status,
    thumbnailUrl: v.thumbnailUrl ?? undefined,
    updatedAt: v.updatedAt,
    createdAt: v.updatedAt, // proxy — VariantListResponse has no createdAt
    isDefault: v.isDefault,
  };
}

function mapRawEntityToPhienBan(
  raw: RawVariantEntity,
  productName: string
): PhienBanSanPham {
  const now = new Date().toISOString();
  return {
    id: String(raw.id),
    productId: String(raw.sanPhamId),
    productName,
    sku: raw.sku,
    name: raw.tenPhienBan,
    price: Number(raw.giaBan),
    stock: raw.soLuongTon ?? 0,
    status: mapDbStatusToFrontend(raw.trangThai),
    updatedAt: raw.ngayCapNhat ?? now,
    createdAt: raw.ngayCapNhat ?? now,
    isDefault: raw.isMacDinh,
  };
}

// ─── Service ───────────────────────────────────────────────────────────────

export async function getAllVariants(): Promise<PhienBanSanPham[]> {
  // No bulk-all endpoint — callers should use getVariants(productId) instead.
  return [];
}

export async function getVariants(productId: string): Promise<PhienBanSanPham[]> {
  const product = await apiFetch<ProductAdminDetail>(`/admin/products/${productId}`);
  return (product.variants ?? []).map((v) =>
    mapVariantListToPhienBan(v, product.id, product.name)
  );
}

export async function getVariantById(
  productId: string,
  variantId: string
): Promise<PhienBanSanPham | null> {
  const product = await apiFetch<ProductAdminDetail>(`/admin/products/${productId}`);
  const found = (product.variants ?? []).find((v) => v.id === variantId);
  if (!found) return null;
  return mapVariantListToPhienBan(found, product.id, product.name);
}

export async function createVariant(
  productId: string,
  productName: string,
  data: VariantFormData
): Promise<PhienBanSanPham> {
  const raw = await apiFetch<RawVariantEntity>(`/admin/products/${productId}/variants`, {
    method: "POST",
    body: JSON.stringify({
      tenPhienBan: data.name,
      sku: data.sku,
      giaGoc: data.price,
      giaBan: data.price,
      soLuongTon: data.stock,
      trangThai: mapFrontendStatusToDb(data.status),
    }),
  });
  return mapRawEntityToPhienBan(raw, productName);
}

export async function updateVariant(
  _productId: string,
  variantId: string,
  data: Partial<VariantFormData>
): Promise<PhienBanSanPham> {
  const body: Record<string, unknown> = {};
  if (data.name !== undefined) body.tenPhienBan = data.name;
  if (data.sku !== undefined) body.sku = data.sku;
  if (data.price !== undefined) { body.giaGoc = data.price; body.giaBan = data.price; }
  if (data.stock !== undefined) body.soLuongTon = data.stock;
  if (data.status !== undefined) body.trangThai = mapFrontendStatusToDb(data.status);

  const raw = await apiFetch<RawVariantEntity>(`/admin/products/variants/${variantId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  // productName not available from response — use a placeholder the caller can override
  return mapRawEntityToPhienBan(raw, "");
}

export async function deleteVariant(_productId: string, variantId: string): Promise<void> {
  await apiFetch<void>(`/admin/products/variants/${variantId}`, { method: "DELETE" });
}

export async function setDefaultVariant(productId: string, variantId: string): Promise<void> {
  await apiFetch<void>(`/admin/products/${productId}/variants/${variantId}/set-default`, {
    method: "PATCH",
  });
}

export async function bulkUpdateVariantStatus(
  _productId: string,
  variantIds: string[],
  status: PhienBanStatus
): Promise<void> {
  const trangThai = mapFrontendStatusToDb(status);
  await Promise.all(
    variantIds.map((id) =>
      apiFetch<void>(`/admin/products/variants/${id}`, {
        method: "PUT",
        body: JSON.stringify({ trangThai }),
      })
    )
  );
}
