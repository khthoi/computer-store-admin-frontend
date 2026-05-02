"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
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
import { getTransactions } from "@/src/services/transaction.service";
import type {
  TransactionRow,
  TransactionStatus,
  TransactionPaymentMethod,
} from "@/src/types/transaction.types";

// ─── Types ────────────────────────────────────────────────────────────────────

type TxRecord = TransactionRow & Record<string, unknown>;

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

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

// ─── Label maps & filter options ──────────────────────────────────────────────

const PAYMENT_METHOD_LABELS: Record<TransactionPaymentMethod, string> = {
  COD:          "COD",
  ChuyenKhoan:  "Chuyển khoản",
  TheNganHang:  "Thẻ ngân hàng",
  ViDienTu:     "Ví điện tử",
  TraGop:       "Trả góp",
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
  { value: "TheNganHang", label: "Thẻ ngân hàng" },
  { value: "ViDienTu",    label: "Ví điện tử" },
  { value: "TraGop",      label: "Trả góp" },
];

// ─── Row button styles ────────────────────────────────────────────────────────

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

export function TransactionsTable({ initialData, initialTotal }: TransactionsTableProps) {
  // ── Server-side data state ─────────────────────────────────────────────────
  const [data,    setData]    = useState<TransactionRow[]>(initialData);
  const [total,   setTotal]   = useState(initialTotal);
  const [loading, setLoading] = useState(false);

  // ── Pagination state ───────────────────────────────────────────────────────
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  // ── Filter state ───────────────────────────────────────────────────────────
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [methodFilter, setMethodFilter] = useState<string[]>([]);
  const [tuNgay,       setTuNgay]       = useState("");
  const [denNgay,      setDenNgay]      = useState("");

  // ── Sort state (client-side sort within current page) ─────────────────────
  const [sortKey, setSortKey] = useState("ngayTao");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // ── Drawer state ───────────────────────────────────────────────────────────
  const [drawerTx, setDrawerTx] = useState<TransactionRow | null>(null);

  // ── Export ─────────────────────────────────────────────────────────────────
  const [isExporting, setIsExporting] = useState(false);

  // ── Refs for no-flash pagination pattern ──────────────────────────────────
  const nonPageChangedRef = useRef(false);
  const fetchTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender     = useRef(true);
  const prevSearchRef     = useRef("");

  // ── Handlers — each sets nonPageChangedRef + resets page ──────────────────

  const handleSearchChange = useCallback((q: string) => {
    nonPageChangedRef.current = true;
    setSearch(q);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((vals: string[]) => {
    nonPageChangedRef.current = true;
    setStatusFilter(vals);
    setPage(1);
  }, []);

  const handleMethodChange = useCallback((vals: string[]) => {
    nonPageChangedRef.current = true;
    setMethodFilter(vals);
    setPage(1);
  }, []);

  const handleTuNgayChange = useCallback((val: string) => {
    nonPageChangedRef.current = true;
    setTuNgay(val);
    setPage(1);
  }, []);

  const handleDenNgayChange = useCallback((val: string) => {
    nonPageChangedRef.current = true;
    setDenNgay(val);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((key: string, dir: SortDir) => {
    nonPageChangedRef.current = true;
    setSortKey(key);
    setSortDir(dir);
    setPage(1);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    nonPageChangedRef.current = true;
    setPageSize(size);
    setPage(1);
  }, []);

  // ── Fetch effect ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }

    const isNonPageChange = nonPageChangedRef.current;
    nonPageChangedRef.current = false;

    const isSearchChange = search !== prevSearchRef.current;
    prevSearchRef.current = search;

    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);

    fetchTimerRef.current = setTimeout(async () => {
      if (isNonPageChange) setLoading(true);
      try {
        const result = await getTransactions({
          page,
          pageSize,
          q:          search || undefined,
          trangThai:  statusFilter.length ? (statusFilter as TransactionStatus[]) : undefined,
          phuongThuc: methodFilter.length ? (methodFilter as TransactionPaymentMethod[]) : undefined,
          tuNgay:     tuNgay  || undefined,
          denNgay:    denNgay || undefined,
          sortBy: sortKey,
          sortDir,
        });
        setData(result.data);
        setTotal(result.total);
      } catch {
        // giữ dữ liệu cũ khi lỗi
      } finally {
        setLoading(false);
      }
    }, isSearchChange ? 300 : 0);

    return () => { if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current); };
  }, [page, pageSize, search, statusFilter, methodFilter, tuNgay, denNgay, sortKey, sortDir]);

  // ── Client-side sort trên trang hiện tại ──────────────────────────────────

  const displayData = useMemo((): TxRecord[] => data as unknown as TxRecord[], [data]);

  // ── Export ─────────────────────────────────────────────────────────────────

  function handleExport(format: ExportFormat) {
    setIsExporting(true);
    console.log("Export transactions as", format);
    setTimeout(() => setIsExporting(false), 1200);
  }

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
          href={`/orders/${(row as TransactionRow).maDonHang}`}
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
      width: "w-36",
      render: (v) =>
        v != null ? (
          <Tooltip content={String(v)} placement="top" copy>
            <span className="block max-w-[8rem] truncate font-mono text-xs cursor-pointer">
              {String(v)}
            </span>
          </Tooltip>
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
            <Tooltip content="Xem đơn hàng" placement="top">
              <Link
                href={`/orders/${tx.maDonHang}`}
                aria-label="Xem đơn hàng"
                className={ROW_BTN_GHOST}
              >
                <EyeIcon className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Tooltip>

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

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <DataTable<TxRecord>
        data={displayData}
        columns={columns}
        keyField="giaoDichId"
        isLoading={loading}
        // ── Search ────────────────────────────────────────────────────────────
        searchQuery={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Tìm theo mã GD ngoài, mã đơn hàng, tên khách..."
        // ── Sort ──────────────────────────────────────────────────────────────
        sortKey={sortKey}
        sortDir={sortDir}
        onSortChange={handleSortChange}
        // ── Pagination ────────────────────────────────────────────────────────
        page={page}
        pageSize={pageSize}
        totalRows={total}
        pageSizeOptions={[10, 20, 50, 100]}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        // ── Empty state ───────────────────────────────────────────────────────
        emptyIcon={<CreditCardIcon className="w-12 h-12" />}
        emptyMessage="Không có giao dịch nào phù hợp với bộ lọc."
        // ── Row highlight: đỏ nhạt cho ThatBai ───────────────────────────────
        rowClassName={(row) =>
          (row as TransactionRow).trangThaiGiaoDich === "ThatBai"
            ? "bg-error-50/40"
            : undefined
        }
        // ── Toolbar filters ───────────────────────────────────────────────────
        toolbarActions={
          <div className="flex flex-wrap items-center gap-2">
            <FilterDropdown
              label="Trạng thái"
              options={STATUS_OPTIONS}
              selected={statusFilter}
              onChange={handleStatusChange}
            />

            <FilterDropdown
              label="Phương thức TT"
              options={METHOD_OPTIONS}
              selected={methodFilter}
              onChange={handleMethodChange}
            />

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

            <ExportButton
              onExport={handleExport}
              isExporting={isExporting}
              scope="giao dịch"
            />
          </div>
        }
      />

      <TransactionDetailDrawer
        transaction={drawerTx}
        onClose={() => setDrawerTx(null)}
      />
    </>
  );
}
