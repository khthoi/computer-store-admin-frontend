import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductById, getNewVariantTemplate } from "@/src/services/product.service";
import { VariantFormPage } from "@/src/components/admin/catalog/VariantFormPage";

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
      ? `Thêm phiên bản: ${product.name} — Admin`
      : "Sản phẩm không tồn tại — Admin",
  };
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function NewVariantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, specTemplate] = await Promise.all([
    getProductById(id),
    getNewVariantTemplate(id),
  ]);
  if (!product) notFound();

  return (
    <VariantFormPage
      mode="create"
      productId={id}
      productName={product.name}
      specTemplate={specTemplate}
    />
  );
}
