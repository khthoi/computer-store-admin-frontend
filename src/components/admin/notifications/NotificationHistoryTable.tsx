"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  BellIcon,
  DocumentMagnifyingGlassIcon,
  XCircleIcon,
  ArrowPathIcon,
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
import { NotificationStatusBadge } from "@/src/components/admin/notifications/NotificationStatusBadge";
import { NotificationChannelBadge } from "@/src/components/admin/notifications/NotificationChannelBadge";
import { NotificationDetailDrawer } from "@/src/components/admin/notifications/NotificationDetailDrawer";
import { cancelNotification, retryNotification } from "@/src/services/notification.service";
import { useToast } from "@/src/components/ui/Toast";
import type {
  ThongBaoRow,
  NotificationStatus,
  NotificationChannel,
  NotificationLoai,
} from "@/src/types/notification.types";

// ─── Types ────────────────────────────────────────────────────────────────────

type NRow = ThongBaoRow & Record<string, unknown>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDatetime(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const ENTITY_HREF: Record<string, (id: number) => string> = {
  DonHang:   (id) => `/orders/${id}`,
  GiaoDich:  (_)  => `/orders/transactions`,
  HoanHang:  (_)  => `/orders/returns`,
  KhuyenMai: (id) => `/promotions/${id}`,
};

const LOAI_LABEL: Record<NotificationLoai, string> = {
  DonHang:   "Đơn hàng",
  GiaoDich:  "Giao dịch",
  HoanHang:  "Hoàn trả",
  KhuyenMai: "Khuyến mãi",
  Loyalty:   "Loyalty",
  NhacNho:   "Nhắc nhở",
  HeThong:   "Hệ thống",
};

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "ChuaGui", label: "Chờ gửi" },
  { value: "DaGui",   label: "Đã gửi" },
  { value: "ThatBai", label: "Thất bại" },
  { value: "HuyBo",   label: "Đã hủy" },
];

const CHANNEL_OPTIONS = [
  { value: "Email", label: "Email" },
  { value: "SMS",   label: "SMS" },
  { value: "Push",  label: "Push" },
];

const LOAI_OPTIONS = [
  { value: "DonHang",   label: "Đơn hàng" },
  { value: "GiaoDich",  label: "Giao dịch" },
  { value: "HoanHang",  label: "Hoàn trả" },
  { value: "KhuyenMai", label: "Khuyến mãi" },
  { value: "Loyalty",   label: "Loyalty" },
  { value: "NhacNho",   label: "Nhắc nhở" },
  { value: "HeThong",   label: "Hệ thống" },
];

const ROW_BTN_BASE =
  "flex h-7 w-7 items-center justify-center rounded text-secondary-400 " +
  "transition-colors focus-visible:outline-none focus-visible:ring-2";
const ROW_BTN_GHOST =
  ROW_BTN_BASE + " hover:bg-secondary-100 hover:text-secondary-700 focus-visible:ring-primary-500";
const ROW_BTN_ERROR =
  ROW_BTN_BASE + " hover:bg-error-50 hover:text-error-600 focus-visible:ring-error-500";
const ROW_BTN_WARNING =
  ROW_BTN_BASE + " hover:bg-warning-50 hover:text-warning-600 focus-visible:ring-warning-500";

// ─── Props ────────────────────────────────────────────────────────────────────

interface NotificationHistoryTableProps {
  initialData: ThongBaoRow[];
  initialTotal: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NotificationHistoryTable({
  initialData,
  initialTotal,
}: NotificationHistoryTableProps) {
  const { showToast } = useToast();

  // ── Filter state ───────────────────────────────────────────────────────────
  const [statusFilter,  setStatusFilter]  = useState<string[]>([]);
  const [channelFilter, setChannelFilter] = useState<string[]>([]);
  const [loaiFilter,    setLoaiFilter]    = useState<string[]>([]);
  const [tuNgay,        setTuNgay]        = useState("");
  const [denNgay,       setDenNgay]       = useState("");
  const [search,        setSearch]        = useState("");

  // ── Pagination ─────────────────────────────────────────────────────────────
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // ── Sort ───────────────────────────────────────────────────────────────────
  const [sortKey, setSortKey] = useState("ngayTao");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // ── Drawer ─────────────────────────────────────────────────────────────────
  const [drawerNotif, setDrawerNotif] = useState<ThongBaoRow | null>(null);

  // ── Data (mutable local copy cho cancel/retry) ─────────────────────────────
  const [data, setData] = useState<ThongBaoRow[]>(initialData);

  // ── Export ─────────────────────────────────────────────────────────────────
  const [isExporting, setIsExporting] = useState(false);
  function handleExport(format: ExportFormat) {
    setIsExporting(true);
    console.log("Export notifications as", format);
    setTimeout(() => setIsExporting(false), 1200);
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleCancel = useCallback(async (id: number) => {
    try {
      await cancelNotification(id);
      setData((prev) =>
        prev.map((n) => n.thongBaoId === id ? { ...n, trangThai: "HuyBo" as NotificationStatus } : n)
      );
      showToast("Đã hủy thông báo.", "success");
    } catch {
      showToast("Không thể hủy thông báo.", "error");
    }
  }, [showToast]);

  const handleRetry = useCallback(async (id: number) => {
    try {
      await retryNotification(id);
      setData((prev) =>
        prev.map((n) => n.thongBaoId === id ? { ...n, trangThai: "ChuaGui" as NotificationStatus } : n)
      );
      showToast("Đã thêm vào hàng đợi gửi lại.", "success");
    } catch {
      showToast("Không thể gửi lại.", "error");
    }
  }, [showToast]);

  // ── Filter/sort helpers ────────────────────────────────────────────────────
  const handleSearchChange  = useCallback((q: string) => { setSearch(q);        setPage(1); }, []);
  const handleStatusChange  = useCallback((v: string[]) => { setStatusFilter(v);  setPage(1); }, []);
  const handleChannelChange = useCallback((v: string[]) => { setChannelFilter(v); setPage(1); }, []);
  const handleLoaiChange    = useCallback((v: string[]) => { setLoaiFilter(v);    setPage(1); }, []);
  const handleTuNgay        = useCallback((v: string) => { setTuNgay(v);        setPage(1); }, []);
  const handleDenNgay       = useCallback((v: string) => { setDenNgay(v);       setPage(1); }, []);
  const handleSortChange    = useCallback((k: string, d: SortDir) => {
    setSortKey(k); setSortDir(d); setPage(1);
  }, []);

  // ── Filtered + sorted data ─────────────────────────────────────────────────
  const filteredData = useMemo((): NRow[] => {
    let result = [...data];

    if (search) {
      const lower = search.toLowerCase();
      result = result.filter(
        (n) =>
          n.tenKhachHang.toLowerCase().includes(lower) ||
          n.tieuDe.toLowerCase().includes(lower) ||
          n.emailKhachHang.toLowerCase().includes(lower)
      );
    }
    if (statusFilter.length)  result = result.filter((n) => statusFilter.includes(n.trangThai));
    if (channelFilter.length) result = result.filter((n) => channelFilter.includes(n.kenhGui));
    if (loaiFilter.length)    result = result.filter((n) => loaiFilter.includes(n.loaiThongBao));
    if (tuNgay) result = result.filter((n) => n.ngayTao >= tuNgay);
    if (denNgay) {
      const next = new Date(denNgay); next.setDate(next.getDate() + 1);
      result = result.filter((n) => n.ngayTao < next.toISOString());
    }

    result.sort((a, b) => {
      const av = String((a as unknown as Record<string, unknown>)[sortKey] ?? "");
      const bv = String((b as unknown as Record<string, unknown>)[sortKey] ?? "");
      return sortDir === "asc" ? av.localeCompare(bv, "vi") : bv.localeCompare(av, "vi");
    });

    return result as unknown as NRow[];
  }, [data, search, statusFilter, channelFilter, loaiFilter, tuNgay, denNgay, sortKey, sortDir]);

  const displayData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns = useMemo((): ColumnDef<NRow>[] => [
    {
      key: "thongBaoId",
      header: "ID",
      width: "w-16",
      render: (v) => (
        <span className="font-mono text-xs text-secondary-400">#{String(v)}</span>
      ),
    },
    {
      key: "tenKhachHang",
      header: "Khách hàng",
      sortable: true,
      render: (v, row) => {
        const n = row as ThongBaoRow;
        return (
          <div className="flex flex-col gap-0.5 min-w-0">
            <Link
              href={`/customers/${n.khachHangId}`}
              className="truncate font-medium text-secondary-900 hover:text-primary-600 hover:underline"
            >
              {String(v)}
            </Link>
            <span className="truncate text-xs text-secondary-400">{n.emailKhachHang}</span>
          </div>
        );
      },
    },
    {
      key: "loaiThongBao",
      header: "Loại",
      render: (v) => (
        <span className="text-xs text-secondary-600">
          {LOAI_LABEL[v as NotificationLoai] ?? String(v)}
        </span>
      ),
    },
    {
      key: "tieuDe",
      header: "Tiêu đề",
      tooltip: (v) => String(v),
      render: (v) => (
        <span className="block max-w-[200px] truncate text-sm text-secondary-800">
          {String(v)}
        </span>
      ),
    },
    {
      key: "kenhGui",
      header: "Kênh",
      render: (v) => <NotificationChannelBadge channel={v as NotificationChannel} size="sm" />,
    },
    {
      key: "trangThai",
      header: "Trạng thái",
      render: (v) => <NotificationStatusBadge status={v as NotificationStatus} size="sm" />,
    },
    {
      key: "daDoc",
      header: "Đã đọc",
      render: (v, row) => {
        const n = row as ThongBaoRow;
        if (n.kenhGui !== "Push") return <span className="text-secondary-300">—</span>;
        return v ? (
          <span className="text-xs text-success-600 font-medium">✓</span>
        ) : (
          <span className="text-xs text-secondary-400">—</span>
        );
      },
    },
    {
      key: "entityLienQuan",
      header: "Liên kết",
      tooltip: (v, row) => {
        const n = row as ThongBaoRow;
        return v && n.entityLienQuanId ? `${String(v)} #${n.entityLienQuanId}` : "";
      },
      render: (v, row) => {
        const n = row as ThongBaoRow;
        if (!v || !n.entityLienQuanId) return <span className="text-secondary-300">—</span>;
        const href = ENTITY_HREF[String(v)]?.(n.entityLienQuanId);
        return href ? (
          <Link href={href} className="text-xs text-primary-600 hover:underline">
            {String(v)} #{n.entityLienQuanId}
          </Link>
        ) : (
          <span className="text-xs text-secondary-500">{String(v)} #{n.entityLienQuanId}</span>
        );
      },
    },
    {
      key: "ngayTao",
      header: "Ngày tạo",
      sortable: true,
      tooltip: (v) => formatDatetime(String(v)),
      width: "w-36",
      render: (v) => (
        <span className="block max-w-[8rem] truncate text-xs text-secondary-500">
          {formatDatetime(String(v))}
        </span>
      ),
    },
    {
      key: "_actions",
      header: "",
      align: "right",
      width: "w-24",
      render: (_, row) => {
        const n = row as ThongBaoRow;
        return (
          <RowActions>
            {/* Xem chi tiết */}
            <Tooltip content="Xem chi tiết" placement="top">
              <button
                type="button"
                aria-label="Xem chi tiết"
                onClick={() => setDrawerNotif(n)}
                className={ROW_BTN_GHOST}
              >
                <DocumentMagnifyingGlassIcon className="h-4 w-4" aria-hidden />
              </button>
            </Tooltip>

            {/* Hủy — chỉ ChuaGui */}
            {n.trangThai === "ChuaGui" && (
              <Tooltip content="Hủy thông báo" placement="top">
                <button
                  type="button"
                  aria-label="Hủy thông báo"
                  onClick={() => handleCancel(n.thongBaoId)}
                  className={ROW_BTN_ERROR}
                >
                  <XCircleIcon className="h-4 w-4" aria-hidden />
                </button>
              </Tooltip>
            )}

            {/* Gửi lại — chỉ ThatBai */}
            {n.trangThai === "ThatBai" && (
              <Tooltip content="Gửi lại" placement="top">
                <button
                  type="button"
                  aria-label="Gửi lại"
                  onClick={() => handleRetry(n.thongBaoId)}
                  className={ROW_BTN_WARNING}
                >
                  <ArrowPathIcon className="h-4 w-4" aria-hidden />
                </button>
              </Tooltip>
            )}
          </RowActions>
        );
      },
    },
  ], [handleCancel, handleRetry]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <DataTable<NRow>
        data={displayData}
        columns={columns}
        keyField="thongBaoId"
        // Search
        searchQuery={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Tìm tên KH, email, tiêu đề..."
        // Sort
        sortKey={sortKey}
        sortDir={sortDir}
        onSortChange={handleSortChange}
        // Pagination
        page={page}
        pageSize={pageSize}
        totalRows={filteredData.length}
        pageSizeOptions={[10, 20, 50, 100]}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        // Empty
        emptyIcon={<BellIcon className="w-12 h-12" />}
        emptyMessage="Không có thông báo nào phù hợp với bộ lọc."
        // Row highlight: đỏ nhạt cho ThatBai
        rowClassName={(row) =>
          (row as ThongBaoRow).trangThai === "ThatBai" ? "bg-error-50/40" : undefined
        }
        // Toolbar filters
        toolbarActions={
          <div className="flex flex-wrap items-center gap-2">
            <FilterDropdown
              label="Kênh gửi"
              options={CHANNEL_OPTIONS}
              selected={channelFilter}
              onChange={handleChannelChange}
            />
            <FilterDropdown
              label="Trạng thái"
              options={STATUS_OPTIONS}
              selected={statusFilter}
              onChange={handleStatusChange}
            />
            <FilterDropdown
              label="Loại"
              options={LOAI_OPTIONS}
              selected={loaiFilter}
              onChange={handleLoaiChange}
            />
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-secondary-500 shrink-0">Từ</span>
              <div className="w-36">
                <DateInput value={tuNgay} onChange={handleTuNgay} placeholder="DD/MM/YYYY" size="sm" />
              </div>
              <span className="text-xs font-medium text-secondary-500 shrink-0">đến</span>
              <div className="w-36">
                <DateInput value={denNgay} onChange={handleDenNgay} placeholder="DD/MM/YYYY" size="sm" />
              </div>
            </div>
            <ExportButton onExport={handleExport} isExporting={isExporting} scope="thông báo" />
          </div>
        }
      />

      <NotificationDetailDrawer
        notification={drawerNotif}
        onClose={() => setDrawerNotif(null)}
      />
    </>
  );
}
