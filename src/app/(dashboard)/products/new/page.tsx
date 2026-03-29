import type { Metadata } from "next";
import { getProductBrands } from "@/src/services/product.service";
import { ProductFormPage } from "@/src/components/admin/products/ProductFormPage";
import { MOCK_CATEGORIES } from "@/src/app/(dashboard)/products/_categoryMock";

// ─── Route config ──────────────────────────────────────────────────────────────

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Add Product — Admin",
  description: "Create a new product in the catalogue.",
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function NewProductPage() {
  const brands = getProductBrands();

  return (
    <ProductFormPage
      mode="create"
      categories={MOCK_CATEGORIES}
      brands={brands}
    />
  );
}
