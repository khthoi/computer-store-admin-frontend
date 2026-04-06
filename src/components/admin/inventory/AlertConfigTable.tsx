"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  DataTable,
  type ColumnDef,
  type SortDir,
} from "@/src/components/admin/DataTable";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { FilterDropdown } from "@/src/components/admin/FilterDropdown";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { BellAlertIcon } from "@heroicons/react/24/outline";
import type { InventoryItem } from "@/src/types/inventory.types";

type Row = InventoryItem & Record<string, unknown>;

const ALERT_OPTIONS = [
  { value: "ok", label: "OK" },
  { value: "low_stock", label: "Low Stock" },
  { value: "out_of_stock_inv", label: "Out of Stock" },
];

interface AlertConfigTableProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
}

export function AlertConfigTable({ items, onEdit }: AlertConfigTableProps) {
  const [q, setQ] = useState("");
  const [alertFilter, setAlertFilter] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState("productName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const columns: ColumnDef<Row>[] = useMemo(
    () => [
      {
        key: "productName",
        header: "Product / Variant",
        sortable: true,
        render: (_, row) => (
          <div className="space-y-0.5">
            <div>
              <Tooltip content={row.productName as string} placement="top">
                <Link
                  href={`/products/${row.productId as string}`}
                  className="inline-block max-w-[200px] truncate text-sm font-semibold text-primary-600 hover:underline"
                >
                  {row.productName as string}
                </Link>
              </Tooltip>
            </div>
            <div>
              <Tooltip content={row.variantName as string} placement="top">
                <span className="inline-block max-w-[200px] truncate">
                  <Link
                    href={`/products/${row.productId as string}/variants/${row.variantId as string}`}
                    className="text-xs text-secondary-500 hover:text-primary-500 hover:underline"
                  >
                    {row.variantName as string}
                  </Link>
                </span>
              </Tooltip>
            </div>
            <p className="font-mono text-xs text-secondary-400">{row.sku as string}</p>
          </div>
        ),
      },
      {
        key: "alertLevel",
        header: "Alert Status",
        sortable: true,
        align: "center",
        render: (_, row) => <StatusBadge status={row.alertLevel as string} size="sm" />,
      },
      {
        key: "quantityOnHand",
        header: "On Hand",
        sortable: true,
        align: "center",
        render: (_, row) => (
          <span className="text-sm font-semibold text-secondary-900">
            {row.quantityOnHand as number}
          </span>
        ),
      },
      {
        key: "lowStockThreshold",
        header: "Alert Threshold",
        sortable: true,
        align: "center",
        render: (_, row) => {
          const threshold = row.lowStockThreshold as number;
          return (
            <div className="flex items-center justify-center gap-1.5">
              <BellAlertIcon
                className={[
                  "w-3.5 h-3.5 shrink-0",
                  threshold === 0 ? "text-secondary-300" : "text-warning-500",
                ].join(" ")}
              />
              <span className="text-sm text-secondary-700">
                {threshold === 0 ? (
                  <span className="text-secondary-400 italic">Disabled</span>
                ) : (
                  threshold
                )}
              </span>
            </div>
          );
        },
      },
      {
        key: "quantityAvailable",
        header: "Available",
        align: "center",
        render: (_, row) => (
          <span className="text-sm text-secondary-600">{row.quantityAvailable as number}</span>
        ),
      },
      {
        key: "_actions",
        header: "",
        align: "right",
        render: (_, row) => (
          <button
            type="button"
            onClick={() => onEdit(row as unknown as InventoryItem)}
            className="rounded-lg border border-secondary-200 px-3 py-1.5 text-xs font-medium text-secondary-700 hover:bg-secondary-50 transition-colors whitespace-nowrap"
          >
            Edit Threshold
          </button>
        ),
      },
    ],
    [onEdit]
  );

  const filtered = useMemo(() => {
    let rows = [...items] as Row[];
    if (q.trim()) {
      const lower = q.toLowerCase();
      rows = rows.filter(
        (r) =>
          (r.productName as string).toLowerCase().includes(lower) ||
          (r.variantName as string).toLowerCase().includes(lower) ||
          (r.sku as string).toLowerCase().includes(lower)
      );
    }
    if (alertFilter.length > 0) {
      rows = rows.filter((r) => alertFilter.includes(r.alertLevel as string));
    }
    rows.sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortKey] as string | number;
      const bv = (b as Record<string, unknown>)[sortKey] as string | number;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [items, q, alertFilter, sortKey, sortDir]);

  const totalRows = filtered.length;
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toolbarActions = (
    <>
      <FilterDropdown
        label="Alert Status"
        options={ALERT_OPTIONS}
        selected={alertFilter}
        onChange={(v) => { setAlertFilter(v); setPage(1); }}
      />
      <span className="text-sm text-secondary-400 whitespace-nowrap">
        {totalRows} SKU{totalRows !== 1 ? "s" : ""}
      </span>
    </>
  );

  return (
    <DataTable<Row>
      columns={columns}
      data={pageRows}
      keyField="id"
      sortKey={sortKey}
      sortDir={sortDir}
      onSortChange={(key, dir) => { setSortKey(key); setSortDir(dir); }}
      searchQuery={q}
      onSearchChange={(val) => { setQ(val); setPage(1); }}
      searchPlaceholder="Search by product, variant or SKU…"
      toolbarActions={toolbarActions}
      page={page}
      pageSize={pageSize}
      totalRows={totalRows}
      pageSizeOptions={[10, 25, 50]}
      onPageChange={setPage}
      onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
      emptyMessage="No inventory items found."
    />
  );
}
