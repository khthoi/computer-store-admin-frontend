import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductById } from "@/src/services/product.service";
import { getVariantById } from "@/src/services/variant.service";
import { VariantFormPage } from "@/src/components/admin/catalog/VariantFormPage";

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
        ? `Sửa phiên bản: ${variant.name} — Admin`
        : "Không tìm thấy — Admin",
  };
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function EditVariantPage({
  params,
}: {
  params: Promise<{ id: string; variantId: string }>;
}) {
  const { id, variantId } = await params;
  const [product, variant] = await Promise.all([
    getProductById(id),
    getVariantById(id, variantId),
  ]);

  if (!product || !variant) notFound();

  return (
    <VariantFormPage
      mode="edit"
      productId={id}
      productName={product.name}
      variant={variant}
    />
  );
}
