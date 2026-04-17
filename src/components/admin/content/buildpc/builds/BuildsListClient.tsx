"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { EyeIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { Alert } from "@/src/components/ui/Alert";
import { DataTable, type ColumnDef } from "@/src/components/admin/DataTable";
import { fetchBuilds } from "@/src/services/buildpc.service";
import { BuildDetailDrawer } from "./BuildDetailDrawer";
import type { BuildPCBuild, BuildStatus } from "@/src/types/buildpc.types";

// ─── Style maps ───────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<BuildStatus, { variant: "default" | "success"; label: string }> = {
  draft:    { variant: "default",  label: "Nháp" },
  complete: { variant: "success",  label: "Hoàn chỉnh" },
};

const STATUS_FILTER_OPTIONS: { value: BuildStatus | "all"; label: string }[] = [
  { value: "all",      label: "Tất cả"     },
  { value: "draft",    label: "Nháp"       },
  { value: "complete", label: "Hoàn chỉnh" },
];

// ─── Column definitions ───────────────────────────────────────────────────────

function buildColumns(onView: (b: BuildPCBuild) => void): ColumnDef<BuildPCBuild>[] {
  return [
    {
      key: "tenBuild",
      header: "Tên build",
      width: "w-56",
      render: (_, row) => (
        <Tooltip
          content={
            <div className="max-w-xs space-y-1">
              <p className="font-semibold">{row.tenBuild}</p>
              {row.moTa && <p className="text-xs text-secondary-300">{row.moTa}</p>}
            </div>
          }
          placement="top"
        >
          <div className="max-w-[200px]">
            <p className="truncate text-sm font-semibold text-secondary-800">{row.tenBuild}</p>
            {row.moTa && (
              <p className="truncate text-[11px] text-secondary-400">{row.moTa}</p>
            )}
          </div>
        </Tooltip>
      ),
    },
    {
      key: "tenNguoiDung",
      header: "Khách hàng",
      width: "w-44",
      render: (_, row) => (
        <Tooltip
          content={
            <div className="space-y-0.5">
              <p className="font-medium">{row.tenNguoiDung}</p>
              <p className="text-xs text-secondary-300">{row.email}</p>
            </div>
          }
          placement="top"
        >
          <div className="max-w-[160px]">
            <Link
              href={`/customers/${row.customerId}`}
              className="block truncate text-sm font-medium text-primary-600 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {row.tenNguoiDung}
            </Link>
            <p className="truncate text-[11px] text-secondary-400">{row.email}</p>
          </div>
        </Tooltip>
      ),
    },
    {
      key: "tongGia",
      header: "Tổng giá",
      align: "right",
      width: "w-36",
      render: (v) => (
        <span className="text-sm font-semibold text-secondary-800 whitespace-nowrap">
          {(v as number).toLocaleString("vi-VN")} ₫
        </span>
      ),
    },
    {
      key: "trangThai",
      header: "Trạng thái",
      align: "center",
      width: "w-32",
      render: (v, row) => {
        const cfg = STATUS_BADGE[v as BuildStatus];
        return (
          <div className="flex items-center justify-center gap-1.5">
            <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
            {row.isPublic && (
              <Badge variant="primary" size="sm">Công khai</Badge>
            )}
          </div>
        );
      },
    },
    {
      key: "soLuotXem",
      header: "Xem / Clone",
      align: "center",
      width: "w-28",
      render: (_, row) => (
        <span className="text-xs text-secondary-500 tabular-nums">
          {row.soLuotXem ?? 0} / {row.soLuotClone ?? 0}
        </span>
      ),
    },
    {
      key: "ngayCapNhat",
      header: "Cập nhật",
      align: "center",
      width: "w-28",
      render: (v) => (
        <span className="text-[11px] text-secondary-400 whitespace-nowrap">
          {new Date(v as string).toLocaleDateString("vi-VN")}
        </span>
      ),
    },
    {
      key: "id",
      header: "",
      align: "center",
      width: "w-12",
      render: (_, row) => (
        <Tooltip content="Xem chi tiết" placement="top">
          <Button variant="ghost" size="xs" onClick={() => onView(row)}>
            <EyeIcon className="h-4 w-4" />
          </Button>
        </Tooltip>
      ),
    },
  ];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BuildsListClient() {
  const [builds, setBuilds]   = useState<BuildPCBuild[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState<BuildStatus | "all">("all");
  const [page, setPage]                 = useState(1);
  const [pageSize, setPageSize]         = useState(10);
  const [selected, setSelected]         = useState<BuildPCBuild | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchBuilds()
      .then(setBuilds)
      .catch(() => setError("Không thể tải danh sách build."))
      .finally(() => setLoading(false));
  }, []);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const filtered = useMemo(() =>
    builds.filter((b) => {
      const matchStatus = statusFilter === "all" || b.trangThai === statusFilter;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        b.tenBuild.toLowerCase().includes(q) ||
        b.tenNguoiDung.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    }),
    [builds, search, statusFilter]
  );

  const columns = useMemo(() => buildColumns(setSelected), []);

  const toolbarActions = (
    <div className="flex items-center gap-1.5 rounded-lg border border-secondary-200 bg-white p-1">
      {STATUS_FILTER_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setStatusFilter(opt.value)}
          className={[
            "rounded px-3 py-1 text-xs font-medium transition-colors",
            statusFilter === opt.value
              ? "bg-primary-500 text-white"
              : "text-secondary-600 hover:bg-secondary-50",
          ].join(" ")}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="error">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Build đã lưu</h1>
        <p className="mt-1 text-sm text-secondary-500">
          Danh sách cấu hình Build PC mà khách hàng đã lưu từ storefront.
          Trạng thái <strong>Hoàn chỉnh + Công khai</strong> có thể được
          duyệt bởi người dùng khác.
        </p>
      </div>

      <DataTable<BuildPCBuild & Record<string, unknown>>
        data={filtered as (BuildPCBuild & Record<string, unknown>)[]}
        columns={columns}
        keyField="id"
        isLoading={loading}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm theo tên build, khách hàng, email…"
        toolbarActions={toolbarActions}
        page={page}
        pageSize={pageSize}
        totalRows={filtered.length}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        emptyMessage="Không tìm thấy build nào."
      />

      {/* Detail drawer */}
      <BuildDetailDrawer
        build={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
