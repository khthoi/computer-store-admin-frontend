import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductById, getProductBrands } from "@/src/services/product.service";
import { getCategoryNodeTree } from "@/src/services/category.service";
import { ProductFormPage } from "@/src/components/admin/products/ProductFormPage";

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
      ? `Edit: ${product.name} — Admin`
      : "Product not found — Admin",
  };
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories, brands] = await Promise.all([
    getProductById(id),
    getCategoryNodeTree(),
    getProductBrands(),
  ]);

  if (!product) notFound();

  return (
    <ProductFormPage
      mode="edit"
      product={product}
      categories={categories}
      brands={brands}
    />
  );
}
