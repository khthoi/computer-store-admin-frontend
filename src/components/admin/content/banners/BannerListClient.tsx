"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PlusIcon, InboxIcon, PencilIcon, TrashIcon, Squares2X2Icon, ListBulletIcon } from "@heroicons/react/24/outline";
import { DataTable } from "@/src/components/admin/DataTable";
import type { ColumnDef, SortDir } from "@/src/components/admin/DataTable";
import { FilterDropdown } from "@/src/components/admin/FilterDropdown";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import { PromotionsBannerLayout } from "./PromotionsBannerLayout";
import { getBanners, deleteBanner } from "@/src/services/content.service";
import type { Banner, BannerPosition, BannerStatus } from "@/src/types/content.types";

// ─── Types ────────────────────────────────────────────────────────────────────

type BannerRow = Banner & Record<string, unknown>;
type ViewMode = "list" | "layout";

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<BannerStatus, { label: string; variant: "success" | "warning" | "error" | "default" | "info" }> = {
  active:    { label: "Đang hiển thị", variant: "success" },
  scheduled: { label: "Lên lịch",      variant: "info" },
  draft:     { label: "Nháp",          variant: "default" },
  ended:     { label: "Đã kết thúc",   variant: "error" },
};

export const POSITION_LABELS: Record<BannerPosition, string> = {
  homepage_hero:        "Hero trang chủ",
  homepage_hero_slider: "Hero Slider",
  homepage_small:       "4 banner nhỏ",
  side_banner:          "Side Banner",
  promotions_banner:    "Banner Khuyến mãi",
};

const STATUS_OPTIONS = [
  { value: "active",    label: "Đang hiển thị" },
  { value: "scheduled", label: "Lên lịch" },
  { value: "draft",     label: "Nháp" },
  { value: "ended",     label: "Đã kết thúc" },
];

const POSITION_OPTIONS = Object.entries(POSITION_LABELS).map(([value, label]) => ({ value, label }));

// ─── Component ────────────────────────────────────────────────────────────────

export function BannerListClient() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [banners, setBanners] = useState<Banner[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [positionFilter, setPositionFilter] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortKey, setSortKey] = useState("sortOrder");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => { setPage(1); }, [search, statusFilter, positionFilter]);

  useEffect(() => {
    if (viewMode !== "list") return;
    let cancelled = false;
    setIsLoading(true);
    getBanners({
      q: search,
      status: statusFilter as BannerStatus[],
      position: positionFilter as BannerPosition[],
      page, pageSize,
    }).then((res) => {
      if (!cancelled) { setBanners(res.data); setTotal(res.total); setIsLoading(false); }
    });
    return () => { cancelled = true; };
  }, [viewMode, search, statusFilter, positionFilter, page, pageSize]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteBanner(deleteTarget.id);
      setBanners((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      setTotal((prev) => prev - 1);
      setDeleteTarget(null);
    } finally { setIsDeleting(false); }
  }, [deleteTarget]);

  const columns: ColumnDef<BannerRow>[] = [
    {
      key: "imageUrl",
      header: "Ảnh",
      width: "w-24",
      render: (value, row) => (
        <div className="h-12 w-20 overflow-hidden rounded-lg border border-secondary-100 bg-secondary-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value as string} alt={row.title as string} className="h-full w-full object-cover" />
        </div>
      ),
    },
    {
      key: "title",
      header: "Tiêu đề",
      sortable: true,
      render: (value, row) => (
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="font-medium text-secondary-800 truncate">{value as string}</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-secondary-400">
              {POSITION_LABELS[row.position as BannerPosition]}
            </span>
            {(row.badge as string) && (
              <span
                className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                style={{ backgroundColor: (row.badgeColor as string) ?? "#ef4444", color: (row.badgeTextColor as string) ?? "#fff" }}
              >
                {row.badge as string}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      width: "w-36",
      align: "center",
      render: (value) => {
        const cfg = STATUS_CONFIG[value as BannerStatus];
        return <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>;
      },
    },
    {
      key: "sortOrder",
      header: "Thứ tự",
      width: "w-32",
      align: "center",
      sortable: true,
      render: (value) => <span className="text-sm text-secondary-600">{value as number}</span>,
    },
    {
      key: "clickCount",
      header: "Click",
      width: "w-24",
      align: "right",
      render: (value) => (
        <span className="tabular-nums text-sm text-secondary-600">
          {(value as number).toLocaleString("vi-VN")}
        </span>
      ),
    },
    {
      key: "id",
      header: "",
      width: "w-32",
      align: "center",
      render: (_, row) => (
        <div className="flex items-center gap-1 justify-center">
          <Tooltip content="Chỉnh sửa" placement="top">
            <Link href={`/content/banners/${row.id as string}/edit`}>
              <Button variant="ghost" size="xs"><PencilIcon className="h-3.5 w-3.5" /></Button>
            </Link>
          </Tooltip>
          <Tooltip content="Xóa" placement="top">
            <Button variant="ghost" size="xs" className="text-error-500 hover:bg-error-50"
              onClick={(e) => { e.stopPropagation(); setDeleteTarget(row as unknown as Banner); }}>
              <TrashIcon className="h-3.5 w-3.5" />
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* View mode toggle */}
      <div className="mb-4 flex items-center gap-2">
        <div className="flex rounded-lg border border-secondary-200 bg-white p-1 gap-1">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={[
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              viewMode === "list"
                ? "bg-primary-600 text-white shadow-sm"
                : "text-secondary-600 hover:bg-secondary-100",
            ].join(" ")}
          >
            <ListBulletIcon className="h-4 w-4" />
            Danh sách
          </button>
          <button
            type="button"
            onClick={() => setViewMode("layout")}
            className={[
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              viewMode === "layout"
                ? "bg-primary-600 text-white shadow-sm"
                : "text-secondary-600 hover:bg-secondary-100",
            ].join(" ")}
          >
            <Squares2X2Icon className="h-4 w-4" />
            Layout Khuyến mãi
          </button>
        </div>
      </div>

      {viewMode === "layout" ? (
        <PromotionsBannerLayout />
      ) : (
        <DataTable<BannerRow>
          columns={columns}
          data={banners as BannerRow[]}
          keyField="id"
          isLoading={isLoading}
          emptyMessage="Chưa có banner nào"
          emptyIcon={<InboxIcon className="h-10 w-10 text-secondary-300" />}
          searchQuery={search}
          onSearchChange={setSearch}
          searchPlaceholder="Tìm tiêu đề banner..."
          toolbarActions={
            <div className="flex flex-wrap items-center gap-2">
              <FilterDropdown label="Trạng thái" options={STATUS_OPTIONS} selected={statusFilter} onChange={setStatusFilter} />
              <FilterDropdown label="Vị trí" options={POSITION_OPTIONS} selected={positionFilter} onChange={setPositionFilter} />
              <Link href="/content/banners/create">
                <Button size="sm" leftIcon={<PlusIcon className="h-4 w-4" />}>Thêm banner</Button>
              </Link>
            </div>
          }
          sortKey={sortKey}
          sortDir={sortDir}
          onSortChange={(key, dir) => { setSortKey(key); setSortDir(dir); }}
          page={page}
          pageSize={pageSize}
          totalRows={total}
          pageSizeOptions={[10, 20, 50]}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
          tableLayout="fixed"
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Xóa banner"
        description={`Bạn có chắc muốn xóa banner "${deleteTarget?.title}"?`}
        confirmLabel="Xóa"
        variant="danger"
      />
    </>
  );
}
