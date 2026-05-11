"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
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
} from "@/src/components/admin/DataTable";
import { DateInput } from "@/src/components/ui/DateInput";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { FilterDropdown } from "@/src/components/admin/FilterDropdown";
import { ExportButton, type ExportFormat } from "@/src/components/admin/shared/ExportButton";
import { Alert } from "@/src/components/ui/Alert";
import { NotificationStatusBadge } from "@/src/components/admin/notifications/NotificationStatusBadge";
import { NotificationChannelBadge } from "@/src/components/admin/notifications/NotificationChannelBadge";
import { NotificationDetailDrawer } from "@/src/components/admin/notifications/NotificationDetailDrawer";
import {
  getNotifications,
  cancelNotification,
  retryNotification,
} from "@/src/services/notification.service";
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

function entityHref(entity: string, id: number, maGiaoDichNgoai?: string | null): string {
  switch (entity) {
    case "DonHang":   return `/orders/${id}`;
    case "GiaoDich":  return maGiaoDichNgoai
      ? `/orders/transactions?q=${encodeURIComponent(maGiaoDichNgoai)}`
      : `/orders/transactions`;
    case "HoanHang":  return `/orders/returns/${id}`;
    case "KhuyenMai": return `/promotions/${id}`;
    default:          return "#";
  }
}

function entityLabel(entity: string, id: number, maDonHang?: string | null, maGiaoDichNgoai?: string | null): string {
  switch (entity) {
    case "DonHang":   return maDonHang ?? `ĐH-${String(id).padStart(6, "0")}`;
    case "GiaoDich":  return maGiaoDichNgoai ?? `#${id}`;
    case "HoanHang":  return `#${id}`;
    case "KhuyenMai": return `#${id}`;
    default:          return `#${id}`;
  }
}

function entityTooltip(entity: string, id: number, maDonHang?: string | null, maGiaoDichNgoai?: string | null): string {
  switch (entity) {
    case "DonHang":   return `Đơn hàng: ${maDonHang ?? `#${id}`}`;
    case "GiaoDich":  return maGiaoDichNgoai
      ? `Giao dịch ngoài: ${maGiaoDichNgoai}`
      : `Giao dịch #${id}`;
    case "HoanHang":  return `Yêu cầu hoàn trả #${id}`;
    case "KhuyenMai": return `Khuyến mãi #${id}`;
    default:          return `${entity} #${id}`;
  }
}

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

// ─── Component ────────────────────────────────────────────────────────────────

export function NotificationHistoryTable() {
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

  // ── Data state ─────────────────────────────────────────────────────────────
  const [data,    setData]    = useState<ThongBaoRow[]>([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  // ── Drawer ─────────────────────────────────────────────────────────────────
  const [drawerNotif, setDrawerNotif] = useState<ThongBaoRow | null>(null);

  // ── Export ─────────────────────────────────────────────────────────────────
  const [isExporting, setIsExporting] = useState(false);
  function handleExport(format: ExportFormat) {
    setIsExporting(true);
    console.log("Export notifications as", format);
    setTimeout(() => setIsExporting(false), 1200);
  }

  // ── Search debounce ────────────────────────────────────────────────────────
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearchChange(q: string) {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setSearch(q);
      setPage(1);
    }, 300);
  }

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getNotifications({
        page,
        pageSize,
        kenhGui:      channelFilter as NotificationChannel[],
        trangThai:    statusFilter  as NotificationStatus[],
        loaiThongBao: loaiFilter    as NotificationLoai[],
        tuNgay:       tuNgay  || undefined,
        denNgay:      denNgay || undefined,
        q:            search  || undefined,
      });
      setData(result.data);
      setTotal(result.total);
    } catch {
      setError("Không thể tải danh sách thông báo.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, channelFilter, statusFilter, loaiFilter, tuNgay, denNgay, search]);

  useEffect(() => { loadData(); }, [loadData]);

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

  // ── Filter handlers ────────────────────────────────────────────────────────
  const handleStatusChange  = useCallback((v: string[]) => { setStatusFilter(v);  setPage(1); }, []);
  const handleChannelChange = useCallback((v: string[]) => { setChannelFilter(v); setPage(1); }, []);
  const handleLoaiChange    = useCallback((v: string[]) => { setLoaiFilter(v);    setPage(1); }, []);
  const handleTuNgay        = useCallback((v: string) => { setTuNgay(v);          setPage(1); }, []);
  const handleDenNgay       = useCallback((v: string) => { setDenNgay(v);         setPage(1); }, []);

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
      render: (v, row) => {
        const n = row as ThongBaoRow;
        return (
          <div className="flex flex-col gap-0.5 min-w-0">
            <Tooltip content={`Khách hàng: ${String(v)} — ${n.emailKhachHang}`} placement="top" anchorToContent>
              <Link
                href={`/customers/${n.khachHangId}`}
                className="truncate font-medium text-secondary-900 hover:text-primary-600 hover:underline"
              >
                {String(v)}
              </Link>
            </Tooltip>
            <span className="truncate text-xs text-secondary-400">{n.emailKhachHang}</span>
          </div>
        );
      },
    },
    {
      key: "loaiThongBao",
      header: "Loại",
      align: "center",
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
      align: "center",
      render: (v) => <NotificationChannelBadge channel={v as NotificationChannel} size="sm" />,
    },
    {
      key: "trangThai",
      header: "Trạng thái",
      align: "center",
      render: (v) => <NotificationStatusBadge status={v as NotificationStatus} size="sm" />,
    },
    {
      key: "daDoc",
      header: "Đã đọc",
      align: "center",
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
      render: (v, row) => {
        const n = row as ThongBaoRow;
        if (!v || !n.entityLienQuanId) return <span className="text-secondary-300">—</span>;
        const entity = String(v);
        const id = n.entityLienQuanId;
        const href = entityHref(entity, id, n.maGiaoDichNgoai);
        const label = entityLabel(entity, id, n.maDonHang, n.maGiaoDichNgoai);
        const tip = entityTooltip(entity, id, n.maDonHang, n.maGiaoDichNgoai);
        return (
          <Tooltip content={tip} placement="top">
            <Link
              href={href}
              className="block max-w-[120px] truncate text-xs text-primary-600 hover:underline"
            >
              {label}
            </Link>
          </Tooltip>
        );
      },
    },
    {
      key: "ngayTao",
      header: "Ngày tạo",
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
  if (error) {
    return (
      <div className="p-6">
        <Alert variant="error">{error}</Alert>
      </div>
    );
  }

  return (
    <>
      <DataTable<NRow>
        data={data as NRow[]}
        columns={columns}
        keyField="thongBaoId"
        isLoading={loading}
        // Search
        onSearchChange={handleSearchChange}
        searchPlaceholder="Tìm tên KH, email, tiêu đề..."
        // Pagination
        page={page}
        pageSize={pageSize}
        totalRows={total}
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
