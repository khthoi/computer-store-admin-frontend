import type { Metadata } from "next";
import { getProductCategories, getProductBrands } from "@/src/services/product.service";
import { ProductFormPage } from "@/src/components/admin/products/ProductFormPage";

// ─── Route config ──────────────────────────────────────────────────────────────

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Add Product — Admin",
  description: "Create a new product in the catalogue.",
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function NewProductPage() {
  const categories = getProductCategories();
  const brands     = getProductBrands();

  return (
    <ProductFormPage
      mode="create"
      categories={categories}
      brands={brands}
    />
  );
}
