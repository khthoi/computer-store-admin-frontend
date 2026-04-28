"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
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
import { getOrders } from "@/src/services/order.service";
import type { OrderSummary, OrderStatus } from "@/src/types/order.types";
import { Tooltip } from "@/src/components/ui/Tooltip";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrdersTableProps {
  initialOrders: OrderSummary[];
  initialTotal: number;
}

type OrderRow = OrderSummary & Record<string, unknown>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

const ORDER_STATUS_OPTIONS = [
  { value: "pending",    label: "Pending" },
  { value: "confirmed",  label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped",    label: "Shipped" },
  { value: "delivered",  label: "Delivered" },
  { value: "cancelled",  label: "Cancelled" },
  { value: "returned",   label: "Returned" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "unpaid",             label: "Chưa thanh toán" },
  { value: "paid",               label: "Đã thanh toán" },
  { value: "refunded",           label: "Đã hoàn tiền" },
  { value: "partially_refunded", label: "Hoàn tiền một phần" },
];

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod:          "COD",
  bank_transfer:"Bank Transfer",
  credit_card:  "Credit Card",
  momo:         "MoMo",
  zalopay:      "ZaloPay",
  vnpay:        "VNPay",
};

// ─── Columns ──────────────────────────────────────────────────────────────────

const COLUMNS: ColumnDef<OrderRow>[] = [
  {
    key: "id",
    header: "Order ID",
    sortable: true,
    render: (_, row) => (
      <Link
        href={`/orders/${row.id as string}`}
        className="font-mono text-sm font-semibold text-primary-600 hover:text-primary-700 hover:underline"
      >
        {row.id as string}
      </Link>
    ),
  },
  {
    key: "createdAt",
    header: "Ngày tạo",
    align: "left",
    sortable: true,
    render: (_, row) => (
      <span className="whitespace-nowrap text-sm text-secondary-600">
        {formatDate(row.createdAt as string)}
      </span>
    ),
  },
  {
    key: "customerName",
    header: "Khách hàng",
    sortable: true,
    render: (_, row) => (
      <div>
        <Tooltip content={row.customerName as string} placement="top" anchorToContent>
          <Link
            href={`/customers/${row.customerId as string}`}
            className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
          >
            {row.customerName as string}
          </Link>
        </Tooltip>
        <p className="text-xs text-secondary-400">{row.customerPhone as string}</p>
      </div>
    ),
  },
  {
    key: "status",
    header: "Trạng thái",
    sortable: true,
    render: (_, row) => <StatusBadge status={row.status as string} size="sm" />,
  },
  {
    key: "paymentStatus",
    header: "Thanh toán",
    sortable: true,
    render: (_, row) => (
      <div className="space-y-1">
        <StatusBadge status={row.paymentStatus as string} size="sm" />
        <p className="text-xs text-secondary-400">
          {PAYMENT_METHOD_LABELS[row.paymentMethod as string] ?? (row.paymentMethod as string)}
        </p>
      </div>
    ),
  },
  {
    key: "itemCount",
    header: "Tổng SP",
    align: "center",
    render: (_, row) => (
      <span className="text-sm text-secondary-600">{row.itemCount as number}</span>
    ),
  },
  {
    key: "grandTotal",
    header: "Tổng cộng",
    sortable: true,
    render: (_, row) => (
      <span className="text-sm font-semibold text-secondary-900">
        {formatVND(row.grandTotal as number)}
      </span>
    ),
  },
  {
    key: "_actions",
    header: "",
    render: (_, row) => (
      <RowActions>
        <RowActionView href={`/orders/${row.id as string}`} />
      </RowActions>
    ),
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function OrdersTable({ initialOrders, initialTotal }: OrdersTableProps) {
  const [orders, setOrders]           = useState<OrderSummary[]>(initialOrders);
  const [serverTotal, setServerTotal] = useState<number>(initialTotal);
  const [loading, setLoading]         = useState(false);

  const fetchTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender    = useRef(true);
  const prevSearchRef    = useRef("");
  const nonPageChangedRef = useRef(false);

  const [q, setQ]                       = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [paymentFilter, setPaymentFilter] = useState<string[]>([]);
  const [sortKey, setSortKey]           = useState("createdAt");
  const [sortDir, setSortDir]           = useState<SortDir>("desc");
  const [page, setPage]                 = useState(1);
  const [pageSize, setPageSize]         = useState(10);

  // ── Server fetch on every relevant state change ────────────────────────────

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const isSearchChange = q !== prevSearchRef.current;
    prevSearchRef.current = q;
    const isNonPageChange = nonPageChangedRef.current;
    nonPageChangedRef.current = false;

    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    fetchTimerRef.current = setTimeout(async () => {
      if (isNonPageChange) setLoading(true);
      try {
        const result = await getOrders({
          q:             q || undefined,
          status:        statusFilter.length === 1 ? (statusFilter[0] as OrderStatus) : undefined,
          paymentStatus: paymentFilter.length === 1 ? paymentFilter[0] : undefined,
          page,
          pageSize,
          sortBy:    sortKey,
          sortOrder: sortDir.toUpperCase(),
        });
        setOrders(result.data);
        setServerTotal(result.total);
      } catch {
        // keep existing data on error
      } finally {
        setLoading(false);
      }
    }, isSearchChange ? 300 : 0);

    return () => {
      if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    };
  }, [page, pageSize, q, statusFilter, paymentFilter, sortKey, sortDir]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSortChange = useCallback((key: string, dir: SortDir) => {
    nonPageChangedRef.current = true;
    setSortKey(key); setSortDir(dir); setPage(1);
  }, []);

  const handleSearchChange = useCallback((val: string) => {
    nonPageChangedRef.current = true;
    setQ(val); setPage(1);
  }, []);

  const handleStatusFilterChange = useCallback((values: string[]) => {
    nonPageChangedRef.current = true;
    setStatusFilter(values); setPage(1);
  }, []);

  const handlePaymentFilterChange = useCallback((values: string[]) => {
    nonPageChangedRef.current = true;
    setPaymentFilter(values); setPage(1);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    nonPageChangedRef.current = true;
    setPageSize(size); setPage(1);
  }, []);

  // ── Toolbar ───────────────────────────────────────────────────────────────

  const toolbarActions = (
    <>
      <FilterDropdown
        label="Trạng thái"
        options={ORDER_STATUS_OPTIONS}
        selected={statusFilter}
        onChange={handleStatusFilterChange}
      />
      <FilterDropdown
        label="Thanh toán"
        options={PAYMENT_STATUS_OPTIONS}
        selected={paymentFilter}
        onChange={handlePaymentFilterChange}
      />
      <span className="text-sm text-secondary-400 whitespace-nowrap">
        {serverTotal} đơn hàng
      </span>
    </>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70">
          <ArrowPathIcon className="w-6 h-6 animate-spin text-primary-600" aria-hidden="true" />
        </div>
      )}
      <DataTable<OrderRow>
        columns={COLUMNS}
        data={orders as OrderRow[]}
        keyField="id"
        sortKey={sortKey}
        sortDir={sortDir}
        onSortChange={handleSortChange}
        searchQuery={q}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Tìm kiếm theo mã đơn hàng, tên KH hoặc SĐT..."
        toolbarActions={toolbarActions}
        page={page}
        pageSize={pageSize}
        totalRows={serverTotal}
        pageSizeOptions={[10, 25, 50, 100]}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        emptyMessage="Không tìm thấy đơn hàng."
      />
    </div>
  );
}
