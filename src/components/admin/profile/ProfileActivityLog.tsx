"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowRightEndOnRectangleIcon,
  ArrowLeftStartOnRectangleIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  PencilSquareIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { DataTable, type ColumnDef } from "@/src/components/admin/DataTable";
import { Badge } from "@/src/components/ui/Badge";
import type { AuditLogEntry, AuditActionType } from "@/src/types/employee.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProfileActivityLogProps {
  entries: AuditLogEntry[];
}

type AuditRow = AuditLogEntry & Record<string, unknown>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ACTION_META: Record<
  AuditActionType,
  {
    label: string;
    variant: "success" | "default" | "primary" | "warning" | "error";
    icon: ReactNode;
  }
> = {
  login:        { label: "Đăng nhập",       variant: "success", icon: <ArrowRightEndOnRectangleIcon className="h-3.5 w-3.5" /> },
  logout:       { label: "Đăng xuất",       variant: "default", icon: <ArrowLeftStartOnRectangleIcon className="h-3.5 w-3.5" /> },
  role_assign:  { label: "Gán vai trò",     variant: "primary", icon: <ShieldCheckIcon className="h-3.5 w-3.5" /> },
  role_remove:  { label: "Thu hồi vai trò", variant: "warning", icon: <ShieldExclamationIcon className="h-3.5 w-3.5" /> },
  profile_edit: { label: "Sửa hồ sơ",      variant: "default", icon: <PencilSquareIcon className="h-3.5 w-3.5" /> },
  report_view:  { label: "Xem báo cáo",     variant: "default", icon: <ChartBarIcon className="h-3.5 w-3.5" /> },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function ProfileActivityLog({ entries }: ProfileActivityLogProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return entries.slice(start, start + pageSize);
  }, [entries, page, pageSize]);

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
        width: "w-40",
        render: (_, row) => {
          const meta = ACTION_META[row.action as AuditActionType];
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
        tooltip: (_, row) => row.details as string,
        render: (_, row) => (
          <span className="text-sm text-secondary-600 line-clamp-1">
            {row.details as string}
          </span>
        ),
      },
      {
        key: "ipAddress",
        header: "Địa chỉ IP",
        width: "w-36",
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
    <DataTable
      data={pageData as AuditRow[]}
      columns={columns}
      keyField="id"
      page={page}
      pageSize={pageSize}
      pageSizeOptions={[10, 25, 50]}
      totalRows={entries.length}
      onPageChange={setPage}
      onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
      hidePagination={entries.length <= pageSize}
      searchPlaceholder="Tìm kiếm hoạt động…"
      emptyMessage="Chưa có lịch sử hoạt động."
    />
  );
}
