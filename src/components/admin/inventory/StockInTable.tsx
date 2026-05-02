"use client";

import { useEffect, useRef, useState } from "react";
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
import { Tooltip } from "@/src/components/ui/Tooltip";
import { getStockInList } from "@/src/services/inventory.service";

const PAGE_SIZE = 10;

type Row = StockInSummary & Record<string, unknown>;

function formatDate(s: string | undefined) {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN", {
    year: "numeric", month: "2-digit", day: "2-digit",
  });
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Chờ duyệt" },
  { value: "received", label: "Đã nhận" },
  { value: "partial", label: "Nhận một phần" },
  { value: "cancelled", label: "Đã huỷ" },
];

const COLUMNS: ColumnDef<Row>[] = [
  {
    key: "receiptCode",
    header: "Mã phiếu",
    sortable: true,
    width: "w-[14%]",
    render: (_, row) => {
      const code = row.receiptCode as string;
      if (!code) return <span className="text-secondary-300">—</span>;
      return (
        <Tooltip content={code} placement="top" anchorToContent>
          <Link
            href={`/inventory/stock-in/${row.id as string}`}
            className="block max-w-[140px] truncate font-mono text-sm font-semibold text-primary-600 hover:underline"
          >
            {code}
          </Link>
        </Tooltip>
      );
    },
  },
  {
    key: "supplierName",
    header: "Nhà cung cấp",
    sortable: true,
    width: "w-[17%]",
    render: (_, row) => {
      const name = (row.supplierName as string) || "—";
      return (
        <Tooltip content={name} placement="top" anchorToContent>
          <span className="block max-w-[220px] truncate text-sm text-secondary-800">{name}</span>
        </Tooltip>
      );
    },
  },
  {
    key: "status",
    header: "Trạng thái",
    sortable: true,
    align: "center",
    render: (_, row) => <StatusBadge status={row.status as string} size="sm" />,
  },
  {
    key: "itemCount",
    header: "Sản phẩm",
    sortable: true,
    align: "center",
    render: (_, row) => (
      <span className="text-sm text-secondary-600">{row.itemCount as number}</span>
    ),
  },
  {
    key: "totalCost",
    header: "Tổng chi phí",
    sortable: true,
    render: (_, row) => (
      <span className="text-sm font-semibold text-secondary-900">
        {formatVND(row.totalCost as number)}
      </span>
    ),
  },
  {
    key: "expectedDate",
    header: "Dự kiến nhận",
    sortable: true,
    align: "center",
    render: (_, row) => (
      <span className="whitespace-nowrap text-sm text-secondary-600">
        {formatDate(row.expectedDate as string)}
      </span>
    ),
  },
  {
    key: "createdBy",
    header: "Người tạo",
    render: (_, row) => {
      const name = row.createdBy as string;
      const createdByCode = row.createdByCode as string | undefined;
      if (!name) return <span className="text-secondary-300">—</span>;
      if (!createdByCode) return <span className="text-sm text-secondary-500">{name}</span>;
      return (
        <Tooltip content={name} placement="top" anchorToContent>
          <Link
            href={`/employees/${createdByCode}`}
            className="block max-w-[120px] truncate text-sm text-primary-600 hover:underline"
          >
            {name}
          </Link>
        </Tooltip>
      );
    },
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

interface Props {
  initialData: StockInSummary[];
  initialTotal: number;
}

export function StockInTable({ initialData, initialTotal }: Props) {
  const [data, setData] = useState<StockInSummary[]>(initialData);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  const prevNonPageKey = useRef(
    JSON.stringify({ q: "", statusFilter: [], sortKey: "createdAt", sortDir: "desc", pageSize: PAGE_SIZE })
  );
  const prevSearchRef = useRef("");
  const fetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  // Reset page on filter/sort/pageSize change
  useEffect(() => {
    setPage(1);
  }, [q, statusFilter, sortKey, sortDir, pageSize]);

  // Main fetch
  useEffect(() => {
    const nonPageKey = JSON.stringify({ q, statusFilter, sortKey, sortDir, pageSize });
    const isFirst = isFirstRender.current;
    isFirstRender.current = false;

    const isPageOnly = !isFirst && nonPageKey === prevNonPageKey.current;
    prevNonPageKey.current = nonPageKey;

    const isSearchChange = !isFirst && q !== prevSearchRef.current;
    prevSearchRef.current = q;

    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    fetchTimerRef.current = setTimeout(async () => {
      if (!isPageOnly && !isFirst) setLoading(true);
      try {
        const result = await getStockInList({
          page,
          limit: pageSize,
          search: q.trim() || undefined,
          status: statusFilter[0] || undefined,
          sortBy: sortKey,
          sortOrder: sortDir.toUpperCase() as "ASC" | "DESC",
        });
        setData(result.data);
        setTotal(result.total);
      } catch { /* giữ nguyên data cũ */ }
      finally { setLoading(false); }
    }, isSearchChange ? 300 : 0);

    return () => { if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, q, statusFilter, sortKey, sortDir]);

  const toolbarActions = (
    <>
      <FilterDropdown
        label="Trạng thái"
        options={STATUS_OPTIONS}
        selected={statusFilter}
        onChange={(v) => setStatusFilter(v)}
      />
      <span className="text-sm text-secondary-400 whitespace-nowrap">
        {total} phiếu
      </span>
    </>
  );

  return (
    <DataTable<Row>
      columns={COLUMNS}
      data={data as Row[]}
      keyField="id"
      sortKey={sortKey}
      sortDir={sortDir}
      onSortChange={(key, dir) => { setSortKey(key); setSortDir(dir); }}
      searchQuery={q}
      onSearchChange={(val) => setQ(val)}
      searchPlaceholder="Tìm theo mã phiếu hoặc NCC hoặc người tạo phiếu..."
      toolbarActions={toolbarActions}
      page={page}
      pageSize={pageSize}
      totalRows={total}
      pageSizeOptions={[10, 25, 50]}
      onPageChange={setPage}
      onPageSizeChange={(size) => setPageSize(size)}
      isLoading={loading}
      emptyMessage="Không tìm thấy phiếu nhập nào."
    />
  );
}
