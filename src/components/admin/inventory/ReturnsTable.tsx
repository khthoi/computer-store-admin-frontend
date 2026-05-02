"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { getReturns } from "@/src/services/returns.service";
import type { ReturnRequestSummary, ReturnRequestStatus } from "@/src/types/inventory.types";

type Row = ReturnRequestSummary & Record<string, unknown>;

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("vi-VN", {
    year: "numeric", month: "2-digit", day: "2-digit",
  });
}

const STATUS_OPTIONS = [
  { value: "ChoDuyet",  label: "Chờ duyệt" },
  { value: "DaDuyet",   label: "Đã duyệt" },
  { value: "TuChoi",    label: "Từ chối" },
  { value: "DangXuLy",  label: "Đang xử lý" },
  { value: "HoanThanh", label: "Hoàn thành" },
];

const RESOLUTION_OPTIONS = [
  { value: "GiaoHangMoi", label: "Giao hàng mới" },
  { value: "HoanTien",    label: "Hoàn tiền" },
  { value: "BaoHanh",     label: "Bảo hành" },
];

const TYPE_OPTIONS = [
  { value: "DoiHang", label: "Đổi hàng" },
  { value: "TraHang", label: "Trả hàng" },
  { value: "BaoHanh", label: "Bảo hành" },
];

const TYPE_STYLE: Record<string, { text: string; cls: string }> = {
  DoiHang: { text: "Đổi hàng", cls: "bg-blue-50 text-blue-700" },
  TraHang: { text: "Trả hàng", cls: "bg-amber-50 text-amber-700" },
  BaoHanh: { text: "Bảo hành", cls: "bg-purple-50 text-purple-700" },
};

function buildColumns(basePath: string): ColumnDef<Row>[] {
  return [
    {
      key: "orderId",
      header: "Đơn hàng",
      render: (_, row) => {
        const code = (row.orderCode as string | undefined) ?? (row.orderId as string);
        return (
          <Link
            href={`/orders/${code}`}
            className="font-mono text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline"
          >
            {code}
          </Link>
        );
      },
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
      key: "requestType",
      header: "Loại",
      width: "w-28",
      render: (_, row) => {
        const cfg = TYPE_STYLE[row.requestType as string] ?? {
          text: row.requestType as string,
          cls: "bg-secondary-100 text-secondary-600",
        };
        return (
          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${cfg.cls}`}>
            {cfg.text}
          </span>
        );
      },
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
        <span className="text-sm text-secondary-600">{row.reason as string}</span>
      ),
    },
    {
      key: "resolution",
      header: "Giải quyết",
      render: (_, row) => <StatusBadge status={row.resolution as string} size="sm" />,
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

const PAGE_SIZE = 20;

export function ReturnsTable({
  initialData,
  initialTotal,
  basePath = "/orders/returns",
}: {
  initialData: ReturnRequestSummary[];
  initialTotal: number;
  basePath?: string;
}) {
  const [rows, setRows]               = useState<ReturnRequestSummary[]>(initialData);
  const [total, setTotal]             = useState(initialTotal);
  const [loading, setLoading]         = useState(false);
  const [q, setQ]                     = useState("");
  const [statusFilter, setStatusFilter]     = useState<string[]>([]);
  const [resolutionFilter, setResolutionFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter]   = useState<string[]>([]);
  const [sortKey, setSortKey]         = useState("requestedAt");
  const [sortDir, setSortDir]         = useState<SortDir>("desc");
  const [page, setPage]               = useState(1);
  const [pageSize, setPageSize]       = useState(PAGE_SIZE);

  const isFirstRender = useRef(true);

  // Reset page when status filter or page size changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter, pageSize]);

  // Server-side fetch on page / pageSize / statusFilter changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setLoading(true);
    getReturns({
      page,
      limit: pageSize,
      status: (statusFilter[0] as ReturnRequestStatus) || undefined,
    })
      .then((result) => {
        setRows(result.items);
        setTotal(result.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, pageSize, statusFilter]);

  // Client-side secondary filtering (type, resolution, search) within fetched page
  const filtered = useMemo(() => {
    let list = [...rows] as Row[];
    if (q.trim()) {
      const lower = q.toLowerCase();
      list = list.filter(
        (r) =>
          ((r.orderCode as string | undefined) ?? "").toLowerCase().includes(lower) ||
          ((r.customerName as string) ?? "").toLowerCase().includes(lower)
      );
    }
    if (typeFilter.length > 0) {
      list = list.filter((r) => typeFilter.includes(r.requestType as string));
    }
    if (resolutionFilter.length > 0) {
      list = list.filter((r) => resolutionFilter.includes(r.resolution as string));
    }
    list.sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sortKey] as string | number;
      const bv = (b as unknown as Record<string, unknown>)[sortKey] as string | number;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [rows, q, typeFilter, resolutionFilter, sortKey, sortDir]);

  const hasClientFilter = q.trim() || typeFilter.length > 0 || resolutionFilter.length > 0;
  const displayTotal = hasClientFilter ? filtered.length : total;

  const toolbarActions = (
    <>
      <FilterDropdown
        label="Trạng thái"
        options={STATUS_OPTIONS}
        selected={statusFilter}
        onChange={(v) => setStatusFilter(v)}
      />
      <FilterDropdown
        label="Loại YC"
        options={TYPE_OPTIONS}
        selected={typeFilter}
        onChange={(v) => setTypeFilter(v)}
      />
      <FilterDropdown
        label="Hướng xử lý"
        options={RESOLUTION_OPTIONS}
        selected={resolutionFilter}
        onChange={(v) => setResolutionFilter(v)}
      />
      <span className="text-sm text-secondary-400 whitespace-nowrap">
        {displayTotal} yêu cầu
      </span>
    </>
  );

  const columns = buildColumns(basePath);

  return (
    <DataTable<Row>
      columns={columns}
      data={filtered}
      keyField="id"
      sortKey={sortKey}
      sortDir={sortDir}
      onSortChange={(key, dir) => { setSortKey(key); setSortDir(dir); }}
      searchQuery={q}
      onSearchChange={(val) => { setQ(val); }}
      searchPlaceholder="Tìm kiếm theo mã ĐH, mã hoàn trả, tên KH hoặc SĐT..."
      toolbarActions={toolbarActions}
      page={page}
      pageSize={pageSize}
      totalRows={displayTotal}
      pageSizeOptions={[10, 20, 50]}
      onPageChange={setPage}
      onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
      emptyMessage="Không tìm thấy yêu cầu đổi/trả nào."
      isLoading={loading}
    />
  );
}
