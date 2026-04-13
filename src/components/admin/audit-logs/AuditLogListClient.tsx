"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { EyeIcon, InboxIcon } from "@heroicons/react/24/outline";
import { DataTable } from "@/src/components/admin/DataTable";
import type { ColumnDef, SortDir } from "@/src/components/admin/DataTable";
import { AdminDateRangePicker } from "@/src/components/admin/shared/AdminDateRangePicker";
import type { DateRange } from "@/src/components/admin/shared/AdminDateRangePicker";
import { FilterDropdown } from "@/src/components/admin/FilterDropdown";
import { ExportButton } from "@/src/components/admin/shared/ExportButton";
import type { ExportFormat } from "@/src/components/admin/shared/ExportButton";
import { Avatar } from "@/src/components/ui/Avatar";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { AuditActionBadge } from "@/src/components/admin/audit-logs/AuditActionBadge";
import { AuditEntityBadge } from "@/src/components/admin/audit-logs/AuditEntityBadge";
import { AuditLogDetailModal } from "@/src/components/admin/audit-logs/AuditLogDetailModal";
import { getAuditLogs } from "@/src/services/audit-log.service";
import type {
  AuditLogEntry,
  AuditActionType,
  AuditEntityType,
} from "@/src/types/audit-log.types";

// ─── Types ────────────────────────────────────────────────────────────────────

type AuditRow = AuditLogEntry & Record<string, unknown>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// ─── Filter option lists ───────────────────────────────────────────────────────

const ENTITY_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "DonHang",   label: "Đơn hàng" },
  { value: "SanPham",   label: "Sản phẩm" },
  { value: "PhienBan",  label: "Phiên bản SP" },
  { value: "KhachHang", label: "Khách hàng" },
  { value: "NhanVien",  label: "Nhân viên" },
  { value: "TonKho",    label: "Tồn kho" },
  { value: "NhapXuat",  label: "Nhập/Xuất kho" },
  { value: "KhuyenMai", label: "Khuyến mãi" },
  { value: "MaGiamGia", label: "Mã giảm giá" },
  { value: "FlashSale", label: "Flash Sale" },
  { value: "DanhGia",   label: "Đánh giá" },
  { value: "Ticket",    label: "Ticket" },
  { value: "CaiDat",    label: "Cài đặt" },
  { value: "PhanQuyen", label: "Phân quyền" },
];

const ACTION_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "TaoMoi",       label: "Tạo mới" },
  { value: "CapNhat",      label: "Cập nhật" },
  { value: "Xoa",          label: "Xóa" },
  { value: "DoiTrangThai", label: "Đổi trạng thái" },
  { value: "XuatFile",     label: "Xuất file" },
  { value: "NhapFile",     label: "Nhập file" },
  { value: "DangNhap",     label: "Đăng nhập" },
  { value: "DangXuat",     label: "Đăng xuất" },
];

const ROLE_LABEL: Record<string, string> = {
  admin:     "Admin",
  staff:     "Nhân viên",
  warehouse: "Kho",
  cskh:      "CSKH",
  system:    "Hệ thống",
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * AuditLogListClient — full-page audit log browser.
 *
 * Uses DataTable's built-in search (single search input, no duplication).
 * Filters (entity type, action type, date range) and export live in
 * DataTable's `toolbarActions` slot.
 */
export function AuditLogListClient() {
  // ── Filter & search state ──────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [entityTypeFilter, setEntityTypeFilter] = useState<string[]>([]);
  const [actionTypeFilter, setActionTypeFilter] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null });

  // ── Sort & pagination state ────────────────────────────────────────────────
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // ── Data state ────────────────────────────────────────────────────────────
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // ── Detail modal state ────────────────────────────────────────────────────
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);

  // ── Export state ──────────────────────────────────────────────────────────
  const [isExporting, setIsExporting] = useState(false);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [search, entityTypeFilter, actionTypeFilter, dateRange]);

  // Fetch data whenever any filter / page / sort changes
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    getAuditLogs({
      q: search,
      entityType: entityTypeFilter as AuditEntityType[],
      actionType: actionTypeFilter as AuditActionType[],
      from: dateRange.from?.toISOString().slice(0, 10),
      to: dateRange.to?.toISOString().slice(0, 10),
      page,
      pageSize,
    }).then((result) => {
      if (!cancelled) {
        setEntries(result.data);
        setTotal(result.total);
        setIsLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [search, entityTypeFilter, actionTypeFilter, dateRange, page, pageSize]);

  // ── Export handler ────────────────────────────────────────────────────────
  const handleExport = useCallback(async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      // Replace with: window.location.href = `/admin/audit-logs/export?format=${format}&...`
      await new Promise((resolve) => setTimeout(resolve, 800));
    } finally {
      setIsExporting(false);
    }
  }, []);

  // ── Sort handler ──────────────────────────────────────────────────────────
  const handleSortChange = useCallback((key: string, dir: SortDir) => {
    setSortKey(key);
    setSortDir(dir);
  }, []);

  // ── Column definitions ────────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<AuditRow>[]>(
    () => [
      // ── Thời gian ────────────────────────────────────────────────────────
      {
        key: "createdAt",
        header: "Thời gian",
        width: "w-40",
        sortable: true,
        render: (value) => (
          <span className="font-mono text-xs text-secondary-600 whitespace-nowrap tabular-nums">
            {formatDateTime(value as string)}
          </span>
        ),
      },

      // ── Nhân viên — Avatar + tên (Link) + role badge ──────────────────────
      {
        key: "actorName",
        header: "Nhân viên",
        width: "w-48",
        render: (_, row) => {
          const hasLink = row.actorId !== null;
          const roleDisplay = ROLE_LABEL[row.actorRole as string] ?? (row.actorRole as string);
          const tooltipContent = `${roleDisplay}${row.actorId ? ` · ID: ${row.actorId as number}` : ""}`;

          return (
            <div className="flex items-center gap-2 min-w-0">
              <Avatar
                src={row.actorAvatarUrl as string | undefined}
                name={row.actorName as string}
                size="xs"
              />
              <div className="min-w-0 space-y-0.5">
                {hasLink ? (
                  <Tooltip content={tooltipContent} placement="top">
                    <Link
                      href={`/employees/${row.actorId as number}`}
                      className="block truncate text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline focus-visible:outline-none focus-visible:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {row.actorName as string}
                    </Link>
                  </Tooltip>
                ) : (
                  <span className="block truncate text-sm font-medium text-secondary-500 italic">
                    {row.actorName as string}
                  </span>
                )}
                <Badge variant="default" size="sm">
                  {roleDisplay}
                </Badge>
              </div>
            </div>
          );
        },
      },

      // ── Hành động — semantic badge ────────────────────────────────────────
      {
        key: "actionType",
        header: "Hành động",
        width: "w-36",
        align: "center",
        render: (value) => (
          <AuditActionBadge actionType={value as AuditActionType} />
        ),
      },

      // ── Đối tượng — entity badge + label (truncated + tooltip) ───────────
      {
        key: "entityType",
        header: "Đối tượng",
        width: "w-44",
        render: (_, row) => (
          <div className="flex flex-col gap-1 min-w-0">
            <AuditEntityBadge
              entityType={row.entityType as AuditEntityType}
              entityId={row.entityId as string}
              linkable
            />
            <Tooltip
              content={row.entityLabel as string}
              placement="top"
              anchorToContent
            >
              <p className="truncate text-xs text-secondary-500 max-w-[160px]">
                {row.entityLabel as string}
              </p>
            </Tooltip>
          </div>
        ),
      },

      // ── Mô tả — truncated with tooltip ───────────────────────────────────
      {
        key: "actionDetail",
        header: "Mô tả",
        width: "w-80",
        render: (value) => (
          <Tooltip content={value as string} placement="top" anchorToContent>
            <p className="truncate text-sm text-secondary-600 max-w-xs">
              {value as string}
            </p>
          </Tooltip>
        ),
      },

      // ── Địa chỉ IP ───────────────────────────────────────────────────────
      {
        key: "ipAddress",
        header: "Địa chỉ IP",
        width: "w-28",
        render: (value) =>
          value ? (
            <span className="font-mono text-xs text-secondary-500 tabular-nums">
              {value as string}
            </span>
          ) : (
            <span className="text-xs text-secondary-300">—</span>
          ),
      },

      // ── Chi tiết — direct button (không dùng RowActions dropdown) ─────────
      {
        key: "id",
        header: "",
        width: "w-24",
        align: "center",
        render: (_, row) => (
          <Button
            variant="ghost"
            size="xs"
            leftIcon={<EyeIcon className="h-3.5 w-3.5" />}
            onClick={() => setSelectedEntry(row as unknown as AuditLogEntry)}
          >
            Chi tiết
          </Button>
        ),
      },
    ],
    []
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <DataTable<AuditRow>
        columns={columns}
        data={entries as AuditRow[]}
        keyField="id"
        isLoading={isLoading}
        emptyMessage="Không có nhật ký nào phù hợp"
        emptyIcon={<InboxIcon className="h-10 w-10 text-secondary-300" />}
        // ── Search — DataTable's own input (single, no duplicate) ────────────
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm tên NV, đối tượng, mô tả…"
        // ── Filter controls in the toolbar right slot ─────────────────────────
        toolbarActions={
          <div className="flex flex-wrap items-center gap-2">
            <FilterDropdown
              label="Đối tượng"
              options={ENTITY_TYPE_OPTIONS}
              selected={entityTypeFilter}
              onChange={setEntityTypeFilter}
              searchable
            />
            <FilterDropdown
              label="Hành động"
              options={ACTION_TYPE_OPTIONS}
              selected={actionTypeFilter}
              onChange={setActionTypeFilter}
            />
            <AdminDateRangePicker
              value={dateRange}
              onChange={setDateRange}
            />
            <ExportButton
              onExport={handleExport}
              isExporting={isExporting}
              scope="nhật ký"
            />
          </div>
        }
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
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        tableLayout="fixed"
      />

      {/* Detail modal */}
      <AuditLogDetailModal
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
      />
    </>
  );
}
