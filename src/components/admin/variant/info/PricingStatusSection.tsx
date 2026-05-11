import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { Badge } from "@/src/components/ui/Badge";
import { formatVND, discountPercent } from "@/src/lib/format";
import type { ProductVariantDetail } from "@/src/types/product.types";

// ─── PricingStatusSection ─────────────────────────────────────────────────────

interface PricingStatusSectionProps {
  variant: ProductVariantDetail;
}

const STATUS_DESCRIPTION: Record<string, string> = {
  visible:      "Visible to customers",
  hidden:       "Hidden from storefront",
  out_of_stock: "Not available for purchase",
};

export function PricingStatusSection({ variant }: PricingStatusSectionProps) {
  const discount = discountPercent(variant.salePrice, variant.originalPrice);

  return (
    <div className="rounded-xl border border-secondary-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-secondary-500">
        Giá bán &amp; Trạng thái
      </h2>

      {/* Pricing */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-secondary-500">Giá gốc</span>
          <span className="text-lg font-bold tabular-nums text-secondary-900">
            {formatVND(variant.originalPrice)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-secondary-500">Giá bán</span>
          <span className="text-lg font-bold tabular-nums text-primary-700">
            {formatVND(variant.salePrice)}
          </span>
        </div>

        {discount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-secondary-500">Giảm giá</span>
            <Badge variant="success" size="sm">−{discount}%</Badge>
          </div>
        )}
      </div>

      <hr className="my-4 border-secondary-100" />

      {/* Status */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-secondary-500">Trạng thái</span>
          <StatusBadge status={variant.status} size="sm" />
        </div>
        <p className="text-right text-xs text-secondary-400">
          {STATUS_DESCRIPTION[variant.status] ?? ""}
        </p>
      </div>
    </div>
  );
}
