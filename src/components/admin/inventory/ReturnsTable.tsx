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
import type { ReturnRequestSummary } from "@/src/types/inventory.types";

type Row = ReturnRequestSummary & Record<string, unknown>;

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("vi-VN", {
    year: "numeric", month: "2-digit", day: "2-digit",
  });
}

const REASON_LABELS: Record<string, string> = {
  defective: "Defective",
  wrong_item: "Wrong Item",
  damaged_in_transit: "Damaged in Transit",
  not_as_described: "Not as Described",
  customer_changed_mind: "Changed Mind",
  other: "Other",
};

const STATUS_OPTIONS = [
  { value: "requested",  label: "Requested" },
  { value: "approved",   label: "Approved" },
  { value: "rejected",   label: "Rejected" },
  { value: "received",   label: "Received" },
  { value: "completed",  label: "Completed" },
];

const RESOLUTION_OPTIONS = [
  { value: "replacement", label: "Replacement" },
  { value: "refund",      label: "Refund" },
  { value: "store_credit", label: "Store Credit" },
];

function buildColumns(basePath: string): ColumnDef<Row>[] {
  return [
  {
    key: "id",
    header: "Return ID",
    sortable: true,
    render: (_, row) => (
      <Link
        href={`${basePath}/${row.id as string}`}
        className="font-mono text-sm font-semibold text-primary-600 hover:underline"
      >
        {row.id as string}
      </Link>
    ),
  },
  {
    key: "orderId",
    header: "Đơn hàng",
    render: (_, row) => (
      <Link
        href={`/orders/${row.orderId as string}`}
        className="font-mono text-xs text-secondary-600 hover:underline"
      >
        {row.orderId as string}
      </Link>
    ),
  },
  {
    key: "customerName",
    header: "Khách hàng",
    sortable: true,
    render: (_, row) => (
      <span className="text-sm text-secondary-800">{row.customerName as string}</span>
    ),
  },
  {
    key: "status",
    header: "Trạng thái",
    sortable: true,
    render: (_, row) => <StatusBadge status={row.status as string} size="sm" />,
  },
  {
    key: "reason",
    header: "Lý do",
    render: (_, row) => (
      <span className="text-sm text-secondary-600">
        {REASON_LABELS[row.reason as string] ?? (row.reason as string)}
      </span>
    ),
  },
  {
    key: "resolution",
    header: "Giải quyết",
    render: (_, row) => <StatusBadge status={row.resolution as string} size="sm" />,
  },
  {
    key: "refundAmount",
    header: "Hoàn tiền",
    sortable: true,
    render: (_, row) => (
      <span className="text-sm font-semibold text-secondary-900">
        {(row.refundAmount as number) > 0 ? formatVND(row.refundAmount as number) : "—"}
      </span>
    ),
  },
  {
    key: "requestedAt",
    header: "Yêu cầu lúc",
    sortable: true,
    render: (_, row) => (
      <span className="whitespace-nowrap text-sm text-secondary-500">
        {formatDate(row.requestedAt as string)}
      </span>
    ),
  },
  {
    key: "_actions",
    header: "",
    render: (_, row) => (
      <RowActions>
        <RowActionView href={`${basePath}/${row.id as string}`} />
      </RowActions>
    ),
  },
  ];
}

export function ReturnsTable({
  initialReturns,
  basePath = "/orders/returns",
}: {
  initialReturns: ReturnRequestSummary[];
  basePath?: string;
}) {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [resolutionFilter, setResolutionFilter] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState("requestedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    let rows = [...initialReturns] as Row[];
    if (q.trim()) {
      const lower = q.toLowerCase();
      rows = rows.filter(
        (r) =>
          (r.id as string).toLowerCase().includes(lower) ||
          (r.orderId as string).toLowerCase().includes(lower) ||
          (r.customerName as string).toLowerCase().includes(lower)
      );
    }
    if (statusFilter.length > 0) {
      rows = rows.filter((r) => statusFilter.includes(r.status as string));
    }
    if (resolutionFilter.length > 0) {
      rows = rows.filter((r) => resolutionFilter.includes(r.resolution as string));
    }
    rows.sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sortKey] as string | number;
      const bv = (b as unknown as Record<string, unknown>)[sortKey] as string | number;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [initialReturns, q, statusFilter, resolutionFilter, sortKey, sortDir]);

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
      <FilterDropdown
        label="Resolution"
        options={RESOLUTION_OPTIONS}
        selected={resolutionFilter}
        onChange={(v) => { setResolutionFilter(v); setPage(1); }}
      />
      <span className="text-sm text-secondary-400 whitespace-nowrap">
        {totalRows} return{totalRows !== 1 ? "s" : ""}
      </span>
    </>
  );

  const columns = buildColumns(basePath);

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
      searchPlaceholder="Tìm kiếm theo mã ĐH, mã hoàn trả, tên KH hoặc SĐT..."
      toolbarActions={toolbarActions}
      page={page}
      pageSize={pageSize}
      totalRows={totalRows}
      pageSizeOptions={[10, 25, 50]}
      onPageChange={setPage}
      onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
      emptyMessage="No return requests found."
    />
  );
}
