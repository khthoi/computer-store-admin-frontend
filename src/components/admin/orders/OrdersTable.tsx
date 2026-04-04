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
import type { OrderSummary, OrderStatus, PaymentStatus } from "@/src/types/order.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrdersTableProps {
  initialOrders: OrderSummary[];
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
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "returned", label: "Returned" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "unpaid", label: "Unpaid" },
  { value: "paid", label: "Paid" },
  { value: "refunded", label: "Refunded" },
  { value: "partially_refunded", label: "Partial Refund" },
];

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod: "COD",
  bank_transfer: "Bank Transfer",
  credit_card: "Credit Card",
  momo: "MoMo",
  zalopay: "ZaloPay",
  vnpay: "VNPay",
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
    header: "Date",
    sortable: true,
    render: (_, row) => (
      <span className="whitespace-nowrap text-sm text-secondary-600">
        {formatDate(row.createdAt as string)}
      </span>
    ),
  },
  {
    key: "customerName",
    header: "Customer",
    sortable: true,
    render: (_, row) => (
      <div>
        <p className="text-sm font-medium text-secondary-900">{row.customerName as string}</p>
        <p className="text-xs text-secondary-400">{row.customerPhone as string}</p>
      </div>
    ),
  },
  {
    key: "status",
    header: "Order Status",
    sortable: true,
    render: (_, row) => <StatusBadge status={row.status as string} size="sm" />,
  },
  {
    key: "paymentStatus",
    header: "Payment",
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
    header: "Items",
    align: "center",
    render: (_, row) => (
      <span className="text-sm text-secondary-600">{row.itemCount as number}</span>
    ),
  },
  {
    key: "grandTotal",
    header: "Total",
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

export function OrdersTable({ initialOrders }: OrdersTableProps) {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [paymentFilter, setPaymentFilter] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let rows = [...initialOrders];

    if (q.trim()) {
      const lower = q.toLowerCase();
      rows = rows.filter(
        (o) =>
          o.id.toLowerCase().includes(lower) ||
          o.customerName.toLowerCase().includes(lower) ||
          o.customerPhone.includes(lower)
      );
    }

    if (statusFilter.length > 0) {
      rows = rows.filter((o) => statusFilter.includes(o.status));
    }

    if (paymentFilter.length > 0) {
      rows = rows.filter((o) => paymentFilter.includes(o.paymentStatus));
    }

    rows.sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sortKey] as string | number;
      const bv = (b as unknown as Record<string, unknown>)[sortKey] as string | number;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });

    return rows as OrderRow[];
  }, [initialOrders, q, statusFilter, paymentFilter, sortKey, sortDir]);

  const totalRows = filtered.length;

  // ── Toolbar (right-side slot: filters + count) ─────────────────────────────

  const toolbarActions = (
    <>
      <FilterDropdown
        label="Status"
        options={ORDER_STATUS_OPTIONS}
        selected={statusFilter}
        onChange={(v) => { setStatusFilter(v); setPage(1); }}
      />
      <FilterDropdown
        label="Payment"
        options={PAYMENT_STATUS_OPTIONS}
        selected={paymentFilter}
        onChange={(v) => { setPaymentFilter(v); setPage(1); }}
      />
      <span className="text-sm text-secondary-400 whitespace-nowrap">
        {totalRows} order{totalRows !== 1 ? "s" : ""}
      </span>
    </>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <DataTable<OrderRow>
      columns={COLUMNS}
      data={filtered}
      keyField="id"
      sortKey={sortKey}
      sortDir={sortDir}
      onSortChange={(key, dir) => { setSortKey(key); setSortDir(dir); }}
      searchQuery={q}
      onSearchChange={(val) => { setQ(val); setPage(1); }}
      searchPlaceholder="Search by order ID, customer name or phone…"
      toolbarActions={toolbarActions}
      page={page}
      pageSize={pageSize}
      totalRows={totalRows}
      pageSizeOptions={[10, 25, 50, 100]}
      onPageChange={setPage}
      onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
      emptyMessage="No orders found."
    />
  );
}
