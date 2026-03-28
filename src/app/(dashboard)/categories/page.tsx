import type { Metadata } from "next";
import { getCategories, getCategoryTree } from "@/src/services/category.service";
import { getSpecGroups } from "@/src/services/spec_group.service";
import { CategoriesPageClient } from "@/src/components/admin/catalog/CategoriesPageClient";

// ─── Route config ──────────────────────────────────────────────────────────────

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Danh mục — Admin",
  description: "Quản lý danh mục sản phẩm.",
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function CategoriesPage() {
  const [flat, tree, allSpecGroups] = await Promise.all([
    getCategories(),
    getCategoryTree(),
    getSpecGroups(),
  ]);

  return (
    <CategoriesPageClient
      initialFlat={flat}
      initialTree={tree}
      initialAllSpecGroups={allSpecGroups}
    />
  );
}
