"use client";

import Image from "next/image";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { StatusBadge } from "@/src/components/admin/StatusBadge";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InventoryItem {
  id: string;
  productId: string;
  name: string;
  sku: string;
  category: string;
  thumbnail?: string;
  warehouseLocation?: string;
  currentStock: number;
  reservedStock: number;
  reorderThreshold: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
}

export interface InventoryStockTableProps {
  items: InventoryItem[];
  isLoading?: boolean;
  onStockAdjust: (item: InventoryItem) => void;
  onThresholdChange: (sku: string, newThreshold: number) => void;
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Map inventory status to AdminStatus for the shared StatusBadge.
 * StatusBadge supports: active | inactive | pending | suspended | draft |
 * published | archived | approved | rejected | review | online | offline.
 * We map:
 *   in_stock      → active
 *   low_stock     → pending
 *   out_of_stock  → suspended
 */
function toAdminStatus(
  status: InventoryItem["status"]
): "active" | "pending" | "suspended" {
  if (status === "in_stock")     return "active";
  if (status === "low_stock")    return "pending";
  return "suspended"; // out_of_stock
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-t border-secondary-100">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded shrink-0 animate-pulse bg-secondary-200" />
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <Skeleton className="h-3.5 w-36 rounded animate-pulse bg-secondary-200" />
            <Skeleton className="h-3 w-24 rounded animate-pulse bg-secondary-200" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-3.5 w-20 rounded animate-pulse bg-secondary-200" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-3.5 w-24 rounded animate-pulse bg-secondary-200" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-3.5 w-28 rounded animate-pulse bg-secondary-200" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-10 rounded animate-pulse bg-secondary-200" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-3.5 w-10 rounded animate-pulse bg-secondary-200" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-7 w-16 rounded animate-pulse bg-secondary-200" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-5 w-20 rounded-full animate-pulse bg-secondary-200" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-7 w-7 rounded animate-pulse bg-secondary-200" />
      </td>
    </tr>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * InventoryStockTable — custom table (not DataTable) with inline threshold editing.
 *
 * The reorder threshold cell uses a raw `<input type="number">` so edits
 * can be made in place without opening a modal. `onThresholdChange` fires on blur.
 */
export function InventoryStockTable({
  items,
  isLoading = false,
  onStockAdjust,
  onThresholdChange,
  className = "",
}: InventoryStockTableProps) {
  return (
    <div
      className={[
        "bg-white rounded-2xl border border-secondary-100 shadow-sm overflow-hidden",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-secondary-100 bg-secondary-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wide whitespace-nowrap">
                Sản phẩm
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wide whitespace-nowrap">
                SKU
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wide whitespace-nowrap">
                Danh mục
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wide whitespace-nowrap">
                Vị trí kho
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-secondary-500 uppercase tracking-wide whitespace-nowrap">
                Tồn kho
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-secondary-500 uppercase tracking-wide whitespace-nowrap">
                Đặt trước
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-secondary-500 uppercase tracking-wide whitespace-nowrap">
                Ngưỡng cảnh báo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wide whitespace-nowrap">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-secondary-500 uppercase tracking-wide whitespace-nowrap">
                Hành động
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-secondary-50">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-12 text-center text-sm text-secondary-400"
                >
                  Không có sản phẩm nào trong kho
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-secondary-50 transition-colors"
                >
                  {/* Product: thumbnail + name + SKU */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="shrink-0 h-8 w-8 rounded overflow-hidden border border-secondary-100 bg-secondary-50">
                        {item.thumbnail ? (
                          <Image
                            src={item.thumbnail}
                            alt={item.name}
                            width={32}
                            height={32}
                            className="object-cover h-full w-full"
                          />
                        ) : (
                          <div className="h-full w-full bg-secondary-200" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-secondary-900 truncate max-w-xs">
                          {item.name}
                        </p>
                        <p className="font-mono text-xs text-secondary-400 mt-0.5">
                          {item.sku}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* SKU */}
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-secondary-600">
                      {item.sku}
                    </span>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3">
                    <span className="text-sm text-secondary-500">
                      {item.category}
                    </span>
                  </td>

                  {/* Warehouse location */}
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono text-secondary-400">
                      {item.warehouseLocation || "—"}
                    </span>
                  </td>

                  {/* Current stock */}
                  <td className="px-4 py-3 text-right">
                    <span
                      className={[
                        "text-sm font-bold",
                        item.status === "out_of_stock"
                          ? "text-error-600"
                          : item.status === "low_stock"
                          ? "text-warning-600"
                          : "text-secondary-900",
                      ].join(" ")}
                    >
                      {item.currentStock}
                    </span>
                  </td>

                  {/* Reserved stock */}
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-secondary-500">
                      {item.reservedStock}
                    </span>
                  </td>

                  {/* Reorder threshold — inline editable */}
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      defaultValue={item.reorderThreshold}
                      min={0}
                      onBlur={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val >= 0) {
                          onThresholdChange(item.sku, val);
                        }
                      }}
                      className="w-16 rounded border border-secondary-200 px-1.5 py-0.5 text-sm text-center focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-500/15"
                    />
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <StatusBadge status={toAdminStatus(item.status)} size="sm" />
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      title="Điều chỉnh tồn kho"
                      onClick={() => onStockAdjust(item)}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-secondary-400 hover:bg-primary-50 hover:text-primary-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    >
                      <AdjustmentsHorizontalIcon className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">Điều chỉnh tồn kho</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
