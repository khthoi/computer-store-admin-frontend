import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductById, getVariantById } from "@/src/services/product.service";
import { VariantEditPage } from "@/src/components/admin/variantEdit";

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
        ? `Edit: ${variant.name} — Admin`
        : "Variant not found — Admin",
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

  return <VariantEditPage product={product} variant={variant} />;
}
