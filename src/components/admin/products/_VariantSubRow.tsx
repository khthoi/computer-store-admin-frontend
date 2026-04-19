"use client";

import Image from "next/image";
import Link from "next/link";
import { CubeIcon } from "@heroicons/react/24/outline";
import {
  RowActions,
  RowActionEdit,
  RowActionDelete,
} from "@/src/components/admin/DataTable";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { Checkbox } from "@/src/components/ui/Checkbox";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { formatVND } from "@/src/lib/format";
import { formatDate, StockCell } from "./_shared";
import type { ProductVariant } from "@/src/types/product.types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VariantSubRowProps {
  variant: ProductVariant;
  productId: string;
  isSelected: boolean;
  onCheck: (id: string, checked: boolean) => void;
  onDeleteClick: (target: { id: string; name: string; sku: string }) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Renders a single variant sub-row inside a product row expansion.
 * Must output exactly 10 <td> cells to match the parent column layout.
 *
 * Layout:
 *   col 0  — checkbox (variant selection, mutually exclusive with products)
 *   col 1  — empty (no further expand)
 *   col 2  — thumbnail or fallback icon
 *   col 3  — variant name (link) + SKU
 *   col 4  — empty (category belongs to product)
 *   col 5  — price
 *   col 6  — stock
 *   col 7  — status
 *   col 8  — updatedAt
 *   col 9  — actions (Edit + Delete with tooltips)
 */
export function VariantSubRow({
  variant: v,
  productId,
  isSelected,
  onCheck,
  onDeleteClick,
}: VariantSubRowProps) {
  return (
    <tr
      className={[
        "border-t border-secondary-100/60 transition-colors",
        isSelected ? "bg-primary-50/70" : "bg-secondary-50/50 hover:bg-secondary-50",
      ].join(" ")}
    >
      {/* col 0 — variant checkbox */}
      <td className="w-10 px-4 py-2">
        <div className="flex items-center justify-center">
          <Checkbox
            size="sm"
            aria-label={`Chọn biến thể ${v.sku}`}
            checked={isSelected}
            onChange={(e) => onCheck(v.id, e.target.checked)}
          />
        </div>
      </td>

      {/* col 1 — expand placeholder (variants don't expand further) */}
      <td className="w-8 px-2 py-2" />

      {/* col 2 — variant thumbnail */}
      <td className="w-14 px-4 py-2">
        {v.thumbnailUrl ? (
          <Image
            src={v.thumbnailUrl}
            alt={v.name}
            width={36}
            height={36}
            className="h-9 w-9 rounded-md object-cover border border-secondary-100"
          />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary-100">
            <CubeIcon className="w-4 h-4 text-secondary-400" aria-hidden="true" />
          </span>
        )}
      </td>

      {/* col 3 — variant name (link with tooltip) + SKU */}
      <td className="px-4 py-2">
        <Tooltip content={v.name} placement="top" anchorToContent>
          <Link
            href={`/products/${productId}/variants/${v.id}`}
            className="text-sm text-secondary-700 hover:text-primary-600 transition-colors truncate max-w-xs block"
          >
            {v.name}
          </Link>
        </Tooltip>
        <p className="text-xs text-secondary-400 font-mono mt-0.5">{v.sku}</p>
      </td>

      {/* col 4 — category (belongs to product, empty here) */}
      <td className="w-28 px-4 py-2" />

      {/* col 5 — variant price */}
      <td className="w-36 px-4 py-2 text-right">
        <span className="text-sm tabular-nums text-secondary-700">
          {formatVND(v.price)}
        </span>
      </td>

      {/* col 6 — variant stock */}
      <td className="w-20 px-4 py-2 text-center">
        <StockCell stock={v.stock} />
      </td>

      {/* col 7 — variant status */}
      <td className="w-28 px-4 py-2 text-center">
        <StatusBadge status={v.status} size="sm" />
      </td>

      {/* col 8 — variant updatedAt */}
      <td className="w-28 px-4 py-2 text-center">
        <span className="text-xs text-secondary-500 tabular-nums">
          {formatDate(v.updatedAt)}
        </span>
      </td>

      {/* col 9 — variant actions: Edit + Delete with tooltips (View removed) */}
      <td className="w-20 px-4 py-2">
        <RowActions>
          <Tooltip content="Sửa" placement="top">
            <span className="inline-flex">
              <RowActionEdit
                href={`/products/${productId}/variants/${v.id}/edit`}
                ariaLabel={`Chỉnh sửa biến thể ${v.sku}`}
              />
            </span>
          </Tooltip>
          <Tooltip content="Xoá" placement="top">
            <span className="inline-flex">
              <RowActionDelete
                ariaLabel={`Xoá biến thể ${v.sku}`}
                onClick={() => onDeleteClick({ id: v.id, name: v.name, sku: v.sku })}
              />
            </span>
          </Tooltip>
        </RowActions>
      </td>
    </tr>
  );
}
