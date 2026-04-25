import type { Metadata } from "next";
import { getProductBrands } from "@/src/services/product.service";
import { getCategoryNodeTree } from "@/src/services/category.service";
import { ProductFormPage } from "@/src/components/admin/products/ProductFormPage";

// ─── Route config ──────────────────────────────────────────────────────────────

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Add Product — Admin",
  description: "Create a new product in the catalogue.",
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    getCategoryNodeTree(),
    getProductBrands(),
  ]);

  return (
    <ProductFormPage
      mode="create"
      categories={categories}
      brands={brands}
    />
  );
}
