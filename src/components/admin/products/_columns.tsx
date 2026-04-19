"use client";

import Link from "next/link";
import {
  RowActions,
  RowActionEdit,
  RowActionDelete,
  RowActionClone,
  type ColumnDef,
} from "@/src/components/admin/DataTable";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { formatVND } from "@/src/lib/format";
import { formatDate, StockCell } from "./_shared";
import type { Product, ProductVariant } from "@/src/types/product.types";

export type ProductRow = Product & Record<string, unknown>;

export function buildColumns(
  onDelete: (product: Product) => void,
  onClone: (product: Product) => void,
  cloningProductId: string | null,
): ColumnDef<ProductRow>[] {
  return [
    // col 2 — Image slot: empty spacer for product rows (variants show thumbnail)
    {
      key: "thumbnailUrl",
      header: "",
      width: "w-14",
      render: () => (
        <span className="block w-10 h-10" aria-hidden="true" />
      ),
    },
    // col 3 — Product name + slug (clickable link with tooltip for full name)
    {
      key: "name",
      header: "Sản phẩm",
      sortable: true,
      render: (value, row) => {
        const id = row.id as string;
        const name = value as string;
        return (
          <div className="min-w-0">
            <Tooltip content={name} placement="top" anchorToContent>
              <Link
                href={`/products/${id}`}
                className="font-medium text-secondary-900 hover:text-primary-600 transition-colors truncate max-w-lg block"
              >
                {name}
              </Link>
            </Tooltip>
            <p className="text-xs text-secondary-400 truncate max-w-xs mt-0.5">
              {row.slug as string}
            </p>
          </div>
        );
      },
    },
    // col 4 — Category
    {
      key: "category",
      header: "Danh mục",
      width: "w-28",
      align: "center",
      render: (value) => (
        <span className="text-sm text-secondary-600">{value as string}</span>
      ),
    },
    // col 5 — Base price (min of variant prices)
    {
      key: "variants",
      header: "Giá cơ bản",
      sortable: false,
      align: "right",
      width: "w-36",
      render: (_value, row) => {
        const prices = (row.variants as ProductVariant[]).map((v) => v.price);
        const min = prices.length > 0 ? Math.min(...prices) : undefined;
        return (
          <span className="font-medium text-secondary-800 tabular-nums text-sm">
            {min !== undefined ? formatVND(min) : "—"}
          </span>
        );
      },
    },
    // col 6 — Total stock
    {
      key: "totalStock",
      header: "Tồn kho",
      sortable: true,
      align: "center",
      width: "w-32",
      render: (value) => <StockCell stock={value as number} />,
    },
    // col 7 — Status
    {
      key: "status",
      header: "Trạng thái",
      width: "w-28",
      align: "center",
      render: (value) => (
        <StatusBadge
          status={value as "published" | "draft" | "archived"}
          size="sm"
        />
      ),
    },
    // col 8 — Updated at
    {
      key: "updatedAt",
      header: "Updated",
      sortable: true,
      align: "center",
      width: "w-28",
      render: (value) => (
        <span className="text-xs text-secondary-500 tabular-nums">
          {formatDate(value as string)}
        </span>
      ),
    },
    // col 9 — Row actions: Edit + Delete with tooltips (View removed — use name link)
    {
      key: "id",
      header: "",
      align: "right",
      width: "w-20",
      render: (value, row) => {
        const id = value as string;
        const product = row as unknown as Product;
        const name = row.name as string;
        return (
          <RowActions>
            <Tooltip content="Nhân bản" placement="top">
              <span className="inline-flex">
                <RowActionClone
                  ariaLabel={`Nhân bản ${name}`}
                  isLoading={cloningProductId === id}
                  onClick={() => onClone(product)}
                />
              </span>
            </Tooltip>
            <Tooltip content="Sửa" placement="top">
              <span className="inline-flex">
                <RowActionEdit
                  href={`/products/${id}/edit`}
                  ariaLabel={`Chỉnh sửa ${name}`}
                />
              </span>
            </Tooltip>
            <Tooltip content="Xoá" placement="top">
              <span className="inline-flex">
                <RowActionDelete
                  ariaLabel={`Xoá ${name}`}
                  onClick={() => onDelete(product)}
                />
              </span>
            </Tooltip>
          </RowActions>
        );
      },
    },
  ];
}
