"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Puck, ActionBar, usePuck, type Config, type Data, type ComponentData } from "@puckeditor/core";
import {
  PlusIcon, InboxIcon, CheckCircleIcon, PencilIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { getBanners, saveBannersLayout, type BannerGridItem } from "@/src/services/content.service";
import type { Banner, BannerStatus } from "@/src/types/content.types";

// ─── Status badge config ──────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  BannerStatus,
  { label: string; variant: "success" | "info" | "default" | "error" }
> = {
  active:    { label: "Đang hiển thị", variant: "success" },
  scheduled: { label: "Lên lịch",      variant: "info" },
  draft:     { label: "Nháp",          variant: "default" },
  ended:     { label: "Kết thúc",      variant: "error" },
};

// ─── BannerItem props (stored in Puck data) ───────────────────────────────────

interface BannerItemProps {
  id: string;
  bannerId: string;
  columnSpan: 1 | 2 | 3 | 4;
  title: string;
  imageUrl: string;
  status: BannerStatus;
  badge?: string;
  badgeColor?: string;
  badgeTextColor?: string;
  overlayText?: string;
  overlaySubtext?: string;
  ctaLabel?: string;
}

// ─── Puck Config (module-level — never recreated) ─────────────────────────────

const PUCK_CONFIG: Config = {
  components: {
    /**
     * BannerRow — a horizontal row that holds BannerItem components.
     * Uses a CSS-grid DropZone with collisionAxis="x" so items sort left-to-right.
     */
    BannerRow: {
      label: "Hàng banner",
      fields: {},
      render: (rawProps: Record<string, unknown>) => {
        const { puck } = rawProps as { puck: { renderDropZone: (p: Record<string, unknown>) => React.ReactNode } };
        return (
          <div className="puck-banner-row rounded-xl border-2 border-dashed border-secondary-200 bg-white/60 overflow-visible">
            {puck.renderDropZone({
              zone: "items",
              allow: ["BannerItem"],
              collisionAxis: "x",
              className: "banner-grid",
              style: {
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "12px",
                padding: "12px",
                minHeight: "180px",
                alignItems: "stretch",
              },
            })}
          </div>
        );
      },
    },

    /**
     * BannerItem — renders one banner card inside a row.
     * The `data-col-span` attribute on the root div is targeted by CSS to set
     * gridColumn on the Puck wrapper so the card spans multiple grid columns.
     */
    BannerItem: {
      label: "Banner",
      fields: {
        columnSpan: {
          type: "radio",
          label: "Số cột chiếm",
          options: [
            { value: 1, label: "1 cột" },
            { value: 2, label: "2 cột" },
            { value: 3, label: "3 cột" },
            { value: 4, label: "4 cột" },
          ],
        },
      },
      defaultProps: { columnSpan: 2 },
      render: (rawProps: Record<string, unknown>) => {
        const {
          bannerId, columnSpan, title, imageUrl, status,
          badge, badgeColor, badgeTextColor,
          overlayText, overlaySubtext, ctaLabel,
        } = rawProps as unknown as BannerItemProps;

        const statusCfg = STATUS_CONFIG[status];

        return (
          <div
            data-col-span={columnSpan}
            className="group relative h-44 w-full overflow-hidden rounded-xl border-2 border-secondary-200 bg-secondary-100 shadow-sm transition-shadow hover:shadow-lg hover:border-primary-300"
          >
            {/* Background image */}
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={title}
                className="absolute inset-0 h-full w-full object-cover"
                draggable={false}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-secondary-100">
                <span className="text-4xl">🖼</span>
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            {/* Badge — top left */}
            {badge && (
              <div
                className="absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[11px] font-bold shadow"
                style={{ backgroundColor: badgeColor ?? "#ef4444", color: badgeTextColor ?? "#fff" }}
              >
                {badge}
              </div>
            )}

            {/* Status — top right */}
            {statusCfg && (
              <div className="absolute right-2.5 top-2.5">
                <Badge variant={statusCfg.variant} size="sm">{statusCfg.label}</Badge>
              </div>
            )}

            {/* Content — bottom */}
            <div className="absolute bottom-0 left-0 right-0 px-3 py-3">
              {overlayText && (
                <p className="text-white text-sm font-bold leading-tight line-clamp-2 drop-shadow mb-1">
                  {overlayText}
                </p>
              )}
              {overlaySubtext && (
                <p className="text-white/80 text-[11px] line-clamp-1 drop-shadow mb-1.5">
                  {overlaySubtext}
                </p>
              )}
              {ctaLabel && (
                <span className="inline-block rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-secondary-900 shadow">
                  {ctaLabel}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
  },

  root: {
    render: ({ children }: { children: React.ReactNode }) => (
      <div className="puck-banner-canvas p-3 space-y-3 min-h-[280px]">
        {children}
      </div>
    ),
  },
};

// ─── Data ↔ Banner conversion helpers ────────────────────────────────────────

function bannersToData(banners: Banner[]): Data {
  // Group banners by their gridY (row index)
  const rowMap = new Map<number, Banner[]>();
  for (const b of banners) {
    const row = b.gridY ?? 0;
    if (!rowMap.has(row)) rowMap.set(row, []);
    rowMap.get(row)!.push(b);
  }

  const sortedRows = [...rowMap.entries()].sort(([a], [b]) => a - b);
  const content: ComponentData[] = [];
  const zones: Record<string, ComponentData[]> = {};

  for (let i = 0; i < sortedRows.length; i++) {
    const [, rowBanners] = sortedRows[i];
    const rowId = `banner-row-${i}`;

    content.push({ type: "BannerRow", props: { id: rowId } });

    zones[`${rowId}:items`] = rowBanners
      .sort((a, b) => (a.gridX ?? 0) - (b.gridX ?? 0))
      .map((b): ComponentData => ({
        type: "BannerItem",
        props: {
          id: b.id,
          bannerId: b.id,
          columnSpan: b.gridW ?? 2,
          title: b.title,
          imageUrl: b.imageUrl,
          status: b.status,
          badge: b.badge,
          badgeColor: b.badgeColor,
          badgeTextColor: b.badgeTextColor,
          overlayText: b.overlayText,
          overlaySubtext: b.overlaySubtext,
          ctaLabel: b.ctaLabel,
        },
      }));
  }

  return { content, root: { props: {} }, zones };
}

function dataToLayout(data: Data): BannerGridItem[] {
  const result: BannerGridItem[] = [];
  const rows = data.content ?? [];

  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    const row = rows[rowIdx];
    const rowId = row.props.id as string;
    const items = (data.zones ?? {})[`${rowId}:items`] ?? [];
    let colX = 0;

    for (const item of items) {
      const span = Number(item.props.columnSpan ?? 2);
      result.push({
        id: item.props.bannerId as string,
        gridX: colX,
        gridY: rowIdx,
        gridW: span,
        gridH: 1,
      });
      colX += span;
    }
  }

  return result;
}

// ─── Toolbar (must live inside <Puck> to access usePuck) ─────────────────────

function LayoutToolbar({
  isDirty, isSaving, saved,
  onSave,
}: {
  isDirty: boolean;
  isSaving: boolean;
  saved: boolean;
  onSave: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-secondary-200 bg-white px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-secondary-800">Layout trang Khuyến mãi</p>
        <p className="text-xs text-secondary-500 mt-0.5">
          <span className="font-medium text-secondary-600">Kéo banner</span> để di chuyển giữa/trong các hàng ·{" "}
          <span className="font-medium text-secondary-600">Click vào banner</span> để thay đổi số cột chiếm
        </p>
      </div>
      <div className="flex items-center gap-2">
        {saved && (
          <span className="flex items-center gap-1 text-xs text-success-600">
            <CheckCircleIcon className="h-4 w-4" /> Đã lưu
          </span>
        )}
        <Button
          variant={isDirty ? "primary" : "outline"}
          size="sm"
          onClick={onSave}
          isLoading={isSaving}
          disabled={!isDirty}
        >
          {isDirty ? "Lưu layout" : "Đã cập nhật"}
        </Button>
        <Link href="/content/banners/create">
          <Button size="sm" leftIcon={<PlusIcon className="h-4 w-4" />} variant="outline">
            Thêm banner
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ─── Puck ActionBar override (must render inside <Puck> context) ──────────────

function BannerActionBar({
  label,
  children,
}: {
  label?: string;
  children: React.ReactNode;
  parentAction: React.ReactNode;
}) {
  const { selectedItem } = usePuck();
  const bannerId =
    selectedItem?.type === "BannerItem"
      ? (selectedItem.props?.bannerId as string | undefined)
      : undefined;

  return (
    <ActionBar label={label}>
      <ActionBar.Group>{children}</ActionBar.Group>
      {bannerId && (
        <ActionBar.Group>
          <ActionBar.Action
            label="Chỉnh sửa chi tiết banner"
            onClick={() => {
              window.location.href = `/content/banners/${bannerId}/edit`;
            }}
          >
            <PencilIcon className="h-4 w-4" />
          </ActionBar.Action>
        </ActionBar.Group>
      )}
    </ActionBar>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PromotionsBannerLayout() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [initialData, setInitialData] = useState<Data>({ content: [], root: { props: {} } });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Ref holds latest Puck data for saving without causing re-mount
  const latestData = useRef<Data>({ content: [], root: { props: {} } });

  useEffect(() => {
    getBanners({ position: ["promotions_banner"], pageSize: 50 }).then((res) => {
      const sorted = res.data.sort(
        (a, b) => (a.gridY ?? 0) - (b.gridY ?? 0) || (a.gridX ?? 0) - (b.gridX ?? 0),
      );
      setBanners(sorted);
      const data = bannersToData(sorted);
      setInitialData(data);
      latestData.current = data;
      setIsLoading(false);
    });
  }, []);

  const handleChange = useCallback((data: Data) => {
    latestData.current = data;
    setIsDirty(true);
    setSaved(false);
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await saveBannersLayout(dataToLayout(latestData.current));
      setIsDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setIsSaving(false);
    }
  }, []);

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-14 animate-pulse rounded-xl bg-secondary-100" />
        {[0, 1].map((i) => (
          <div key={i} className="h-52 animate-pulse rounded-xl bg-secondary-100" />
        ))}
      </div>
    );
  }

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (!banners.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-secondary-300 py-24">
        <InboxIcon className="h-12 w-12 text-secondary-300" />
        <p className="text-secondary-500 text-sm">Chưa có banner nào cho trang Khuyến mãi</p>
        <Link href="/content/banners/create">
          <Button leftIcon={<PlusIcon className="h-4 w-4" />}>Tạo banner đầu tiên</Button>
        </Link>
      </div>
    );
  }

  // ── Editor ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <LayoutToolbar
        isDirty={isDirty}
        isSaving={isSaving}
        saved={saved}
        onSave={handleSave}
      />

      {/* Puck editor — iframe disabled so it renders in the same DOM */}
      <div className="rounded-xl border border-secondary-200 overflow-hidden bg-white puck-banner-editor">
        <Puck
          config={PUCK_CONFIG}
          data={initialData}
          onChange={handleChange}
          iframe={{ enabled: false }}
          overrides={{ header: () => <></>, actionBar: BannerActionBar }}
        >
          <Puck.Layout>
            <div className="flex min-h-[400px]">
              {/* Canvas — drag-and-drop area */}
              <div className="flex-1 overflow-auto bg-secondary-50">
                <Puck.Preview />
              </div>

              {/* Properties panel — shown when a banner is selected */}
              <div className="w-64 shrink-0 border-l border-secondary-100 bg-white">
                <div className="px-4 py-3 border-b border-secondary-100">
                  <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wide">
                    Thuộc tính
                  </p>
                  <p className="text-[11px] text-secondary-400 mt-0.5">
                    Chọn một banner để chỉnh số cột
                  </p>
                </div>
                <Puck.Fields />
              </div>
            </div>
          </Puck.Layout>
        </Puck>
      </div>

      {isDirty && (
        <p className="text-center text-xs text-amber-600">
          ⚠ Bạn có thay đổi chưa được lưu — nhấn <strong>Lưu layout</strong> để áp dụng
        </p>
      )}
    </div>
  );
}
