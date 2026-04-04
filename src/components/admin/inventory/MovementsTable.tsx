"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  DataTable,
  type ColumnDef,
  type SortDir,
} from "@/src/components/admin/DataTable";
import { FilterDropdown } from "@/src/components/admin/FilterDropdown";
import { Tooltip } from "@/src/components/ui/Tooltip";
import type { StockMovement } from "@/src/types/inventory.types";

type Row = StockMovement & Record<string, unknown>;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const TYPE_LABELS: Record<string, string> = {
  stock_in:   "Stock In",
  stock_out:  "Stock Out",
  adjustment: "Adjustment",
  return:     "Return",
  transfer:   "Transfer",
};

const TYPE_COLORS: Record<string, string> = {
  stock_in:   "text-success-700 bg-success-50 border-success-200",
  stock_out:  "text-error-700 bg-error-50 border-error-200",
  adjustment: "text-warning-700 bg-warning-50 border-warning-200",
  return:     "text-info-700 bg-info-50 border-info-200",
  transfer:   "text-secondary-600 bg-secondary-100 border-secondary-200",
};

const TYPE_OPTIONS = [
  { value: "stock_in",   label: "Stock In" },
  { value: "stock_out",  label: "Stock Out" },
  { value: "adjustment", label: "Adjustment" },
  { value: "return",     label: "Return" },
  { value: "transfer",   label: "Transfer" },
];

const COLUMNS: ColumnDef<Row>[] = [
  {
    key: "performedAt",
    header: "Date / Time",
    sortable: true,
    render: (_, row) => (
      <span className="whitespace-nowrap text-sm text-secondary-600">
        {formatDate(row.performedAt as string)}
      </span>
    ),
  },
  {
    key: "type",
    header: "Type",
    sortable: true,
    render: (_, row) => (
      <span
        className={[
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
          TYPE_COLORS[row.type as string] ?? "text-secondary-600 bg-secondary-100 border-secondary-200",
        ].join(" ")}
      >
        {TYPE_LABELS[row.type as string] ?? (row.type as string)}
      </span>
    ),
  },
  {
    key: "sku",
    header: "Product / SKU",
    render: (_, row) => (
      <div className="min-w-0">
        <div>
          <Tooltip content={row.productName as string} placement="top">
            <Link
              href={`/products/${row.productId as string}`}
              className="inline-block max-w-[180px] truncate text-sm font-medium text-primary-600 hover:underline"
            >
              {row.productName as string}
            </Link>
          </Tooltip>
        </div>
        <div>
          <Tooltip content={row.variantName as string} placement="top">
            <span className="inline-block max-w-[180px] truncate">
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
    key: "quantityChange",
    header: "quantity",
    align: "center",
    sortable: true,
    render: (_, row) => {
      const delta = row.quantityChange as number;
      return (
        <span
          className={[
            "text-sm font-bold tabular-nums",
            delta > 0 ? "text-success-700" : delta < 0 ? "text-error-700" : "text-secondary-500",
          ].join(" ")}
        >
          {delta > 0 ? "+" : ""}{delta}
        </span>
      );
    },
  },
  {
    key: "quantityBefore",
    header: "Before",
    align: "center",
    render: (_, row) => (
      <span className="text-sm tabular-nums text-secondary-500">{row.quantityBefore as number}</span>
    ),
  },
  {
    key: "quantityAfter",
    header: "After",
    align: "center",
    render: (_, row) => (
      <span className="text-sm tabular-nums font-semibold text-secondary-900">{row.quantityAfter as number}</span>
    ),
  },
  {
    key: "performedBy",
    header: "By",
    render: (_, row) => (
      <span className="text-sm text-secondary-600">{row.performedBy as string}</span>
    ),
  },
  {
    key: "note",
    header: "Note",
    render: (_, row) => {
      const note = (row.note as string | undefined) ?? "";
      return note ? (
        <Tooltip content={note} placement="top">
          <span className="inline-block max-w-[200px] truncate text-xs text-secondary-500">
            {note}
          </span>
        </Tooltip>
      ) : (
        <span className="text-xs text-secondary-400">—</span>
      );
    },
  },
];

export function MovementsTable({ initialMovements }: { initialMovements: StockMovement[] }) {
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState("performedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const filtered = useMemo(() => {
    let rows = [...initialMovements] as Row[];
    if (q.trim()) {
      const lower = q.toLowerCase();
      rows = rows.filter(
        (r) =>
          (r.sku as string).toLowerCase().includes(lower) ||
          (r.productName as string).toLowerCase().includes(lower)
      );
    }
    if (typeFilter.length > 0) {
      rows = rows.filter((r) => typeFilter.includes(r.type as string));
    }
    rows.sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sortKey] as string | number;
      const bv = (b as unknown as Record<string, unknown>)[sortKey] as string | number;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [initialMovements, q, typeFilter, sortKey, sortDir]);

  const totalRows = filtered.length;
  const start = (page - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);

  const toolbarActions = (
    <>
      <FilterDropdown
        label="Type"
        options={TYPE_OPTIONS}
        selected={typeFilter}
        onChange={(v) => { setTypeFilter(v); setPage(1); }}
      />
      <span className="text-sm text-secondary-400 whitespace-nowrap">
        {totalRows} movement{totalRows !== 1 ? "s" : ""}
      </span>
    </>
  );

  return (
    <DataTable<Row>
      columns={COLUMNS}
      data={pageRows}
      keyField="id"
      sortKey={sortKey}
      sortDir={sortDir}
      onSortChange={(key, dir) => { setSortKey(key); setSortDir(dir); }}
      searchQuery={q}
      onSearchChange={(val) => { setQ(val); setPage(1); }}
      searchPlaceholder="Search by product or SKU…"
      toolbarActions={toolbarActions}
      page={page}
      pageSize={pageSize}
      totalRows={totalRows}
      pageSizeOptions={[25, 50, 100]}
      onPageChange={setPage}
      onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
      emptyMessage="No movements found."
    />
  );
}
