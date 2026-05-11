"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductPerformanceRow {
  productId: string;
  name: string;
  sku: string;
  thumbnail?: string;
  category: string;
  unitsSold: number;
  revenue: number;
  returnRate: number;
  currentStock: number;
}

interface ProductPerformanceTableProps {
  products: ProductPerformanceRow[];
  isLoading?: boolean;
  className?: string;
}

type SortKey = keyof Omit<ProductPerformanceRow, "productId" | "thumbnail">;
type SortDir = "asc" | "desc";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatVND(n: number): string {
  return n.toLocaleString("vi-VN") + "₫";
}

function returnRateColor(rate: number): string {
  if (rate < 5) return "text-success-600";
  if (rate <= 15) return "text-warning-600";
  return "text-error-600";
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-secondary-100 last:border-0">
      {[120, 80, 60, 100, 70, 70].map((w, i) => (
        <td key={i} className="px-4 py-3">
          <div
            className="h-4 rounded bg-secondary-200 animate-pulse"
            style={{ width: w }}
          />
        </td>
      ))}
    </tr>
  );
}

// ─── Column definitions ───────────────────────────────────────────────────────

interface Column {
  key: SortKey | null;
  label: string;
  align?: "left" | "right";
}

const COLUMNS: Column[] = [
  { key: "name", label: "Sản phẩm", align: "left" },
  { key: "category", label: "Danh mục", align: "left" },
  { key: "unitsSold", label: "Đã bán", align: "right" },
  { key: "revenue", label: "Doanh thu", align: "right" },
  { key: "returnRate", label: "Tỷ lệ trả", align: "right" },
  { key: "currentStock", label: "Tồn kho", align: "right" },
];

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ProductPerformanceTable — sortable table of product performance metrics.
 */
export function ProductPerformanceTable({
  products,
  isLoading = false,
  className = "",
}: ProductPerformanceTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("revenue");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(key: SortKey | null) {
    if (!key) return;
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sorted = isLoading
    ? []
    : [...products].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortDir === "asc"
            ? aVal.localeCompare(bVal, "vi")
            : bVal.localeCompare(aVal, "vi");
        }
        const aNum = aVal as number;
        const bNum = bVal as number;
        return sortDir === "asc" ? aNum - bNum : bNum - aNum;
      });

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
          {/* Header */}
          <thead>
            <tr className="bg-secondary-50 border-b border-secondary-100">
              {COLUMNS.map((col) => (
                <th
                  key={col.label}
                  className={[
                    "px-4 py-3 font-semibold text-secondary-600 whitespace-nowrap",
                    col.align === "right" ? "text-right" : "text-left",
                    col.key ? "cursor-pointer select-none hover:text-secondary-900" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.key && sortKey === col.key && (
                      sortDir === "asc" ? (
                        <ChevronUpIcon className="w-3.5 h-3.5 text-primary-600" aria-hidden="true" />
                      ) : (
                        <ChevronDownIcon className="w-3.5 h-3.5 text-primary-600" aria-hidden="true" />
                      )
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))
              : sorted.map((row) => (
                  <tr
                    key={row.productId}
                    className="border-b border-secondary-100 last:border-0 hover:bg-secondary-50 transition-colors"
                  >
                    {/* Product */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* Thumbnail */}
                        {row.thumbnail ? (
                          <img
                            src={row.thumbnail}
                            alt={row.name}
                            className="w-9 h-9 rounded-lg object-cover shrink-0 border border-secondary-100"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-secondary-100 shrink-0 flex items-center justify-center text-secondary-400 text-xs font-bold">
                            {row.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link
                            href={`/admin/products/${row.productId}`}
                            className="font-medium text-secondary-900 hover:text-primary-600 hover:underline transition-colors truncate block max-w-[200px]"
                          >
                            {row.name}
                          </Link>
                          <p className="text-xs text-secondary-400 font-mono truncate max-w-[200px]">
                            {row.sku}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 text-secondary-600">
                      {row.category}
                    </td>

                    {/* Units sold */}
                    <td className="px-4 py-3 text-right text-secondary-800 font-medium tabular-nums">
                      {row.unitsSold.toLocaleString("vi-VN")}
                    </td>

                    {/* Revenue */}
                    <td className="px-4 py-3 text-right font-semibold text-secondary-900 tabular-nums">
                      {formatVND(row.revenue)}
                    </td>

                    {/* Return rate */}
                    <td
                      className={[
                        "px-4 py-3 text-right font-medium tabular-nums",
                        returnRateColor(row.returnRate),
                      ].join(" ")}
                    >
                      {row.returnRate.toFixed(1)}%
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3 text-right text-secondary-700 tabular-nums">
                      {row.currentStock.toLocaleString("vi-VN")}
                    </td>
                  </tr>
                ))}

            {/* Empty state */}
            {!isLoading && sorted.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-sm text-secondary-400"
                >
                  Không có dữ liệu sản phẩm
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
