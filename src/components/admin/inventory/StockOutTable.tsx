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
import { Tooltip } from "@/src/components/ui/Tooltip";
import type { StockOutSummary, StockOutReason } from "@/src/types/inventory.types";

const REASON_LABELS: Record<StockOutReason, string> = {
  internal_use: "Internal Use",
  damage:       "Damage / Write-off",
  loss:         "Loss",
  transfer:     "Transfer",
  promotional:  "Promotional / Sample",
  other:        "Other",
};

type Row = StockOutSummary & Record<string, unknown>;

function formatDate(s?: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("vi-VN", {
    year: "numeric", month: "2-digit", day: "2-digit",
  });
}

const STATUS_OPTIONS = [
  { value: "pending",   label: "Pending" },
  { value: "packing",   label: "Packing" },
  { value: "packed",    label: "Packed" },
  { value: "cancelled", label: "Cancelled" },
];

const COLUMNS: ColumnDef<Row>[] = [
  {
    key: "id",
    header: "ID",
    sortable: true,
    width: "w-[9%]",
    render: (_, row) => (
      <Link
        href={`/inventory/stock-out/${row.id as string}`}
        className="font-mono text-sm font-semibold text-primary-600 hover:underline"
      >
        {row.id as string}
      </Link>
    ),
  },
  {
    key: "reason",
    header: "lý do",
    render: (_, row) => {
      const label = REASON_LABELS[row.reason as StockOutReason] ?? (row.reason as string);
      return (
        <Tooltip content={label} placement="top">
          <span className="inline-block max-w-[200px] truncate text-sm text-secondary-700">
            {label}
          </span>
        </Tooltip>
      );
    },
  },
  {
    key: "status",
    header: "trạng thái",
    sortable: true,
    align: "center",
    render: (_, row) => <StatusBadge status={row.status as string} size="sm" />,
  },
  {
    key: "itemCount",
    header: "Số lượng",
    sortable: true,
    align: "center",
    render: (_, row) => (
      <span className="text-sm text-secondary-600">{row.itemCount as number}</span>
    ),
  },
  {
    key: "scheduledDate",
    header: "dự kiến",
    sortable: true,
    render: (_, row) => (
      <span className="whitespace-nowrap text-sm text-secondary-600">
        {formatDate(row.scheduledDate as string | undefined)}
      </span>
    ),
  },
  {
    key: "createdBy",
    header: "tao bởi",
    render: (_, row) => (
      <span className="text-sm text-secondary-500">{row.createdBy as string}</span>
    ),
  },
  {
    key: "_actions",
    header: "",
    render: (_, row) => (
      <RowActions>
        <RowActionView href={`/inventory/stock-out/${row.id as string}`} />
      </RowActions>
    ),
  },
];

export function StockOutTable({ initialRecords }: { initialRecords: StockOutSummary[] }) {
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
          (r.reason as string).toLowerCase().includes(lower)
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
      searchPlaceholder="Tìm kiếm theo ID hoặc lý do…"
      toolbarActions={toolbarActions}
      page={page}
      pageSize={pageSize}
      totalRows={totalRows}
      pageSizeOptions={[10, 25, 50]}
      onPageChange={setPage}
      onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
      emptyMessage="No stock-out records found."
    />
  );
}
