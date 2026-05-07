"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Reorder, useDragControls } from "framer-motion";
import {
  PlusIcon, InboxIcon, PencilIcon, TrashIcon, Bars3Icon,
} from "@heroicons/react/24/outline";
import { DataTable } from "@/src/components/admin/DataTable";
import type { ColumnDef, SortDir } from "@/src/components/admin/DataTable";
import { FilterDropdown } from "@/src/components/admin/FilterDropdown";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import { useToast } from "@/src/components/ui/Toast";
import { PromotionsBannerLayout } from "./PromotionsBannerLayout";
import { getBanners, deleteBanner, reorderBanners } from "@/src/services/content.service";
import type { Banner, BannerPosition, BannerStatus } from "@/src/types/content.types";

// ─── Types ────────────────────────────────────────────────────────────────────

type BannerRow = Banner & Record<string, unknown>;

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

// Tab config — 5 positions, 4 separators
const TABS: { position: BannerPosition; label: string; draggable: boolean }[] = [
  { position: "homepage_hero",        label: "Hero trang chủ",    draggable: false },
  { position: "homepage_hero_slider", label: "Hero Slider",        draggable: true  },
  { position: "homepage_small",       label: "4 banner nhỏ",      draggable: true  },
  { position: "side_banner",          label: "Side Banner",        draggable: true  },
  { position: "promotions_banner",    label: "Banner Khuyến mãi", draggable: false },
];

// ─── Sortable row (drag tabs) ─────────────────────────────────────────────────

function SortableBannerRow({
  banner, index, onDelete,
}: {
  banner: Banner;
  index: number;
  onDelete: (b: Banner) => void;
}) {
  const controls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);
  const cfg = STATUS_CONFIG[banner.status];

  return (
    <Reorder.Item
      value={banner}
      dragControls={controls}
      dragListener={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      style={{ userSelect: "none", zIndex: isDragging ? 50 : "auto", position: "relative" }}
      animate={
        isDragging
          ? { scale: 1.015, boxShadow: "0 8px 28px rgba(0,0,0,0.10)" }
          : { scale: 1,     boxShadow: "0 0px  0px rgba(0,0,0,0.00)" }
      }
      className="group flex items-center gap-3 rounded-xl border border-secondary-200 bg-white px-4 py-3 transition-colors hover:border-secondary-300"
    >
      {/* Drag handle */}
      <span
        className="shrink-0 touch-none cursor-grab text-secondary-300 hover:text-secondary-500 active:cursor-grabbing"
        onPointerDown={(e) => { e.preventDefault(); controls.start(e); }}
        aria-label="Kéo để sắp xếp"
      >
        <Bars3Icon className="h-4 w-4" />
      </span>

      {/* Order badge */}
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary-100 text-xs font-bold text-secondary-500">
        {index}
      </span>

      {/* Thumbnail */}
      <div className="h-10 w-16 shrink-0 overflow-hidden rounded-lg border border-secondary-100 bg-secondary-100">
        {banner.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={banner.imageUrl} alt={banner.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-secondary-300 text-base">🖼</div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-semibold text-secondary-800 select-none">{banner.title}</p>
        <div className="mt-0.5 flex items-center gap-1.5">
          <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
          {banner.badge && (
            <span
              className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
              style={{ backgroundColor: banner.badgeColor ?? "#ef4444", color: banner.badgeTextColor ?? "#fff" }}
            >
              {banner.badge}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Tooltip content="Chỉnh sửa" placement="top">
          <Link href={`/content/banners/${banner.id}/edit`}>
            <Button variant="ghost" size="xs"><PencilIcon className="h-3.5 w-3.5" /></Button>
          </Link>
        </Tooltip>
        <Tooltip content="Xóa" placement="top">
          <Button variant="ghost" size="xs" color="danger"
            onClick={(e) => { e.stopPropagation(); onDelete(banner); }}
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </Button>
        </Tooltip>
      </div>
    </Reorder.Item>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function BannerListClient() {
  const { showToast } = useToast();

  // ── Tab state
  const [activeTab, setActiveTab] = useState<BannerPosition>("homepage_hero");
  const activeTabCfg = TABS.find((t) => t.position === activeTab)!;
  const isDragTab      = activeTabCfg.draggable;
  const isPromotionsTab = activeTab === "promotions_banner";
  const isHeroTab      = !isDragTab && !isPromotionsTab;

  // ── Hero DataTable state
  const [tableBanners, setTableBanners] = useState<Banner[]>([]);
  const [tableTotal, setTableTotal]     = useState(0);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [page, setPage]                 = useState(1);
  const [pageSize, setPageSize]         = useState(20);
  const [sortKey, setSortKey]           = useState("sortOrder");
  const [sortDir, setSortDir]           = useState<SortDir>("asc");

  // ── Drag tab state
  const [dragBanners, setDragBanners]   = useState<Banner[]>([]);
  const dragBannersRef                  = useRef<Banner[]>([]);
  const [isDirty, setIsDirty]           = useState(false);
  const [isSaving, setIsSaving]         = useState(false);

  // ── Shared
  const [isLoading, setIsLoading]       = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);
  const [isDeleting, setIsDeleting]     = useState(false);

  // ── Reset on tab change
  useEffect(() => {
    setIsDirty(false);
    setSearch("");
    setStatusFilter([]);
    setPage(1);
    setDragBanners([]);
    dragBannersRef.current = [];
  }, [activeTab]);

  // ── Reset page when Hero tab filters change
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  // ── Load: Hero tab (DataTable, server-side)
  useEffect(() => {
    if (!isHeroTab) return;
    let cancelled = false;
    setIsLoading(true);
    getBanners({
      q: search,
      status: statusFilter as BannerStatus[],
      position: [activeTab],
      page, pageSize,
    }).then((res) => {
      if (!cancelled) {
        setTableBanners(res.data);
        setTableTotal(res.total);
        setIsLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [isHeroTab, activeTab, search, statusFilter, page, pageSize]);

  // ── Load: drag tab (all for position, sorted by sortOrder)
  useEffect(() => {
    if (!isDragTab) return;
    let cancelled = false;
    setIsLoading(true);
    getBanners({ position: [activeTab], pageSize: 200 }).then((res) => {
      if (!cancelled) {
        const sorted = [...res.data].sort((a, b) => a.sortOrder - b.sortOrder);
        setDragBanners(sorted);
        dragBannersRef.current = sorted;
        setIsLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [isDragTab, activeTab]);

  // ── Reorder handler
  function handleReorder(newOrder: Banner[]) {
    setDragBanners(newOrder);
    dragBannersRef.current = newOrder;
    setIsDirty(true);
  }

  async function handleSaveOrder() {
    setIsSaving(true);
    try {
      await reorderBanners(activeTab, dragBannersRef.current.map((b) => b.id));
      setIsDirty(false);
      showToast("Đã lưu thứ tự banner", "success");
    } catch {
      showToast("Lưu thứ tự thất bại", "error");
    } finally {
      setIsSaving(false);
    }
  }

  // ── Delete handler
  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteBanner(deleteTarget.id);
      if (isDragTab) {
        const next = dragBannersRef.current.filter((b) => b.id !== deleteTarget.id);
        setDragBanners(next);
        dragBannersRef.current = next;
        setIsDirty(true);
      } else {
        setTableBanners((prev) => prev.filter((b) => b.id !== deleteTarget.id));
        setTableTotal((prev) => prev - 1);
      }
      setDeleteTarget(null);
      showToast(`Đã xóa banner "${deleteTarget.title}"`, "success");
    } catch {
      showToast("Xóa banner thất bại", "error");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, isDragTab, showToast]);

  // ── DataTable columns (Hero tab)
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
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-medium text-secondary-800 truncate">{value as string}</span>
            {activeTab === "homepage_hero" && (
              <Badge variant="info" size="sm">Duy nhất</Badge>
            )}
          </div>
          {(row.badge as string) && (
            <span
              className="inline-block w-fit rounded-full px-1.5 py-0.5 text-[10px] font-bold"
              style={{ backgroundColor: (row.badgeColor as string) ?? "#ef4444", color: (row.badgeTextColor as string) ?? "#fff" }}
            >
              {row.badge as string}
            </span>
          )}
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
      width: "w-24",
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
      width: "w-28",
      align: "center",
      render: (_, row) => (
        <div className="flex items-center gap-1 justify-center">
          <Tooltip content="Chỉnh sửa" placement="top">
            <Link href={`/content/banners/${row.id as string}/edit`}>
              <Button variant="ghost" size="xs"><PencilIcon className="h-3.5 w-3.5" /></Button>
            </Link>
          </Tooltip>
          <Tooltip content="Xóa" placement="top">
            <Button variant="ghost" size="xs" color="danger"
              onClick={(e) => { e.stopPropagation(); setDeleteTarget(row as unknown as Banner); }}>
              <TrashIcon className="h-3.5 w-3.5" />
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  // ── Shared add button
  const addBannerBtn = (
    <Link href="/content/banners/create">
      <Button size="sm" leftIcon={<PlusIcon className="h-4 w-4" />}>Thêm banner</Button>
    </Link>
  );

  return (
    <>
      {/* ── Tab bar */}
      <div className="mb-4 overflow-x-auto">
        <div className="flex w-fit min-w-full items-center gap-0 rounded-xl border border-secondary-200 bg-white p-1">
          {TABS.map((tab, idx) => (
            <div key={tab.position} className="flex items-center">
              {/* Separator */}
              {idx > 0 && (
                <div className="mx-1 h-5 w-px bg-secondary-200 shrink-0" />
              )}
              <button
                type="button"
                onClick={() => setActiveTab(tab.position)}
                className={[
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
                  activeTab === tab.position
                    ? "bg-primary-600 text-white shadow-sm"
                    : "text-secondary-600 hover:bg-secondary-100",
                ].join(" ")}
              >
                {tab.label}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Hero trang chủ (DataTable) */}
      {isHeroTab && (
        <DataTable<BannerRow>
          columns={columns}
          data={tableBanners as BannerRow[]}
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
              {addBannerBtn}
            </div>
          }
          sortKey={sortKey}
          sortDir={sortDir}
          onSortChange={(key, dir) => { setSortKey(key); setSortDir(dir); }}
          page={page}
          pageSize={pageSize}
          totalRows={tableTotal}
          pageSizeOptions={[10, 20, 50]}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
          tableLayout="fixed"
        />
      )}

      {/* ── Drag tabs (Hero Slider, 4 banner nhỏ, Side Banner) */}
      {isDragTab && (
        <div className="flex flex-col gap-3">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-secondary-500">
              {!isLoading && dragBanners.length > 0 && (
                <>
                  <span className="font-semibold text-secondary-700">{dragBanners.length}</span>
                  {" banner"}
                  {dragBanners.length > 1 && (
                    <span className="ml-1.5 text-secondary-400">
                      · kéo <Bars3Icon className="inline h-3 w-3" /> để sắp xếp
                    </span>
                  )}
                </>
              )}
            </p>
            <div className="flex items-center gap-2">
              {addBannerBtn}
              {isDirty && (
                <Button size="sm" onClick={handleSaveOrder} isLoading={isSaving}>
                  Lưu thứ tự
                </Button>
              )}
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
            </div>
          ) : dragBanners.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-secondary-200 py-16 text-center">
              <InboxIcon className="h-10 w-10 text-secondary-300" />
              <p className="text-sm text-secondary-500">Chưa có banner nào cho vị trí này</p>
            </div>
          ) : (
            <Reorder.Group
              axis="y"
              values={dragBanners}
              onReorder={handleReorder}
              as="div"
              className="flex flex-col gap-2"
              style={{ touchAction: "none" }}
            >
              {dragBanners.map((banner, idx) => (
                <SortableBannerRow
                  key={banner.id}
                  banner={banner}
                  index={idx + 1}
                  onDelete={setDeleteTarget}
                />
              ))}
            </Reorder.Group>
          )}
        </div>
      )}

      {/* ── Banner Khuyến mãi */}
      {isPromotionsTab && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-end">
            {addBannerBtn}
          </div>
          <PromotionsBannerLayout />
        </div>
      )}

      {/* ── Delete confirm */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Xóa banner"
        description={`Bạn có chắc muốn xóa banner "${deleteTarget?.title}"?`}
        confirmLabel="Xóa"
        variant="danger"
        isConfirming={isDeleting}
      />
    </>
  );
}
