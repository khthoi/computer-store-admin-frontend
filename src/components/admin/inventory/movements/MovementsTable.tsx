"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  DataTable,
  type ColumnDef,
  type SortDir,
} from "@/src/components/admin/DataTable";
import { FilterDropdown } from "@/src/components/admin/FilterDropdown";
import { DateInput } from "@/src/components/ui/DateInput";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { getStockMovementsPaginated } from "@/src/services/inventory.service";
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
  stock_in:   "Nhập kho",
  stock_out:  "Xuất kho",
  adjustment: "Điều chỉnh",
  return:     "Hoàn trả",
};

const TYPE_COLORS: Record<string, string> = {
  stock_in:   "text-success-700 bg-success-50 border-success-200",
  stock_out:  "text-error-700 bg-error-50 border-error-200",
  adjustment: "text-warning-700 bg-warning-50 border-warning-200",
  return:     "text-info-700 bg-info-50 border-info-200",
};

const TYPE_OPTIONS = [
  { value: "stock_in",   label: "Nhập kho" },
  { value: "stock_out",  label: "Xuất kho" },
  { value: "adjustment", label: "Điều chỉnh" },
  { value: "return",     label: "Hoàn trả" },
];

// Quick date preset helpers
function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const DATE_PRESETS = [
  {
    label: "Hôm nay",
    getRange: () => { const t = isoDate(new Date()); return { from: t, to: t }; },
  },
  {
    label: "7 ngày",
    getRange: () => {
      const to = new Date();
      const from = new Date(to);
      from.setDate(from.getDate() - 6);
      return { from: isoDate(from), to: isoDate(to) };
    },
  },
  {
    label: "30 ngày",
    getRange: () => {
      const to = new Date();
      const from = new Date(to);
      from.setDate(from.getDate() - 29);
      return { from: isoDate(from), to: isoDate(to) };
    },
  },
  {
    label: "Tháng này",
    getRange: () => {
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: isoDate(from), to: isoDate(now) };
    },
  },
];

function referenceLink(row: Row): React.ReactNode {
  const refType = row.referenceType as string | undefined;
  const refId = row.referenceId as string | undefined;
  if (!refType || !refId) return <span className="text-xs text-secondary-400">—</span>;

  const hrefMap: Record<string, string> = {
    stock_in:  `/inventory/stock-in/${refId}`,
    stock_out: `/inventory/exports/${refId}`,
    order:     `/orders/${refId}`,
    return:    `/orders/returns/${refId}`,
  };
  const labelMap: Record<string, string> = {
    stock_in: "Phiếu nhập",
    stock_out: "Phiếu xuất",
    order:    "Đơn hàng",
    return:   "Hoàn trả",
    manual:   "Thủ công",
  };
  const href = hrefMap[refType];
  const label = labelMap[refType] ?? refType;
  if (!href) return <span className="text-xs text-secondary-500">{label}</span>;
  return (
    <Link href={href} className="font-mono text-xs text-primary-600 hover:underline">
      {label} #{refId.slice(-6).toUpperCase()}
    </Link>
  );
}

const COLUMNS: ColumnDef<Row>[] = [
  {
    key: "performedAt",
    header: "Thời gian",
    sortable: true,
    render: (_, row) => (
      <span className="whitespace-nowrap text-sm text-secondary-600">
        {formatDate(row.performedAt as string)}
      </span>
    ),
  },
  {
    key: "type",
    header: "Loại",
    sortable: true,
    render: (_, row) => (
      <span
        className={[
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
          TYPE_COLORS[row.type as string] ?? "border-secondary-200 bg-secondary-100 text-secondary-600",
        ].join(" ")}
      >
        {TYPE_LABELS[row.type as string] ?? (row.type as string)}
      </span>
    ),
  },
  {
    key: "sku",
    header: "Sản phẩm / SKU",
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
    header: "Thay đổi",
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
    header: "Trước",
    align: "center",
    render: (_, row) => (
      <span className="tabular-nums text-sm text-secondary-500">
        {row.quantityBefore as number}
      </span>
    ),
  },
  {
    key: "quantityAfter",
    header: "Sau",
    align: "center",
    render: (_, row) => (
      <span className="tabular-nums text-sm font-semibold text-secondary-900">
        {row.quantityAfter as number}
      </span>
    ),
  },
  {
    key: "referenceId",
    header: "Nguồn",
    render: (_, row) => referenceLink(row),
  },
  {
    key: "performedBy",
    header: "Người thực hiện",
    render: (_, row) => {
      const name = row.performedBy as string;
      const code = row.performedByCode as string | undefined;
      if (code) {
        return (
          <Link
            href={`/employees/${code}`}
            className="text-sm text-primary-600 hover:underline"
          >
            {name}
          </Link>
        );
      }
      return <span className="text-sm text-secondary-600">{name}</span>;
    },
  },
  {
    key: "note",
    header: "Ghi chú",
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

const PAGE_SIZE = 25;

export function MovementsTable() {
  const [data, setData]           = useState<StockMovement[]>([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);
  const [pageSize, setPageSize]   = useState(PAGE_SIZE);
  const [sortKey, setSortKey]     = useState("performedAt");
  const [sortDir, setSortDir]     = useState<SortDir>("desc");
  const [q, setQ]                 = useState("");
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [dateFrom, setDateFrom]   = useState("");
  const [dateTo, setDateTo]       = useState("");

  const isFirstRender  = useRef(true);
  const prevNonPageKey = useRef(
    JSON.stringify({ q: "", typeFilter: [], dateFrom: "", dateTo: "", sortKey: "performedAt", sortDir: "desc", pageSize: PAGE_SIZE })
  );
  const fetchTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevSearchRef  = useRef("");

  async function fetchData(currentPage: number, showLoading: boolean) {
    if (showLoading) setLoading(true);
    try {
      const result = await getStockMovementsPaginated({
        page: currentPage,
        limit: pageSize,
        types: typeFilter.length > 0 ? typeFilter : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        q: q || undefined,
        sortBy: sortKey,
        sortDir,
      });
      setData(result.data);
      setTotal(result.total);
    } catch {
      // keep existing data
    } finally {
      setLoading(false);
    }
  }

  // Initial load
  useEffect(() => {
    fetchData(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset page when filters change
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    setPage(1);
  }, [q, typeFilter, dateFrom, dateTo, sortKey, sortDir, pageSize]);

  // Fetch on any state change
  useEffect(() => {
    if (isFirstRender.current) return;
    const nonPageKey = JSON.stringify({ q, typeFilter, dateFrom, dateTo, sortKey, sortDir, pageSize });
    const isPageOnly = nonPageKey === prevNonPageKey.current;
    prevNonPageKey.current = nonPageKey;

    const isSearchChange = q !== prevSearchRef.current;
    prevSearchRef.current = q;

    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    fetchTimerRef.current = setTimeout(() => {
      fetchData(page, !isPageOnly);
    }, isSearchChange ? 300 : 0);

    return () => { if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, q, typeFilter, dateFrom, dateTo, sortKey, sortDir]);

  function applyPreset(from: string, to: string) {
    setDateFrom(from);
    setDateTo(to);
    setPage(1);
  }

  function clearDates() {
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }

  const hasDateFilter = dateFrom || dateTo;

  const toolbarActions = (
    <>
      <FilterDropdown
        label="Loại giao dịch"
        options={TYPE_OPTIONS}
        selected={typeFilter}
        onChange={(v) => { setTypeFilter(v); setPage(1); }}
      />

      {/* Quick presets */}
      <div className="flex items-center gap-1">
        {DATE_PRESETS.map((p) => {
          const range = p.getRange();
          const active = dateFrom === range.from && dateTo === range.to;
          return (
            <button
              key={p.label}
              onClick={() => active ? clearDates() : applyPreset(range.from, range.to)}
              className={[
                "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                active
                  ? "border-primary-400 bg-primary-50 text-primary-700"
                  : "border-secondary-200 bg-white text-secondary-600 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700",
              ].join(" ")}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Date range pickers */}
      <div className="flex items-center gap-2">
        <div className="w-36">
          <DateInput
            size="sm"
            placeholder="Từ ngày"
            value={dateFrom}
            onChange={(v) => { setDateFrom(v); setPage(1); }}
          />
        </div>
        <span className="text-sm text-secondary-400">—</span>
        <div className="w-36">
          <DateInput
            size="sm"
            placeholder="Đến ngày"
            value={dateTo}
            onChange={(v) => { setDateTo(v); setPage(1); }}
          />
        </div>
        {hasDateFilter && (
          <button
            onClick={clearDates}
            className="text-xs text-secondary-400 hover:text-secondary-700"
          >
            Xóa
          </button>
        )}
      </div>
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
      onSearchChange={(val) => { setQ(val); setPage(1); }}
      searchPlaceholder="Tìm theo tên sản phẩm hoặc SKU..."
      toolbarActions={toolbarActions}
      page={page}
      pageSize={pageSize}
      totalRows={total}
      pageSizeOptions={[25, 50, 100]}
      onPageChange={setPage}
      onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
      isLoading={loading}
      emptyMessage="Không có giao dịch nào."
    />
  );
}
