"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowRightEndOnRectangleIcon,
  ArrowLeftStartOnRectangleIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  PencilSquareIcon,
  ChartBarIcon,
  KeyIcon,
  CameraIcon,
  UserCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { DataTable, type ColumnDef } from "@/src/components/admin/DataTable";
import { FilterDropdown, type FilterOption } from "@/src/components/admin/FilterDropdown";
import { Badge } from "@/src/components/ui/Badge";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { getEmployeeAuditLogs } from "@/src/services/employee.service";
import type { AuditLogEntry, AuditActionType } from "@/src/types/employee.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EmployeeActivityTableProps {
  employeeId: string;
}

type AuditRow = AuditLogEntry & Record<string, unknown>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 25, 50, 75];

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type ActionMeta = { label: string; variant: "success" | "default" | "primary" | "warning" | "error"; icon: ReactNode };

const ACTION_META: Record<AuditActionType, ActionMeta> = {
  login_success:      { label: "Đăng nhập",       variant: "success", icon: <ArrowRightEndOnRectangleIcon className="h-3.5 w-3.5" /> },
  login_failed:       { label: "ĐN thất bại",      variant: "error",   icon: <ExclamationCircleIcon className="h-3.5 w-3.5" /> },
  logout:             { label: "Đăng xuất",        variant: "default", icon: <ArrowLeftStartOnRectangleIcon className="h-3.5 w-3.5" /> },
  profile_edit:       { label: "Sửa hồ sơ",        variant: "default", icon: <PencilSquareIcon className="h-3.5 w-3.5" /> },
  password_requested: { label: "Yêu cầu đổi MK",   variant: "warning", icon: <KeyIcon className="h-3.5 w-3.5" /> },
  password_changed:   { label: "Đổi mật khẩu",     variant: "primary", icon: <KeyIcon className="h-3.5 w-3.5" /> },
  avatar_changed:     { label: "Cập nhật ảnh",      variant: "default", icon: <CameraIcon className="h-3.5 w-3.5" /> },
  role_changed:       { label: "Đổi vai trò",       variant: "primary", icon: <ShieldCheckIcon className="h-3.5 w-3.5" /> },
  status_changed:     { label: "Đổi trạng thái",    variant: "warning", icon: <UserCircleIcon className="h-3.5 w-3.5" /> },
  login:              { label: "Đăng nhập",         variant: "success", icon: <ArrowRightEndOnRectangleIcon className="h-3.5 w-3.5" /> },
  role_assign:        { label: "Gán vai trò",        variant: "primary", icon: <ShieldCheckIcon className="h-3.5 w-3.5" /> },
  role_remove:        { label: "Thu hồi vai trò",    variant: "warning", icon: <ShieldExclamationIcon className="h-3.5 w-3.5" /> },
  report_view:        { label: "Xem báo cáo",        variant: "default", icon: <ChartBarIcon className="h-3.5 w-3.5" /> },
};

const FALLBACK_META: ActionMeta = { label: "Hoạt động", variant: "default", icon: <ChartBarIcon className="h-3.5 w-3.5" /> };

const ACTION_FILTER_OPTIONS: FilterOption[] = (
  Object.entries(ACTION_META) as [AuditActionType, ActionMeta][]
)
  .filter(([key], _, arr) => arr.findIndex(([, m]) => m.label === ACTION_META[key].label) === arr.findIndex(([k]) => k === key))
  .map(([value, meta]) => ({ value, label: meta.label }));

// ─── Component ────────────────────────────────────────────────────────────────

export function EmployeeActivityTable({ employeeId }: EmployeeActivityTableProps) {
  const [rows, setRows] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string[]>([]);

  const isFirstRender = useRef(true);
  const prevSearchRef = useRef("");
  const nonPageChangedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setLoading(true);
      void getEmployeeAuditLogs(employeeId, { page: 1, limit: DEFAULT_PAGE_SIZE }).then((res) => {
        setRows(res.data);
        setTotal(res.total);
      }).finally(() => setLoading(false));
      return;
    }

    const isSearchChange = search !== prevSearchRef.current;
    prevSearchRef.current = search;
    const isNonPage = nonPageChangedRef.current;
    nonPageChangedRef.current = false;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      if (isNonPage) setLoading(true);
      try {
        const res = await getEmployeeAuditLogs(employeeId, {
          page,
          limit: pageSize,
          q: search || undefined,
          action: actionFilter.length ? actionFilter : undefined,
        });
        setRows(res.data);
        setTotal(res.total);
      } catch { /* keep existing rows */ }
      finally { setLoading(false); }
    }, isSearchChange ? 300 : 0);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [employeeId, page, pageSize, search, actionFilter]);

  const handleSearch = useCallback((q: string) => {
    nonPageChangedRef.current = true;
    setSearch(q);
    setPage(1);
  }, []);

  const handleActionFilter = useCallback((selected: string[]) => {
    nonPageChangedRef.current = true;
    setActionFilter(selected);
    setPage(1);
  }, []);

  const handlePageSizeChange = useCallback((s: number) => {
    nonPageChangedRef.current = true;
    setPageSize(s);
    setPage(1);
  }, []);

  const columns: ColumnDef<AuditRow>[] = useMemo(
    () => [
      {
        key: "createdAt",
        header: "Thời gian",
        width: "w-40",
        render: (_, row) => (
          <span className="text-sm text-secondary-500">
            {formatDateTime(row.createdAt as string)}
          </span>
        ),
      },
      {
        key: "action",
        header: "Hành động",
        width: "w-50",
        align: "center",
        render: (_, row) => {
          const meta = ACTION_META[row.action as AuditActionType] ?? FALLBACK_META;
          return (
            <Badge variant={meta.variant} size="sm">
              <span className="flex items-center gap-1">
                {meta.icon}
                {meta.label}
              </span>
            </Badge>
          );
        },
      },
      {
        key: "details",
        header: "Chi tiết",
        render: (_, row) => (
          <Tooltip
            content={row.details as string}
            multiline
            maxWidth="360px"
            placement="top"
            anchorToContent
          >
            <span className="text-sm text-secondary-600 line-clamp-1 cursor-default">
              {row.details as string}
            </span>
          </Tooltip>
        ),
      },
      {
        key: "ipAddress",
        header: "Địa chỉ IP",
        width: "w-36",
        align: "right",
        render: (_, row) => (
          <span className="font-mono text-xs text-secondary-400">
            {row.ipAddress as string}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70">
          <ArrowPathIcon className="h-5 w-5 animate-spin text-primary-600" aria-hidden="true" />
        </div>
      )}
      <DataTable
        data={rows as AuditRow[]}
        columns={columns}
        keyField="id"
        page={page}
        pageSize={pageSize}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        totalRows={total}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        hidePagination={total <= pageSize}
        searchPlaceholder="Tìm theo chi tiết…"
        onSearchChange={handleSearch}
        toolbarActions={
          <FilterDropdown
            label="Hành động"
            options={ACTION_FILTER_OPTIONS}
            selected={actionFilter}
            onChange={handleActionFilter}
          />
        }
        emptyMessage={
          search || actionFilter.length > 0
            ? "Không tìm thấy kết quả phù hợp."
            : "Chưa có dữ liệu hoạt động."
        }
      />
    </div>
  );
}
