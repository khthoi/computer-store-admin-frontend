import {
  TagIcon,
  CubeIcon,
  CalendarDaysIcon,
  ArchiveBoxIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "@/src/components/ui/Badge";
import type { Product } from "@/src/types/product.types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Props {
  product: Product;
}

export function ProductInfoCard({ product }: Props) {
  return (
    <div className="rounded-xl border border-secondary-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-secondary-500">
        Thông tin sản phẩm
      </h2>
      <ul className="space-y-3 text-sm">
        <li className="flex items-start gap-3 text-secondary-700">
          <TagIcon className="mt-0.5 h-4 w-4 shrink-0 text-secondary-400" />
          <span>
            <span className="text-secondary-400">Danh mục: </span>
            {product.category}
          </span>
        </li>

        <li className="flex items-start gap-3">
          <CubeIcon className="mt-0.5 h-4 w-4 shrink-0 text-secondary-400" />
          <div>
            <span className="text-secondary-400">
              {product.brands.length === 1 ? "Thương hiệu" : "Các thương hiệu"}
            </span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {product.brands.map((b) => (
                <Badge key={b} variant="default" size="sm">{b}</Badge>
              ))}
            </div>
          </div>
        </li>

        <li className="flex items-start gap-3 text-secondary-700">
          <ArchiveBoxIcon className="mt-0.5 h-4 w-4 shrink-0 text-secondary-400" />
          <span>
            <span className="text-secondary-400">Tổng tồn kho: </span>
            <span
              className={`font-medium ${
                product.totalStock === 0
                  ? "text-error-600"
                  : product.totalStock <= 5
                  ? "text-warning-600"
                  : "text-secondary-900"
              }`}
            >
              {product.totalStock}
            </span>
          </span>
        </li>

        {product.averageRating !== undefined && (
          <li className="flex items-start gap-3 text-secondary-700">
            <StarIcon className="mt-0.5 h-4 w-4 shrink-0 text-secondary-400" />
            <span>
              <span className="text-secondary-400">Đánh giá: </span>
              <span className="font-medium text-secondary-900">
                {product.averageRating.toFixed(1)}
              </span>
              <span className="text-secondary-400"> / 5</span>
              {product.reviewCount !== undefined && (
                <span className="ml-2 text-xs text-secondary-400">
                  ({product.reviewCount.toLocaleString()} reviews)
                </span>
              )}
            </span>
          </li>
        )}

        <li className="flex items-start gap-3 text-secondary-700">
          <CalendarDaysIcon className="mt-0.5 h-4 w-4 shrink-0 text-secondary-400" />
          <span>
            <span className="text-secondary-400">Tạo lúc: </span>
            {formatDate(product.createdAt)}
          </span>
        </li>
        <li className="flex items-start gap-3 text-secondary-700">
          <CalendarDaysIcon className="mt-0.5 h-4 w-4 shrink-0 text-secondary-400" />
          <span>
            <span className="text-secondary-400">Cập nhật: </span>
            {formatDateTime(product.updatedAt)}
          </span>
        </li>
      </ul>
    </div>
  );
}
