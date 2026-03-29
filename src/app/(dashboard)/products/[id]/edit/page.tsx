import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getProductById,
  getProductBrands,
} from "@/src/services/product.service";
import { ProductFormPage } from "@/src/components/admin/products/ProductFormPage";
import { MOCK_CATEGORIES } from "@/src/app/(dashboard)/products/_categoryMock";

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
  const [product, brands] = await Promise.all([
    getProductById(id),
    Promise.resolve(getProductBrands()),
  ]);

  if (!product) notFound();

  return (
    <ProductFormPage
      mode="edit"
      product={product}
      categories={MOCK_CATEGORIES}
      brands={brands}
    />
  );
}
