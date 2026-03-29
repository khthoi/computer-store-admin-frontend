import type { HinhAnhSanPham } from "@/src/types/image.types";

// ─── Mock image data ───────────────────────────────────────────────────────
// Placeholder images per variant — replace with real storage URLs.

const MOCK_IMAGES: HinhAnhSanPham[] = [
  {
    id: "img-001-a-1",
    variantId: "var-001-a",
    url: "https://product.hstatic.net/200000722513/product/fwebp__6__be7ded7631fb4241b3edaf400ed9c617_master.png",
    alt: "RTX 4090 Standard - Ảnh 1",
    displayOrder: 1,
    createdAt: "2026-01-10T07:00:00Z",
  },
  {
    id: "img-001-a-2",
    variantId: "var-001-a",
    url: "https://placehold.co/400x400/1a1a2e/ffffff?text=RTX+4090+Standard+2",
    alt: "RTX 4090 Standard - Ảnh 2",
    displayOrder: 2,
    createdAt: "2026-01-10T07:00:00Z",
  },
  {
    id: "img-001-b-1",
    variantId: "var-001-b",
    url: "https://placehold.co/400x400/f5f5f5/1a1a2e?text=RTX+4090+White",
    alt: "RTX 4090 White Edition - Ảnh 1",
    displayOrder: 1,
    createdAt: "2026-01-10T07:00:00Z",
  },
  {
    id: "img-002-a-1",
    variantId: "var-002-a",
    url: "https://placehold.co/400x400/0068b5/ffffff?text=i9-14900K+Box",
    alt: "Intel i9-14900K Box - Ảnh 1",
    displayOrder: 1,
    createdAt: "2026-01-12T08:00:00Z",
  },
  {
    id: "img-003-a-1",
    variantId: "var-003-a",
    url: "https://placehold.co/400x400/1428a0/ffffff?text=990+Pro+1TB",
    alt: "Samsung 990 Pro 1TB - Ảnh 1",
    displayOrder: 1,
    createdAt: "2026-01-15T06:00:00Z",
  },
];

// ─── Service ───────────────────────────────────────────────────────────────

/**
 * Fetch images for a variant.
 * Mock implementation — replace with GET /admin/products/:productId/variants/:variantId/images
 */
export async function getImages(variantId: string): Promise<HinhAnhSanPham[]> {
  await new Promise<void>((r) => setTimeout(r, 50));
  return MOCK_IMAGES.filter((img) => img.variantId === variantId);
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
