import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductById } from "@/src/services/product.service";
import { getVariantById } from "@/src/services/variant.service";
import { getImages } from "@/src/services/image.service";
import { ImagesPageClient } from "@/src/components/admin/catalog/ImagesPageClient";

// ─── Route config ──────────────────────────────────────────────────────────────

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; variantId: string }>;
}): Promise<Metadata> {
  const { id, variantId } = await params;
  const [product, variant] = await Promise.all([
    getProductById(id),
    getVariantById(id, variantId),
  ]);
  return {
    title:
      product && variant
        ? `Hình ảnh: ${variant.name} — Admin`
        : "Không tìm thấy — Admin",
  };
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function VariantImagesPage({
  params,
}: {
  params: Promise<{ id: string; variantId: string }>;
}) {
  const { id, variantId } = await params;
  const [product, variant, images] = await Promise.all([
    getProductById(id),
    getVariantById(id, variantId),
    getImages(variantId),
  ]);

  if (!product || !variant) notFound();

  return (
    <ImagesPageClient
      productId={id}
      productName={product.name}
      variantId={variantId}
      variantName={variant.name}
      initialImages={images}
    />
  );
}
