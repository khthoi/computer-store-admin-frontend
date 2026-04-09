"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  PlusIcon,
  BoltIcon,
  PlayIcon,
  CalendarIcon,
  ClockIcon,
  EyeIcon,
  PencilSquareIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import { StatCard } from "@/src/components/admin/StatCard";
import { DataTable } from "@/src/components/admin/DataTable";
import type { ColumnDef } from "@/src/components/admin/DataTable";
import { Select } from "@/src/components/ui/Select";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { useToast } from "@/src/components/ui/Toast";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import { FlashSaleStatusBadge } from "./FlashSaleStatusBadge";
import {
  getFlashSales,
  getFlashSaleStats,
  cancelFlashSale,
} from "@/src/services/flash-sale.service";
import { formatDateTime } from "@/src/lib/format";
import type {
  FlashSaleSummary,
  FlashSaleStats,
  FlashSaleStatus,
} from "@/src/types/flash-sale.types";

// ─── Status filter options ─────────────────────────────────────────────────────

const STATUS_FILTER_OPTIONS = [
  { value: "nhap", label: "Nháp" },
  { value: "sap_dien_ra", label: "Sắp diễn ra" },
  { value: "dang_dien_ra", label: "Đang diễn ra" },
  { value: "da_ket_thuc", label: "Đã kết thúc" },
  { value: "huy", label: "Đã hủy" },
];

// ─── Table columns ─────────────────────────────────────────────────────────────

function buildColumns(
  onCancelClick: (id: number, name: string) => void
): ColumnDef<FlashSaleSummary & Record<string, unknown>>[] {
  return [
    {
      key:     "ten",
      header:  "Tên sự kiện",
      width:   "w-[20%]",
      tooltip: (_, row) => row.ten as string,
      render:  (_, row) => (
        <Link
          href={`/promotions/flash-sales/${row.flashSaleId}`}
          className="font-medium text-primary-700 hover:text-primary-800 hover:underline transition-colors truncate block"
        >
          {row.ten as string}
        </Link>
      ),
    },
    {
      key: "trangThai",
      header: "Trạng thái",
      align: "center",
      render: (value) => <FlashSaleStatusBadge status={value as FlashSaleStatus} />,
    },
    {
      key: "batDau",
      header: "Thời gian",
      render: (_, row) => (
        <div className="text-xs text-secondary-600 space-y-0.5">
          <p>{formatDateTime(row.batDau as string)}</p>
          <p className="text-secondary-400">→ {formatDateTime(row.ketThuc as string)}</p>
        </div>
      ),
    },
    {
      key: "soLuongPhienBan",
      header: "Variants",
      align: "center",
      render: (value) => (
        <span className="font-semibold text-secondary-700">{value as number}</span>
      ),
    },
    {
      key: "tongSanPhamDaBan",
      header: "Đã bán / Giới hạn",
      render: (_, row) => {
        const sold = row.tongSanPhamDaBan as number;
        const limit = row.tongGioiHan as number;
        const pct = limit > 0 ? Math.min(100, Math.round((sold / limit) * 100)) : 0;
        return (
          <div className="space-y-1 min-w-[100px]">
            <div className="flex items-center justify-between text-xs text-secondary-600">
              <span>{sold} / {limit}</span>
              <span className="text-secondary-400">{pct}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-secondary-100 overflow-hidden">
              <div
                className={[
                  "h-full rounded-full",
                  pct >= 90 ? "bg-error-500" : pct >= 60 ? "bg-warning-500" : "bg-primary-500",
                ].join(" ")}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: "createdAt",
      header: "Ngày tạo",
      render: (value) => (
        <span className="text-xs text-secondary-500 whitespace-nowrap">
          {formatDateTime(value as string)}
        </span>
      ),
    },
    {
      key: "flashSaleId",
      header: "",
      align: "right",
      render: (_, row) => {
        const canEdit = row.trangThai === "nhap" || row.trangThai === "sap_dien_ra";
        const canCancel = row.trangThai === "nhap" || row.trangThai === "sap_dien_ra";
        return (
          <div className="flex items-center justify-end gap-1">
            {/* Xem */}
            <Tooltip content="Xem chi tiết" placement="top">
              <Link
                href={`/promotions/flash-sales/${row.flashSaleId}`}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-secondary-200 bg-white text-secondary-500 hover:bg-secondary-50 hover:text-secondary-800 transition-colors"
                aria-label="Xem chi tiết"
              >
                <EyeIcon className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Tooltip>

            {/* Sửa */}
            {canEdit && (
              <Tooltip content="Chỉnh sửa" placement="top">
                <Link
                  href={`/promotions/flash-sales/${row.flashSaleId}/edit`}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-secondary-200 bg-white text-secondary-500 hover:bg-secondary-50 hover:text-secondary-800 transition-colors"
                  aria-label="Chỉnh sửa"
                >
                  <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Tooltip>
            )}

            {/* Hủy */}
            {canCancel && (
              <Tooltip content="Hủy sự kiện" placement="top">
                <button
                  type="button"
                  onClick={() => onCancelClick(row.flashSaleId as number, row.ten as string)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-error-200 bg-error-50 text-error-600 hover:bg-error-100 transition-colors"
                  aria-label="Hủy sự kiện"
                >
                  <NoSymbolIcon className="h-4 w-4" aria-hidden="true" />
                </button>
              </Tooltip>
            )}
          </div>
        );
      },
    },
  ];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FlashSalesListClient() {
  const { showToast } = useToast();

  // ── Data state ────────────────────────────────────────────────────────────
  const [data, setData] = useState<FlashSaleSummary[]>([]);
  const [stats, setStats] = useState<FlashSaleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // ── Filter state ──────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ── Confirm cancel state ──────────────────────────────────────────────────
  const [cancelTarget, setCancelTarget] = useState<{ id: number; name: string } | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [result, statsData] = await Promise.all([
        getFlashSales({
          page,
          limit: pageSize,
          status: (status as FlashSaleStatus) || undefined,
          search: search || undefined,
        }),
        getFlashSaleStats(),
      ]);
      setData(result.data);
      setTotal(result.total);
      setStats(statsData);
    } catch {
      showToast("Không thể tải danh sách flash sale.", "error");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, status, search, showToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Cancel action ─────────────────────────────────────────────────────────
  async function handleConfirmCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await cancelFlashSale(cancelTarget.id);
      showToast(`Đã hủy "${cancelTarget.name}".`, "success");
      setCancelTarget(null);
      fetchData();
    } catch {
      showToast("Hủy thất bại.", "error");
    } finally {
      setCancelling(false);
    }
  }

  const columns = buildColumns((id, name) => setCancelTarget({ id, name }));
  const tableData = data as (FlashSaleSummary & Record<string, unknown>)[];

  return (
    <>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4 px-6 pt-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Flash Sales</h1>
          <p className="mt-1 text-sm text-secondary-500">
            Quản lý các sự kiện flash sale giá cho phiên bản sản phẩm.
          </p>
        </div>
        <Link
          href="/promotions/flash-sales/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
        >
          <PlusIcon className="w-4 h-4" />
          Tạo Flash Sale
        </Link>
      </div>

      <div className="px-6 pb-6 space-y-5 mt-5">
        {/* ── Stats cards ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            title="Tổng sự kiện"
            value={stats?.totalEvents ?? "—"}
            icon={<BoltIcon className="w-5 h-5" />}
            isLoading={!stats}
          />
          <StatCard
            title="Đang diễn ra"
            value={stats?.activeNow ?? "—"}
            icon={<PlayIcon className="w-5 h-5" />}
            variant="success"
            isLoading={!stats}
          />
          <StatCard
            title="Sắp diễn ra"
            value={stats?.upcomingCount ?? "—"}
            icon={<CalendarIcon className="w-5 h-5" />}
            variant="warning"
            isLoading={!stats}
          />
          <StatCard
            title="Hôm nay"
            value={stats?.todayCount ?? "—"}
            icon={<ClockIcon className="w-5 h-5" />}
            variant="primary"
            isLoading={!stats}
          />
        </div>

        {/* ── DataTable ─────────────────────────────────────────────────── */}
        <DataTable
          data={tableData}
          columns={columns}
          keyField="flashSaleId"
          isLoading={loading}
          emptyMessage="Chưa có sự kiện flash sale nào."
          emptyAction={
            <Link
              href="/promotions/flash-sales/new"
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              <PlusIcon className="w-4 h-4" />
              Tạo Flash Sale đầu tiên
            </Link>
          }
          page={page}
          pageSize={pageSize}
          totalRows={total}
          tableLayout="fixed"
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
          searchQuery={search}
          onSearchChange={(q) => { setSearch(q); setPage(1); }}
          searchPlaceholder="Tìm theo tên sự kiện…"
          toolbarActions={
            /* Select dùng onChange nhận string, không phải event */
            <Select
              options={STATUS_FILTER_OPTIONS}
              value={status || undefined}
              onChange={(v) => { setStatus(v as string); setPage(1); }}
              placeholder="Tất cả trạng thái"
              clearable
              size="sm"
            />
          }
        />
      </div>

      {/* ── Confirm cancel dialog ────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!cancelTarget}
        title="Hủy Flash Sale?"
        description={`Sự kiện "${cancelTarget?.name}" sẽ bị hủy ngay lập tức. Thao tác này không thể hoàn tác.`}
        confirmLabel="Hủy sự kiện"
        variant="danger"
        isConfirming={cancelling}
        onConfirm={handleConfirmCancel}
        onClose={() => setCancelTarget(null)}
      />
    </>
  );
}
