"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  DataTable,
  RowActions,
  RowActionView,
  type ColumnDef,
  type SortDir,
} from "@/src/components/admin/DataTable";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { FilterDropdown } from "@/src/components/admin/FilterDropdown";
import { formatVND } from "@/src/lib/format";
import type { StockInSummary } from "@/src/types/inventory.types";

type Row = StockInSummary & Record<string, unknown>;

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("vi-VN", {
    year: "numeric", month: "2-digit", day: "2-digit",
  });
}

const STATUS_OPTIONS = [
  { value: "pending",   label: "Pending" },
  { value: "received",  label: "Received" },
  { value: "partial",   label: "Partial" },
  { value: "cancelled", label: "Cancelled" },
];

const COLUMNS: ColumnDef<Row>[] = [
  {
    key: "id",
    header: "ID",
    sortable: true,
    render: (_, row) => (
      <Link
        href={`/inventory/stock-in/${row.id as string}`}
        className="font-mono text-sm font-semibold text-primary-600 hover:underline"
      >
        {row.id as string}
      </Link>
    ),
  },
  {
    key: "receiptCode",
    header: "Receipt Code",
    sortable: true,
    render: (_, row) => (
      <span className="font-mono text-xs text-secondary-600">{row.receiptCode as string}</span>
    ),
  },
  {
    key: "supplierName",
    header: "Supplier",
    sortable: true,
    render: (_, row) => (
      <span className="text-sm text-secondary-800">{row.supplierName as string}</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    render: (_, row) => <StatusBadge status={row.status as string} size="sm" />,
  },
  {
    key: "itemCount",
    header: "Items",
    render: (_, row) => (
      <span className="text-sm text-secondary-600">{row.itemCount as number}</span>
    ),
  },
  {
    key: "totalCost",
    header: "Total Cost",
    sortable: true,
    render: (_, row) => (
      <span className="text-sm font-semibold text-secondary-900">
        {formatVND(row.totalCost as number)}
      </span>
    ),
  },
  {
    key: "expectedDate",
    header: "Expected",
    sortable: true,
    render: (_, row) => (
      <span className="whitespace-nowrap text-sm text-secondary-600">
        {formatDate(row.expectedDate as string)}
      </span>
    ),
  },
  {
    key: "createdBy",
    header: "Created By",
    render: (_, row) => (
      <span className="text-sm text-secondary-500">{row.createdBy as string}</span>
    ),
  },
  {
    key: "_actions",
    header: "",
    render: (_, row) => (
      <RowActions>
        <RowActionView href={`/inventory/stock-in/${row.id as string}`} />
      </RowActions>
    ),
  },
];

export function StockInTable({ initialRecords }: { initialRecords: StockInSummary[] }) {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    let rows = [...initialRecords] as Row[];
    if (q.trim()) {
      const lower = q.toLowerCase();
      rows = rows.filter(
        (r) =>
          (r.id as string).toLowerCase().includes(lower) ||
          (r.supplierName as string).toLowerCase().includes(lower)
      );
    }
    if (statusFilter.length > 0) {
      rows = rows.filter((r) => statusFilter.includes(r.status as string));
    }
    rows.sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sortKey] as string | number;
      const bv = (b as unknown as Record<string, unknown>)[sortKey] as string | number;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [initialRecords, q, statusFilter, sortKey, sortDir]);

  const totalRows = filtered.length;
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toolbarActions = (
    <>
      <FilterDropdown
        label="Status"
        options={STATUS_OPTIONS}
        selected={statusFilter}
        onChange={(v) => { setStatusFilter(v); setPage(1); }}
      />
      <span className="text-sm text-secondary-400 whitespace-nowrap">
        {totalRows} record{totalRows !== 1 ? "s" : ""}
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
      searchPlaceholder="Search by ID or supplier…"
      toolbarActions={toolbarActions}
      page={page}
      pageSize={pageSize}
      totalRows={totalRows}
      pageSizeOptions={[10, 25, 50]}
      onPageChange={setPage}
      onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
      emptyMessage="No stock-in records found."
    />
  );
}
