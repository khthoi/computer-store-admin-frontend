import Link from "next/link";
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { Badge } from "@/src/components/ui/Badge";
import type { Product, CreatorRole } from "@/src/types/product.types";
import type { BadgeVariant } from "@/src/components/ui/Badge";

const ROLE_VARIANT: Record<CreatorRole, BadgeVariant> = {
  Admin:  "primary",
  Editor: "success",
  Staff:  "warning",
};

interface Props {
  product: Product;
}

export function ProductDetailHeader({ product }: Props) {
  return (
    <>
      <Link
        href="/products"
        className="inline-flex items-center gap-1.5 text-sm text-secondary-500 transition-colors hover:text-secondary-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Danh sách sản phẩm
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">{product.name}</h1>
          <p className="mt-1 font-mono text-xs text-secondary-400">{product.slug}</p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={product.status} />
            {product.hasActiveOrders && <StatusBadge status="has_active_orders" />}
          </div>

          {product.createdBy && (
            <div className="mt-3 flex items-center gap-2">
              <UserCircleIcon className="h-4 w-4 shrink-0 text-secondary-400" />
              <span className="text-sm text-secondary-400">Được tạo bởi</span>
              <span className="inline-flex items-baseline gap-1">
                <span className="text-sm font-medium text-secondary-700">
                  {product.createdBy.name}
                </span>
                {/*
                 * Role badge sits on a raised baseline (-top-2), mimicking
                 * the "x²" exponent notation for visual hierarchy.
                 */}
                <span className="relative -top-2">
                  <Badge variant={ROLE_VARIANT[product.createdBy.role]} size="sm">
                    {product.createdBy.role}
                  </Badge>
                </span>
              </span>
            </div>
          )}
        </div>

        <Link
          href={`/products/${product.id}/edit`}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        >
          <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
          Chỉnh sửa
        </Link>
      </div>
    </>
  );
}
