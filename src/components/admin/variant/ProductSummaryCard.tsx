import Link from "next/link";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { Badge } from "@/src/components/ui/Badge";
import type { Product } from "@/src/types/product.types";

// ─── ProductSummaryCard ───────────────────────────────────────────────────────

interface ProductSummaryCardProps {
  product: Product;
}

export function ProductSummaryCard({ product }: ProductSummaryCardProps) {
  return (
    <div className="rounded-xl border border-secondary-200 bg-white p-4 shadow-sm">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-secondary-500">
        Parent Product
      </p>

      <p
        className="truncate text-sm font-semibold text-secondary-900"
        title={product.name}
      >
        {product.name}
      </p>
      <p className="mt-0.5 font-mono text-xs text-secondary-400">{product.slug}</p>

      <div className="mt-2">
        <StatusBadge status={product.status} size="sm" />
      </div>

      {/* Category + brands */}
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <Badge variant="default" size="sm">{product.category}</Badge>
        {product.brands.map((b) => (
          <Badge key={b} variant="default" size="sm">{b}</Badge>
        ))}
      </div>

      <Link
        href={`/products/${product.id}`}
        className="mt-3 inline-flex items-center text-xs font-medium text-primary-600 transition-colors hover:text-primary-800"
      >
        View product →
      </Link>
    </div>
  );
}
