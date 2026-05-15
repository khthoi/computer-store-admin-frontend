"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ActionBar, Puck, usePuck, type ComponentData, type Config, type Data } from "@puckeditor/core";
import {
  CheckCircleIcon,
  InboxIcon,
  PencilIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { getBanners, saveBannersLayout, type BannerGridItem } from "@/src/services/content.service";
import type { Banner, BannerStatus } from "@/src/types/content.types";

const STATUS_CONFIG: Record<
  BannerStatus,
  { label: string; variant: "success" | "info" | "default" | "error" }
> = {
  active: { label: "Hoạt động", variant: "success" },
  draft: { label: "Nháp", variant: "default" },
};

interface BannerItemProps {
  id: string;
  bannerId: string;
  columnSpan: 1 | 2 | 3 | 4;
  title: string;
  imageUrl: string;
  status: BannerStatus;
  isEnabled: boolean;
  badge?: string;
  badgeColor?: string;
  badgeTextColor?: string;
  overlayText?: string;
  overlaySubtext?: string;
  ctaLabel?: string;
}

const PUCK_CONFIG: Config = {
  components: {
    BannerRow: {
      label: "Hàng banner",
      fields: {},
      render: (rawProps: Record<string, unknown>) => {
        const { puck } = rawProps as { puck: { renderDropZone: (props: Record<string, unknown>) => React.ReactNode } };
        return (
          <div className="overflow-visible rounded-xl border-2 border-dashed border-secondary-200 bg-white/60">
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
          columnSpan,
          title,
          imageUrl,
          status,
          isEnabled,
          badge,
          badgeColor,
          badgeTextColor,
          overlayText,
          overlaySubtext,
          ctaLabel,
        } = rawProps as unknown as BannerItemProps;

        const statusConfig = STATUS_CONFIG[status];

        return (
          <div
            data-col-span={columnSpan}
            className="group relative h-44 w-full overflow-hidden rounded-xl border-2 border-secondary-200 bg-secondary-100 shadow-sm transition-shadow hover:border-primary-300 hover:shadow-lg"
          >
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

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            {badge && (
              <div
                className="absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[11px] font-bold shadow"
                style={{ backgroundColor: badgeColor ?? "#ef4444", color: badgeTextColor ?? "#fff" }}
              >
                {badge}
              </div>
            )}

            <div className="absolute right-2.5 top-2.5 flex flex-col items-end gap-1">
              <Badge variant={statusConfig.variant} size="sm">{statusConfig.label}</Badge>
              <span
                className={[
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-sm",
                  isEnabled ? "bg-emerald-500 text-white" : "bg-white/90 text-secondary-700",
                ].join(" ")}
              >
                {isEnabled ? "Đã bật" : "Đang tắt"}
              </span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 px-3 py-3">
              {overlayText && (
                <p className="mb-1 line-clamp-2 text-sm font-bold leading-tight text-white drop-shadow">
                  {overlayText}
                </p>
              )}
              {overlaySubtext && (
                <p className="mb-1.5 line-clamp-1 text-[11px] text-white/80 drop-shadow">
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
    fields: {},
    render: ({ children }: { children: React.ReactNode }) => (
      <div className="min-h-[280px] space-y-3 p-3">{children}</div>
    ),
  },
};

function bannersToData(banners: Banner[]): Data {
  const rowMap = new Map<number, Banner[]>();
  for (const banner of banners) {
    const row = banner.gridY ?? 0;
    if (!rowMap.has(row)) rowMap.set(row, []);
    rowMap.get(row)!.push(banner);
  }

  const sortedRows = [...rowMap.entries()].sort(([a], [b]) => a - b);
  const content: ComponentData[] = [];
  const zones: Record<string, ComponentData[]> = {};

  for (let index = 0; index < sortedRows.length; index += 1) {
    const [, rowBanners] = sortedRows[index];
    const rowId = `banner-row-${index}`;

    content.push({ type: "BannerRow", props: { id: rowId } });
    zones[`${rowId}:items`] = rowBanners
      .sort((a, b) => (a.gridX ?? 0) - (b.gridX ?? 0))
      .map((banner): ComponentData => ({
        type: "BannerItem",
        props: {
          id: banner.id,
          bannerId: banner.id,
          columnSpan: banner.gridW ?? 2,
          title: banner.title,
          imageUrl: banner.imageUrl,
          status: banner.status,
          isEnabled: banner.isEnabled,
          badge: banner.badge,
          badgeColor: banner.badgeColor,
          badgeTextColor: banner.badgeTextColor,
          overlayText: banner.overlayText,
          overlaySubtext: banner.overlaySubtext,
          ctaLabel: banner.ctaLabel,
        },
      }));
  }

  return { content, root: { props: {} }, zones };
}

function dataToLayout(data: Data): BannerGridItem[] {
  const result: BannerGridItem[] = [];
  const rows = data.content ?? [];

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];
    const rowId = row.props.id as string;
    const items = (data.zones ?? {})[`${rowId}:items`] ?? [];
    let gridX = 0;

    for (const item of items) {
      const span = Number(item.props.columnSpan ?? 2);
      result.push({
        id: item.props.bannerId as string,
        gridX,
        gridY: rowIndex,
        gridW: span,
        gridH: 1,
      });
      gridX += span;
    }
  }

  return result;
}

function LayoutToolbar({
  isDirty,
  isSaving,
  saved,
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
        <p className="mt-0.5 text-xs text-secondary-500">
          Kéo banner để đổi vị trí giữa các hàng. Việc bật/tắt banner được quản lý trong form chỉnh sửa.
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

export function PromotionsBannerLayout() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [initialData, setInitialData] = useState<Data>({ content: [], root: { props: {} } });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const latestData = useRef<Data>({ content: [], root: { props: {} } });
  const baselineLayoutRef = useRef<string>("[]");

  useEffect(() => {
    getBanners({ position: ["promotions_banner"], pageSize: 50 }).then((result) => {
      const sorted = result.data.sort(
        (a, b) => (a.gridY ?? 0) - (b.gridY ?? 0) || (a.gridX ?? 0) - (b.gridX ?? 0),
      );
      setBanners(sorted);
      const nextData = bannersToData(sorted);
      setInitialData(nextData);
      latestData.current = nextData;
      baselineLayoutRef.current = JSON.stringify(dataToLayout(nextData));
      setIsLoading(false);
    });
  }, []);

  const handleChange = useCallback((data: Data) => {
    latestData.current = data;
    // Compare semantic layout (id+gridX+gridY+gridW+gridH) instead of relying
    // on Puck's onChange — Puck fires onChange during initial mount when it
    // normalizes the data tree, which would incorrectly mark the layout as dirty.
    const nextLayout = JSON.stringify(dataToLayout(data));
    const dirty = nextLayout !== baselineLayoutRef.current;
    setIsDirty(dirty);
    if (dirty) setSaved(false);
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const layout = dataToLayout(latestData.current);
      await saveBannersLayout(layout);
      baselineLayoutRef.current = JSON.stringify(layout);
      setIsDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setIsSaving(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-14 animate-pulse rounded-xl bg-secondary-100" />
        {[0, 1].map((index) => (
          <div key={index} className="h-52 animate-pulse rounded-xl bg-secondary-100" />
        ))}
      </div>
    );
  }

  if (!banners.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-secondary-300 py-24">
        <InboxIcon className="h-12 w-12 text-secondary-300" />
        <p className="text-sm text-secondary-500">Chưa có banner nào cho trang Khuyến mãi</p>
        <Link href="/content/banners/create">
          <Button leftIcon={<PlusIcon className="h-4 w-4" />}>Tạo banner đầu tiên</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <LayoutToolbar isDirty={isDirty} isSaving={isSaving} saved={saved} onSave={handleSave} />

      <div className="overflow-hidden rounded-xl border border-secondary-200 bg-white">
        <Puck
          config={PUCK_CONFIG}
          data={initialData}
          onChange={handleChange}
          iframe={{ enabled: false }}
          overrides={{ header: () => <></>, actionBar: BannerActionBar }}
        >
          <Puck.Layout>
            <div className="flex min-h-[400px]">
              <div className="flex-1 overflow-auto bg-secondary-50">
                <Puck.Preview />
              </div>
              <div className="w-64 shrink-0 border-l border-secondary-100 bg-white">
                <div className="border-b border-secondary-100 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-secondary-500">Thuộc tính</p>
                  <p className="mt-0.5 text-[11px] text-secondary-400">
                    Chọn một banner để chỉnh số cột chiếm
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
          Bạn có thay đổi chưa được lưu, nhấn <strong>Lưu layout</strong> để áp dụng.
        </p>
      )}
    </div>
  );
}
