import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "@heroicons/react/24/outline";
import { getProducts } from "@/src/services/product.service";
import { ProductsTable } from "@/src/components/admin/products/ProductsTable";

// ─── Route config ─────────────────────────────────────────────────────────────

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Products — Admin",
  description: "Manage your product catalogue, variants, and inventory.",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

/**
 * ProductsPage — server component.
 * Fetches the full product list on every request (force-dynamic / no cache),
 * then hands the data to the client-side ProductsTable for interactive
 * search, filtering, sorting, and deletion.
 */
export default async function ProductsPage() {
  const { data: products } = await getProducts({ pageSize: 1000 });

  return (
    <div className="space-y-6 p-6">
      {/* ── Page header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Products</h1>
          <p className="mt-1 text-sm text-secondary-500">
            Manage your product catalogue, variants, and inventory.
          </p>
        </div>

        <Link
          href="/products/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        >
          <PlusIcon className="w-4 h-4" aria-hidden="true" />
          Add Product
        </Link>
      </div>

      {/* ── Table ── */}
      <ProductsTable initialProducts={products} />
    </div>
  );
}
