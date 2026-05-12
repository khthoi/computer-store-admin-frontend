"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Reorder, useDragControls } from "framer-motion";
import {
  Bars3Icon,
  ExclamationTriangleIcon,
  InboxIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { DataTable } from "@/src/components/admin/DataTable";
import type { ColumnDef, SortDir } from "@/src/components/admin/DataTable";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import { FilterDropdown } from "@/src/components/admin/FilterDropdown";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Toggle } from "@/src/components/ui/Toggle";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { useToast } from "@/src/components/ui/Toast";
import { PromotionsBannerLayout } from "./PromotionsBannerLayout";
import {
  deleteBanner,
  getBanners,
  getHomepageHeroMode,
  reorderBanners,
  setHomepageHeroMode,
  updateBanner,
  type HomepageHeroMode,
} from "@/src/services/content.service";
import type { Banner, BannerPosition, BannerStatus } from "@/src/types/content.types";

type BannerRow = Banner & Record<string, unknown>;

const STATUS_CONFIG: Record<
  BannerStatus,
  { label: string; variant: "success" | "warning" | "error" | "default" | "info" }
> = {
  active: { label: "Hoạt động", variant: "success" },
  draft: { label: "Nháp", variant: "default" },
};

const STATUS_OPTIONS = [
  { value: "active", label: "Hoạt động" },
  { value: "draft", label: "Nháp" },
];

const POSITION_ENABLED_LIMITS: Partial<Record<BannerPosition, number>> = {
  homepage_hero: 1,
  homepage_small: 4,
  side_banner: 2,
};

const TABS: { position: BannerPosition; label: string; draggable: boolean }[] = [
  { position: "homepage_hero", label: "Hero trang chủ", draggable: false },
  { position: "homepage_hero_slider", label: "Hero Slider", draggable: true },
  { position: "homepage_small", label: "4 banner nhỏ", draggable: true },
  { position: "side_banner", label: "Side Banner", draggable: true },
  { position: "promotions_banner", label: "Banner Khuyến mãi", draggable: false },
];

function isHeroPosition(position: BannerPosition): boolean {
  return position === "homepage_hero" || position === "homepage_hero_slider";
}

function modeForPosition(position: BannerPosition): HomepageHeroMode {
  return position === "homepage_hero_slider" ? "slider" : "banner";
}

function labelForMode(mode: HomepageHeroMode): string {
  return mode === "slider" ? "Hero Slider" : "Hero trang chủ";
}

function enabledHint(position: BannerPosition): string | null {
  const limit = POSITION_ENABLED_LIMITS[position];
  if (!limit) return null;
  return `Tối đa ${limit} banner được kích hoạt ở tab này.`;
}

function SortableBannerRow({
  banner,
  index,
  disabled,
  isPending,
  onDelete,
  onToggleEnabled,
}: {
  banner: Banner;
  index: number;
  disabled?: boolean;
  isPending?: boolean;
  onDelete: (banner: Banner) => void;
  onToggleEnabled: (banner: Banner, enabled: boolean) => void;
}) {
  const controls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);
  const statusConfig = STATUS_CONFIG[banner.status];
  const enableBlocked = disabled || banner.status !== "active" || isPending;

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
          : { scale: 1, boxShadow: "0 0 0 rgba(0,0,0,0)" }
      }
      className="group flex items-center gap-3 rounded-xl border border-secondary-200 bg-white px-4 py-3 transition-colors hover:border-secondary-300"
    >
      <span
        className="shrink-0 touch-none cursor-grab text-secondary-300 hover:text-secondary-500 active:cursor-grabbing"
        onPointerDown={(event) => {
          event.preventDefault();
          controls.start(event);
        }}
        aria-label="Kéo để sắp xếp"
      >
        <Bars3Icon className="h-4 w-4" />
      </span>

      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary-100 text-xs font-bold text-secondary-500">
        {index}
      </span>

      <div className="h-10 w-16 shrink-0 overflow-hidden rounded-lg border border-secondary-100 bg-secondary-100">
        {banner.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={banner.imageUrl} alt={banner.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-base text-secondary-300">🖼</div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-secondary-800">{banner.title}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
          <Badge variant={statusConfig.variant} size="sm">{statusConfig.label}</Badge>
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

      <div className="shrink-0">
        <Toggle
          checked={banner.isEnabled}
          disabled={enableBlocked}
          onChange={(event) => onToggleEnabled(banner, event.target.checked)}
          labelLeft
          label="Kích hoạt"
          size="sm"
        />
      </div>

      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Tooltip content={disabled ? "Vô hiệu vì đang dùng chế độ hero khác" : "Chỉnh sửa"} placement="top">
          {disabled ? (
            <Button variant="ghost" size="xs" disabled>
              <PencilIcon className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Link href={`/content/banners/${banner.id}/edit`}>
              <Button variant="ghost" size="xs">
                <PencilIcon className="h-3.5 w-3.5" />
              </Button>
            </Link>
          )}
        </Tooltip>
        <Tooltip content={disabled ? "Vô hiệu vì đang dùng chế độ hero khác" : "Xóa"} placement="top">
          <Button
            variant="ghost"
            size="xs"
            color="danger"
            disabled={disabled}
            onClick={(event) => {
              event.stopPropagation();
              if (!disabled) onDelete(banner);
            }}
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </Button>
        </Tooltip>
      </div>
    </Reorder.Item>
  );
}

export function BannerListClient() {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<BannerPosition>("homepage_hero");
  const activeTabConfig = TABS.find((tab) => tab.position === activeTab)!;
  const isDragTab = activeTabConfig.draggable;
  const isPromotionsTab = activeTab === "promotions_banner";
  const isHeroTableTab = !isDragTab && !isPromotionsTab;

  const [tableBanners, setTableBanners] = useState<Banner[]>([]);
  const [tableTotal, setTableTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortKey, setSortKey] = useState("sortOrder");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const [dragBanners, setDragBanners] = useState<Banner[]>([]);
  const dragBannersRef = useRef<Banner[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingToggleIds, setPendingToggleIds] = useState<string[]>([]);

  const [heroMode, setHeroMode] = useState<HomepageHeroMode | null>(null);
  const [pendingMode, setPendingMode] = useState<HomepageHeroMode | null>(null);
  const [isSavingMode, setIsSavingMode] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getHomepageHeroMode()
      .then((mode) => {
        if (!cancelled) setHeroMode(mode);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const isHeroTabPosition = isHeroPosition(activeTab);
  const currentTabMode = modeForPosition(activeTab);
  const isHeroLocked = isHeroTabPosition && heroMode !== null && heroMode !== currentTabMode;
  const otherMode: HomepageHeroMode = currentTabMode === "banner" ? "slider" : "banner";
  const toggleIsOn = heroMode === currentTabMode;

  async function handleConfirmMode() {
    if (!pendingMode) return;
    setIsSavingMode(true);
    try {
      await setHomepageHeroMode(pendingMode);
      setHeroMode(pendingMode);
      showToast(`Đã kích hoạt ${labelForMode(pendingMode)}`, "success");
      setPendingMode(null);
    } catch {
      showToast("Cập nhật cấu hình thất bại", "error");
    } finally {
      setIsSavingMode(false);
    }
  }

  useEffect(() => {
    setIsDirty(false);
    setSearch("");
    setStatusFilter([]);
    setPage(1);
    setDragBanners([]);
    dragBannersRef.current = [];
  }, [activeTab]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    if (!isHeroTableTab) return;

    let cancelled = false;
    setIsLoading(true);
    getBanners({
      q: search,
      status: statusFilter as BannerStatus[],
      position: [activeTab],
      page,
      pageSize,
    })
      .then((result) => {
        if (cancelled) return;
        setTableBanners(result.data);
        setTableTotal(result.total);
        setIsLoading(false);
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, isHeroTableTab, page, pageSize, search, statusFilter]);

  useEffect(() => {
    if (!isDragTab) return;

    let cancelled = false;
    setIsLoading(true);
    getBanners({ position: [activeTab], pageSize: 200 })
      .then((result) => {
        if (cancelled) return;
        const sorted = [...result.data].sort((a, b) => a.sortOrder - b.sortOrder);
        setDragBanners(sorted);
        dragBannersRef.current = sorted;
        setIsLoading(false);
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, isDragTab]);

  function handleReorder(newOrder: Banner[]) {
    setDragBanners(newOrder);
    dragBannersRef.current = newOrder;
    setIsDirty(true);
  }

  async function handleSaveOrder() {
    setIsSavingOrder(true);
    try {
      await reorderBanners(activeTab, dragBannersRef.current.map((banner) => banner.id));
      setIsDirty(false);
      showToast("Đã lưu thứ tự banner", "success");
    } catch {
      showToast("Lưu thứ tự thất bại", "error");
    } finally {
      setIsSavingOrder(false);
    }
  }

  const applyBannerPatch = useCallback((bannerId: string, patch: Partial<Banner>) => {
    setTableBanners((prev) => prev.map((banner) => (banner.id === bannerId ? { ...banner, ...patch } : banner)));
    setDragBanners((prev) => prev.map((banner) => (banner.id === bannerId ? { ...banner, ...patch } : banner)));
    dragBannersRef.current = dragBannersRef.current.map((banner) => (banner.id === bannerId ? { ...banner, ...patch } : banner));
  }, []);

  const handleToggleEnabled = useCallback(async (banner: Banner, enabled: boolean) => {
    setPendingToggleIds((prev) => [...prev, banner.id]);
    try {
      const updated = await updateBanner(banner.id, { isEnabled: enabled });
      applyBannerPatch(banner.id, { isEnabled: updated.isEnabled, status: updated.status });
      showToast(enabled ? "Đã kích hoạt banner" : "Đã tắt kích hoạt banner", "success");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Cập nhật kích hoạt thất bại";
      showToast(message, "error");
    } finally {
      setPendingToggleIds((prev) => prev.filter((id) => id !== banner.id));
    }
  }, [applyBannerPatch, showToast]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteBanner(deleteTarget.id);
      if (isDragTab) {
        const next = dragBannersRef.current.filter((banner) => banner.id !== deleteTarget.id);
        setDragBanners(next);
        dragBannersRef.current = next;
        setIsDirty(true);
      } else {
        setTableBanners((prev) => prev.filter((banner) => banner.id !== deleteTarget.id));
        setTableTotal((prev) => prev - 1);
      }
      showToast(`Đã xóa banner "${deleteTarget.title}"`, "success");
      setDeleteTarget(null);
    } catch {
      showToast("Xóa banner thất bại", "error");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, isDragTab, showToast]);

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
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="truncate font-medium text-secondary-800">{value as string}</span>
            {activeTab === "homepage_hero" && <Badge variant="info" size="sm">Tối đa 1 kích hoạt</Badge>}
          </div>
          {(row.badge as string) && (
            <span
              className="inline-block w-fit rounded-full px-1.5 py-0.5 text-[10px] font-bold"
              style={{
                backgroundColor: (row.badgeColor as string) ?? "#ef4444",
                color: (row.badgeTextColor as string) ?? "#fff",
              }}
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
        const config = STATUS_CONFIG[value as BannerStatus];
        return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
      },
    },
    {
      key: "isEnabled",
      header: "Kích hoạt",
      width: "w-32",
      align: "left",
      render: (value, row) => {
        const rowBanner = row as unknown as Banner;
        const disabled = isHeroLocked || rowBanner.status !== "active" || pendingToggleIds.includes(rowBanner.id);
        return (
          <Toggle
            checked={value as boolean}
            disabled={disabled}
            onChange={(event) => handleToggleEnabled(rowBanner, event.target.checked)}
            size="sm"
            labelLeft
            label=""
          />
        );
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
      width: "w-28",
      align: "center",
      render: (_, row) => (
        <div className="flex items-center justify-center gap-1">
          <Tooltip content={isHeroLocked ? "Vô hiệu vì đang dùng chế độ hero khác" : "Chỉnh sửa"} placement="top">
            {isHeroLocked ? (
              <Button variant="ghost" size="xs" disabled>
                <PencilIcon className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Link href={`/content/banners/${row.id as string}/edit`}>
                <Button variant="ghost" size="xs">
                  <PencilIcon className="h-3.5 w-3.5" />
                </Button>
              </Link>
            )}
          </Tooltip>
          <Tooltip content={isHeroLocked ? "Vô hiệu vì đang dùng chế độ hero khác" : "Xóa"} placement="top">
            <Button
              variant="ghost"
              size="xs"
              color="danger"
              disabled={isHeroLocked}
              onClick={(event) => {
                event.stopPropagation();
                if (!isHeroLocked) setDeleteTarget(row as unknown as Banner);
              }}
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  const addBannerButton = isHeroLocked ? (
    <Tooltip content="Đang dùng chế độ hero khác nên tab này đang bị khóa" placement="top">
      <span>
        <Button size="sm" leftIcon={<PlusIcon className="h-4 w-4" />} disabled>
          Thêm banner
        </Button>
      </span>
    </Tooltip>
  ) : (
    <Link href={`/content/banners/create?position=${activeTab}`}>
      <Button size="sm" leftIcon={<PlusIcon className="h-4 w-4" />}>Thêm banner</Button>
    </Link>
  );

  const heroModeBar = isHeroTabPosition && heroMode !== null && (
    <div
      className={[
        "mb-4 flex flex-col gap-3 rounded-xl border p-4",
        isHeroLocked ? "border-amber-300 bg-amber-50" : "border-secondary-200 bg-white",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-2">
          {isHeroLocked && (
            <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" aria-hidden="true" />
          )}
          <div>
            <p className="text-sm font-semibold text-secondary-800">
              Chế độ hiển thị hero: <span className="text-primary-600">{labelForMode(heroMode)}</span>
            </p>
            <p className="mt-0.5 text-xs text-secondary-500">
              {isHeroLocked
                ? `${labelForMode(currentTabMode)} đang bị vô hiệu hóa. Banner vẫn được lưu trong CMS nhưng sẽ không hiển thị ở storefront cho đến khi bạn chuyển lại chế độ này.`
                : `${labelForMode(currentTabMode)} đang được storefront sử dụng.`}
            </p>
          </div>
        </div>
        <Toggle
          size="md"
          labelLeft
          label={`Kích hoạt ${labelForMode(currentTabMode)}`}
          checked={toggleIsOn}
          disabled={isSavingMode}
          onChange={() => setPendingMode(toggleIsOn ? otherMode : currentTabMode)}
        />
      </div>
    </div>
  );

  const tabHint = enabledHint(activeTab);

  return (
    <>
      <div className="mb-4 overflow-x-auto">
        <div className="flex w-fit min-w-full items-center gap-0 rounded-xl border border-secondary-200 bg-white p-1">
          {TABS.map((tab, index) => (
            <div key={tab.position} className="flex items-center">
              {index > 0 && <div className="mx-1 h-5 w-px shrink-0 bg-secondary-200" />}
              <button
                type="button"
                onClick={() => setActiveTab(tab.position)}
                className={[
                  "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
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

      {heroModeBar}

      {tabHint && (
        <p className="mb-4 text-sm text-secondary-500">{tabHint}</p>
      )}

      {isHeroTableTab && (
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
              <FilterDropdown
                label="Trạng thái"
                options={STATUS_OPTIONS}
                selected={statusFilter}
                onChange={setStatusFilter}
              />
              {addBannerButton}
            </div>
          }
          sortKey={sortKey}
          sortDir={sortDir}
          onSortChange={(key, dir) => {
            setSortKey(key);
            setSortDir(dir);
          }}
          page={page}
          pageSize={pageSize}
          totalRows={tableTotal}
          pageSizeOptions={[10, 20, 50]}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          tableLayout="fixed"
        />
      )}

      {isDragTab && (
        <div className="flex flex-col gap-3">
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
              {addBannerButton}
              {isDirty && (
                <Button size="sm" onClick={handleSaveOrder} isLoading={isSavingOrder}>
                  Lưu thứ tự
                </Button>
              )}
            </div>
          </div>

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
              {dragBanners.map((banner, index) => (
                <SortableBannerRow
                  key={banner.id}
                  banner={banner}
                  index={index + 1}
                  disabled={isHeroLocked}
                  isPending={pendingToggleIds.includes(banner.id)}
                  onDelete={setDeleteTarget}
                  onToggleEnabled={handleToggleEnabled}
                />
              ))}
            </Reorder.Group>
          )}
        </div>
      )}

      {isPromotionsTab && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-end">
            {addBannerButton}
          </div>
          <PromotionsBannerLayout />
        </div>
      )}

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

      <ConfirmDialog
        isOpen={pendingMode !== null}
        onClose={() => {
          if (!isSavingMode) setPendingMode(null);
        }}
        onConfirm={handleConfirmMode}
        title={`Kích hoạt ${pendingMode ? labelForMode(pendingMode) : ""}?`}
        description={
          pendingMode
            ? `Kích hoạt ${labelForMode(pendingMode)} sẽ vô hiệu hóa ${labelForMode(
                pendingMode === "banner" ? "slider" : "banner",
              )} trên storefront. Banner ở chế độ còn lại vẫn được giữ trong CMS.`
            : ""
        }
        confirmLabel="Kích hoạt"
        cancelLabel="Hủy"
        variant="warning"
        isConfirming={isSavingMode}
      />
    </>
  );
}
