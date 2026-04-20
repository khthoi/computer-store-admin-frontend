import type { ProductVariant } from "@/src/types/product.types";

interface Props {
  variants: ProductVariant[];
}

export function ProductVariantStats({ variants }: Props) {
  const activeCount   = variants.filter((v) => v.status === "active").length;
  const lowStockCount = variants.filter((v) => v.stock > 0 && v.stock <= 5).length;
  const outOfStock    = variants.filter((v) => v.stock === 0).length;

  return (
    <div className="rounded-xl border border-secondary-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-secondary-500">
        Các phiên bản
      </h2>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-secondary-500">Tổng số phiên bản</span>
          <span className="font-semibold text-secondary-900">{variants.length}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-secondary-500">Đang hoạt động</span>
          <span className="font-semibold text-secondary-900">{activeCount}</span>
        </div>
        {lowStockCount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-secondary-500">Tồn kho thấp (≤ 5)</span>
            <span className="font-semibold text-warning-600">{lowStockCount}</span>
          </div>
        )}
        {outOfStock > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-secondary-500">Hết hàng</span>
            <span className="font-semibold text-error-600">{outOfStock}</span>
          </div>
        )}
      </div>
    </div>
  );
}
