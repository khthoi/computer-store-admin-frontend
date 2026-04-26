import type { HinhAnhSanPham } from "@/src/types/image.types";
import { apiFetch } from "@/src/services/api";

// Backend shape from GET /admin/products/variants/:variantId/images
interface ImageMediaResponse {
  id: string;
  variantId: string;
  url: string;
  assetId: string | null;
  type: "main" | "gallery" | "360";
  order: number;
  altText?: string;
}

// ─── Service ───────────────────────────────────────────────────────────────

export async function getImages(variantId: string): Promise<HinhAnhSanPham[]> {
  const images = await apiFetch<ImageMediaResponse[]>(`/admin/products/variants/${variantId}/images`);
  const now = new Date().toISOString();
  return (images ?? []).map((img) => ({
    id: img.id,
    variantId: img.variantId,
    url: img.url,
    alt: img.altText ?? "",
    displayOrder: img.order,
    createdAt: now,
  }));
}

/**
 * Upload images for a variant.
 * Mock implementation — replace with POST /admin/variants/:variantId/images (multipart)
 */
export async function uploadImages(
  variantId: string,
  _files: File[]
): Promise<HinhAnhSanPham[]> {
  await new Promise<void>((r) => setTimeout(r, 800));
  const now = new Date().toISOString();
  return _files.map((f, i) => ({
    id: `img-${Date.now()}-${i}`,
    variantId,
    url: URL.createObjectURL(f),
    alt: f.name.replace(/\.[^.]+$/, ""),
    displayOrder: 99 + i,
    createdAt: now,
  }));
}

/**
 * Delete an image by ID.
 * Mock implementation — replace with DELETE /admin/variants/:variantId/images/:imageId
 */
export async function deleteImage(_variantId: string, _imageId: string): Promise<void> {
  await new Promise<void>((r) => setTimeout(r, 400));
}

/**
 * Reorder images for a variant.
 * Mock implementation — replace with PATCH /admin/variants/:variantId/images/reorder
 */
export async function reorderImages(
  _variantId: string,
  _orderedIds: string[]
): Promise<void> {
  await new Promise<void>((r) => setTimeout(r, 400));
}
