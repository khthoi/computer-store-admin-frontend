import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductById } from "@/src/services/product.service";
import { getVariants } from "@/src/services/variant.service";
import { VariantsPageClient } from "@/src/components/admin/catalog/VariantsPageClient";

// ─── Route config ──────────────────────────────────────────────────────────────

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  return {
    title: product
      ? `Phiên bản: ${product.name} — Admin`
      : "Sản phẩm không tồn tại — Admin",
  };
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function ProductVariantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, variants] = await Promise.all([
    getProductById(id),
    getVariants(id),
  ]);

  if (!product) notFound();

  return (
    <VariantsPageClient
      productId={id}
      productName={product.name}
      initialData={variants}
    />
  );
}
