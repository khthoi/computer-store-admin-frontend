"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  EyeIcon,
  MagnifyingGlassIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";

import {
  DataTable,
  RowActions,
  type ColumnDef,
  type SortDir,
} from "@/src/components/admin/DataTable";
import { DateInput } from "@/src/components/ui/DateInput";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { FilterDropdown } from "@/src/components/admin/FilterDropdown";
import { ExportButton, type ExportFormat } from "@/src/components/admin/shared/ExportButton";
import { TransactionStatusBadge } from "@/src/components/admin/orders/TransactionStatusBadge";
import { TransactionDetailDrawer } from "@/src/components/admin/orders/TransactionDetailDrawer";
import type {
  TransactionRow,
  TransactionStatus,
  TransactionPaymentMethod,
} from "@/src/types/transaction.types";

// ─── Types ────────────────────────────────────────────────────────────────────

// Cast to satisfy DataTable's Record<string, unknown> constraint while
// retaining proper field types inside render callbacks.
type TxRecord = TransactionRow & Record<string, unknown>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatVND(amount: number): string {
  return amount.toLocaleString("vi-VN") + " ₫";
}

function formatDatetime(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PAYMENT_METHOD_LABELS: Record<TransactionPaymentMethod, string> = {
  COD:         "COD",
  ChuyenKhoan: "Chuyển khoản",
  VNPAY:       "VNPAY",
  Momo:        "MoMo",
  ZaloPay:     "ZaloPay",
  TraGop:      "Trả góp",
};

const STATUS_OPTIONS = [
  { value: "ThanhCong", label: "Thành công" },
  { value: "Cho",       label: "Chờ xử lý" },
  { value: "ThatBai",   label: "Thất bại" },
  { value: "DaHoan",    label: "Đã hoàn tiền" },
];

const METHOD_OPTIONS = [
  { value: "COD",         label: "COD" },
  { value: "ChuyenKhoan", label: "Chuyển khoản" },
  { value: "VNPAY",       label: "VNPAY" },
  { value: "Momo",        label: "MoMo" },
  { value: "ZaloPay",     label: "ZaloPay" },
  { value: "TraGop",      label: "Trả góp" },
];

// Reuse same style as DataTable's internal ROW_ACTION_BASE
const ROW_BTN_BASE =
  "flex h-7 w-7 items-center justify-center rounded text-secondary-400 " +
  "transition-colors focus-visible:outline-none focus-visible:ring-2";

const ROW_BTN_GHOST =
  ROW_BTN_BASE + " hover:bg-secondary-100 hover:text-secondary-700 focus-visible:ring-primary-500";

const ROW_BTN_ERROR =
  ROW_BTN_BASE + " hover:bg-error-50 hover:text-error-600 focus-visible:ring-error-500";

// ─── Props ────────────────────────────────────────────────────────────────────

interface TransactionsTableProps {
  initialData: TransactionRow[];
  initialTotal: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * TransactionsTable — trang danh sách giao dịch dùng DataTable component.
 *
 * - Lọc client-side: search, trạng thái, phương thức, date range (DateInput)
 * - Sort: server-side pattern (client-side trên mock data)
 * - Pagination: DataTable built-in với page/pageSize state
 * - Actions: icon-only ghost buttons với Tooltip
 * - ThatBai rows: highlight + nút "Xem lỗi" mở TransactionDetailDrawer
 */
export function TransactionsTable({
  initialData,
}: TransactionsTableProps) {
  // ── Filter state ───────────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [methodFilter, setMethodFilter] = useState<string[]>([]);
  const [tuNgay, setTuNgay]             = useState("");
  const [denNgay, setDenNgay]           = useState("");

  // ── Pagination state ───────────────────────────────────────────────────────
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // ── Sort state ─────────────────────────────────────────────────────────────
  const [sortKey, setSortKey] = useState("ngayTao");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // ── Search state (controlled, fed from DataTable's onSearchChange) ─────────
  const [search, setSearch] = useState("");

  // ── Drawer state ───────────────────────────────────────────────────────────
  const [drawerTx, setDrawerTx] = useState<TransactionRow | null>(null);

  // ── Export ─────────────────────────────────────────────────────────────────
  const [isExporting, setIsExporting] = useState(false);

  function handleExport(format: ExportFormat) {
    setIsExporting(true);
    // TODO: thay bằng real API call
    console.log("Export transactions as", format);
    setTimeout(() => setIsExporting(false), 1200);
  }

  // ── Filter change helpers (reset page về 1) ────────────────────────────────

  const handleSearchChange = useCallback((q: string) => {
    setSearch(q);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((vals: string[]) => {
    setStatusFilter(vals);
    setPage(1);
  }, []);

  const handleMethodChange = useCallback((vals: string[]) => {
    setMethodFilter(vals);
    setPage(1);
  }, []);

  const handleTuNgayChange = useCallback((val: string) => {
    setTuNgay(val);
    setPage(1);
  }, []);

  const handleDenNgayChange = useCallback((val: string) => {
    setDenNgay(val);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((key: string, dir: SortDir) => {
    setSortKey(key);
    setSortDir(dir);
    setPage(1);
  }, []);

  // ── Derived: filtered + sorted data ───────────────────────────────────────

  const filteredData = useMemo((): TxRecord[] => {
    let result: TransactionRow[] = [...initialData];

    // Search
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.maDonHang.toLowerCase().includes(lower) ||
          (t.maGiaoDichNgoai?.toLowerCase().includes(lower) ?? false) ||
          t.tenKhachHang.toLowerCase().includes(lower)
      );
    }

    // Trạng thái
    if (statusFilter.length > 0) {
      result = result.filter((t) =>
        statusFilter.includes(t.trangThaiGiaoDich)
      );
    }

    // Phương thức
    if (methodFilter.length > 0) {
      result = result.filter((t) =>
        methodFilter.includes(t.phuongThucThanhToan)
      );
    }

    // Date range — so sánh theo ngayTao (ISO string)
    if (tuNgay) {
      result = result.filter((t) => t.ngayTao >= tuNgay);
    }
    if (denNgay) {
      const nextDay = new Date(denNgay);
      nextDay.setDate(nextDay.getDate() + 1);
      result = result.filter((t) => t.ngayTao < nextDay.toISOString());
    }

    // Sort
    result.sort((a, b) => {
      const aVal = String((a as unknown as Record<string, unknown>)[sortKey] ?? "");
      const bVal = String((b as unknown as Record<string, unknown>)[sortKey] ?? "");
      const cmp = aVal.localeCompare(bVal, "vi");
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result as unknown as TxRecord[];
  }, [initialData, search, statusFilter, methodFilter, tuNgay, denNgay, sortKey, sortDir]);

  // ── Derived: paginated slice for DataTable ─────────────────────────────────

  const displayData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  // ── Column definitions ─────────────────────────────────────────────────────

  const columns = useMemo((): ColumnDef<TxRecord>[] => [
    {
      key: "giaoDichId",
      header: "Mã GD",
      width: "w-20",
      render: (v) => (
        <span className="font-mono text-xs text-secondary-500">#{String(v)}</span>
      ),
    },
    {
      key: "maDonHang",
      header: "Đơn hàng",
      width: "w-36",
      tooltip: (v) => String(v),
      render: (v, row) => (
        <Link
          href={`/orders/${(row as TransactionRow).donHangId}`}
          className="block max-w-[8rem] truncate font-medium text-primary-600 hover:text-primary-700 hover:underline"
        >
          {String(v)}
        </Link>
      ),
    },
    {
      key: "tenKhachHang",
      header: "Khách hàng",
      sortable: true,
      render: (v, row) => {
        const tx = row as TransactionRow;
        return (
          <div className="flex flex-col gap-0.5 min-w-0">
            <Link
              href={`/customers/${tx.khachHangId}`}
              className="truncate font-medium text-secondary-900 hover:text-primary-600 hover:underline"
            >
              {String(v)}
            </Link>
            <span className="truncate text-xs text-secondary-400">
              {tx.emailKhachHang}
            </span>
          </div>
        );
      },
    },
    {
      key: "phuongThucThanhToan",
      header: "Phương thức",
      width: "w-36",
      align: "center",
      render: (v) =>
        PAYMENT_METHOD_LABELS[v as TransactionPaymentMethod] ?? String(v),
    },
    {
      key: "soTien",
      header: "Số tiền",
      align: "right",
      sortable: true,
      render: (v) => (
        <span className="font-semibold text-secondary-900">
          {formatVND(Number(v))}
        </span>
      ),
    },
    {
      key: "trangThaiGiaoDich",
      header: "Trạng thái",
      align: "center",
      render: (v) => (
        <TransactionStatusBadge status={v as TransactionStatus} />
      ),
    },
    {
      key: "maGiaoDichNgoai",
      header: "Mã GD ngoài",
      tooltip: (v) => (v != null ? String(v) : ""),
      width: "w-36",
      render: (v) =>
        v != null ? (
          <span className="block max-w-[8rem] truncate font-mono text-xs">
            {String(v)}
          </span>
        ) : (
          "—"
        ),
    },
    {
      key: "nganHangVi",
      header: "Ngân hàng / Ví",
      tooltip: (v) => (v != null ? String(v) : ""),
      width: "w-36",
      render: (v) =>
        v != null ? (
          <span className="block max-w-[7rem] truncate">{String(v)}</span>
        ) : (
          "—"
        ),
    },
    {
      key: "thoiDiemThanhToan",
      header: "Thời điểm TT",
      sortable: true,
      tooltip: (v) => (v ? formatDatetime(String(v)) : ""),
      width: "w-36",
      render: (v) =>
        v ? (
          <span className="block max-w-[8rem] truncate">
            {formatDatetime(String(v))}
          </span>
        ) : (
          <span className="text-secondary-300">—</span>
        ),
    },
    {
      key: "ngayTao",
      header: "Ngày tạo",
      sortable: true,
      tooltip: (v) => formatDatetime(String(v)),
      width: "w-36",
      render: (v) => (
        <span className="block max-w-[8rem] truncate">
          {formatDatetime(String(v))}
        </span>
      ),
    },
    // Cột hành động — header để trống
    {
      key: "_actions",
      header: "",
      align: "right",
      width: "w-20",
      render: (_, row) => {
        const tx = row as TransactionRow;
        const isFailed = tx.trangThaiGiaoDich === "ThatBai";
        return (
          <RowActions>
            {/* Xem đơn hàng — eye icon, ghost */}
            <Tooltip content="Xem đơn hàng" placement="top">
              <Link
                href={`/orders/${tx.donHangId}`}
                aria-label="Xem đơn hàng"
                className={ROW_BTN_GHOST}
              >
                <EyeIcon className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Tooltip>

            {/* Xem chi tiết lỗi — chỉ hiện với ThatBai */}
            {isFailed && (
              <Tooltip content="Xem chi tiết lỗi" placement="top">
                <button
                  type="button"
                  aria-label="Xem chi tiết lỗi"
                  onClick={() => setDrawerTx(tx)}
                  className={ROW_BTN_ERROR}
                >
                  <MagnifyingGlassIcon className="h-4 w-4" aria-hidden="true" />
                </button>
              </Tooltip>
            )}
          </RowActions>
        );
      },
    },
  ], []);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <DataTable<TxRecord>
        data={displayData}
        columns={columns}
        keyField="giaoDichId"
        // ── Search ──────────────────────────────────────────────────────────
        searchQuery={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Tìm mã GD ngoài, mã đơn hàng, tên khách..."
        // ── Sort ────────────────────────────────────────────────────────────
        sortKey={sortKey}
        sortDir={sortDir}
        onSortChange={handleSortChange}
        // ── Pagination ──────────────────────────────────────────────────────
        page={page}
        pageSize={pageSize}
        totalRows={filteredData.length}
        pageSizeOptions={[10, 20, 50, 100]}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        // ── Empty state ─────────────────────────────────────────────────────
        emptyIcon={<CreditCardIcon className="w-12 h-12" />}
        emptyMessage="Không có giao dịch nào phù hợp với bộ lọc."
        // ── Row highlight: đỏ nhạt cho ThatBai ─────────────────────────────
        rowClassName={(row) =>
          (row as TransactionRow).trangThaiGiaoDich === "ThatBai"
            ? "bg-error-50/40"
            : undefined
        }
        // ── Toolbar filters (right of search) ───────────────────────────────
        toolbarActions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter trạng thái */}
            <FilterDropdown
              label="Trạng thái"
              options={STATUS_OPTIONS}
              selected={statusFilter}
              onChange={handleStatusChange}
            />

            {/* Filter phương thức */}
            <FilterDropdown
              label="Phương thức TT"
              options={METHOD_OPTIONS}
              selected={methodFilter}
              onChange={handleMethodChange}
            />

            {/* Date range — dùng DateInput component */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-secondary-500 shrink-0">
                Từ
              </span>
              <div className="w-40">
                <DateInput
                  value={tuNgay}
                  onChange={handleTuNgayChange}
                  placeholder="DD/MM/YYYY"
                  size="sm"
                />
              </div>
              <span className="text-xs font-medium text-secondary-500 shrink-0">
                đến
              </span>
              <div className="w-40">
                <DateInput
                  value={denNgay}
                  onChange={handleDenNgayChange}
                  placeholder="DD/MM/YYYY"
                  size="sm"
                />
              </div>
            </div>

            {/* Export */}
            <ExportButton
              onExport={handleExport}
              isExporting={isExporting}
              scope="giao dịch"
            />
          </div>
        }
      />

      {/* Drawer chi tiết lỗi */}
      <TransactionDetailDrawer
        transaction={drawerTx}
        onClose={() => setDrawerTx(null)}
      />
    </>
  );
}
