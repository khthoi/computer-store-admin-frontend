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
  pendingClones: Map<string, string>,
  savingCloneId: string | null,
  onSavePending: (id: string) => void,
  onCancelPending: (id: string) => void,
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
      width: "w-40",
      align: "center",
      render: (value) => (
        <span className="text-sm text-secondary-600">{value as string}</span>
      ),
    },
    // col 5 — Base price (price of the default variant, fallback to first)
    {
      key: "basePrice",
      header: "Giá cơ bản",
      sortable: true,
      align: "right",
      width: "w-36",
      render: (_value, row) => {
        const variants = row.variants as ProductVariant[];
        const defaultVariant = variants.find((v) => v.isDefault) ?? variants[0];
        return (
          <span className="font-medium text-secondary-800 tabular-nums text-sm">
            {defaultVariant ? formatVND(defaultVariant.price) : "—"}
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
    // col 9 — Row actions (pending clones show Save/Cancel instead)
    {
      key: "id",
      header: "",
      align: "right",
      width: "w-20",
      render: (value, row) => {
        const id = value as string;
        const product = row as unknown as Product;
        const name = row.name as string;

        if (pendingClones.has(id)) {
          const isSaving = savingCloneId === id;
          return (
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => onSavePending(id)}
                className="rounded-md bg-primary-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {isSaving ? "Đang lưu..." : "Lưu"}
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => onCancelPending(id)}
                className="rounded-md border border-secondary-300 bg-white px-2.5 py-1.5 text-xs font-medium text-secondary-700 hover:bg-secondary-50 disabled:opacity-50"
              >
                Hủy
              </button>
            </div>
          );
        }

        return (
          <RowActions>
            <Tooltip content="Nhân bản" placement="top">
              <span className="inline-flex">
                <RowActionClone
                  ariaLabel={`Nhân bản ${name}`}
                  isLoading={false}
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
