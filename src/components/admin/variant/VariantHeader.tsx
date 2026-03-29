import Link from "next/link";
import { ArrowLeftIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import type { Product, ProductVariantDetail } from "@/src/types/product.types";

// ─── VariantHeader ────────────────────────────────────────────────────────────

interface VariantHeaderProps {
  product: Product;
  variant: ProductVariantDetail;
}

export function VariantHeader({ product, variant }: VariantHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      {/* Left: breadcrumb + title */}
      <div>
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-secondary-400">
          <Link href="/products" className="transition-colors hover:text-secondary-700">
            Products
          </Link>
          <span aria-hidden="true">›</span>
          <Link
            href={`/products/${product.id}`}
            className="max-w-[200px] truncate transition-colors hover:text-secondary-700"
            title={product.name}
          >
            {product.name}
          </Link>
          <span aria-hidden="true">›</span>
          <Link
            href={`/products/${product.id}/variants`}
            className="transition-colors hover:text-secondary-700"
          >
            Variants
          </Link>
          <span aria-hidden="true">›</span>
          <span className="text-secondary-600">{variant.name}</span>
        </nav>

        {/* Title row */}
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-secondary-900">{variant.name}</h1>
          <StatusBadge status={variant.status} />
        </div>
        <p className="mt-1 font-mono text-xs text-secondary-400">{variant.sku}</p>
      </div>

      {/* Right: edit button */}
      <Link
        href={`/products/${product.id}/variants/${variant.id}/edit`}
        className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      >
        <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
        Edit Variant
      </Link>
    </div>
  );
}
