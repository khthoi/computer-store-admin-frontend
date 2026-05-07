"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PhotoIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { Spinner } from "@/src/components/ui/Spinner";
import { Badge } from "@/src/components/ui/Badge";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { getPreviewProducts } from "@/src/services/homepage.service";
import type {
  HomepageSectionType,
  SourceConfig,
  SectionLayout,
  PreviewProduct,
  SectionItem,
} from "@/src/types/homepage.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

function discountPct(giaGoc: number, giaBan: number) {
  if (giaGoc <= giaBan) return null;
  return Math.round(((giaGoc - giaBan) / giaGoc) * 100);
}

// ─── Product mini-card ────────────────────────────────────────────────────────

function PreviewCard({ product }: { product: PreviewProduct }) {
  const pct = discountPct(product.giaGoc, product.giaBan);
  return (
    <div className="flex shrink-0 flex-col overflow-hidden rounded-xl border border-secondary-200 bg-white shadow-sm">
      {/* Image */}
      <div className="relative flex h-28 items-center justify-center bg-secondary-50">
        {product.hinhAnh
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={product.hinhAnh} alt={product.tenSanPham} className="h-full w-full object-cover" />
          : <PhotoIcon className="h-10 w-10 text-secondary-200" />}
        {product.badge && (
          <Badge shape="tag" size="sm" backgroundColor="#ef4444" textColor="#ffffff" className="absolute left-2 top-2 uppercase">
            {product.badge}
          </Badge>
        )}
        {pct && (
          <Badge shape="tag" size="sm" backgroundColor="#6366f1" textColor="#ffffff" className="absolute right-2 top-2">
            -{pct}%
          </Badge>
        )}
      </div>
      {/* Info — fixed-height rows so all cards align horizontally */}
      <div className="flex flex-1 flex-col p-2.5">
        {/* Row 1: brand — always occupies same height */}
        <p className="h-[14px] text-[9px] font-semibold uppercase tracking-wide text-secondary-400 truncate">
          {product.thuongHieu ?? ""}
        </p>
        {/* Row 2: product name — always 2 lines */}
        <div className="mt-1 h-[28px] overflow-hidden">
          {product.sanPhamId ? (
            <Tooltip content={product.tenSanPham} placement="top" multiline maxWidth="220px">
              <Link
                href={`/products/${product.sanPhamId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block line-clamp-2 text-[11px] font-medium leading-[14px] text-secondary-800 transition-colors hover:text-primary-600 hover:underline"
              >
                {product.tenSanPham}
              </Link>
            </Tooltip>
          ) : (
            <p className="line-clamp-2 text-[11px] font-medium leading-[14px] text-secondary-800">
              {product.tenSanPham}
            </p>
          )}
        </div>
        {/* Row 3: prices — sale price + original price always rendered */}
        <div className="mt-auto pt-1">
          <p className="text-xs font-bold text-primary-600">{formatPrice(product.giaBan)}</p>
          <p className={`text-[9px] line-through ${pct ? "text-secondary-400" : "invisible"}`}>
            {formatPrice(product.giaGoc)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Layout wrapper ───────────────────────────────────────────────────────────

function LayoutWrapper({
  layout,
  children,
}: {
  layout: SectionLayout;
  children: React.ReactNode;
}) {
  if (layout === "carousel") {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollSnapType: "x mandatory" }}>
        {children}
      </div>
    );
  }
  const cols = layout === "grid_3" ? 3 : layout === "grid_4" ? 4 : 6;
  return (
    <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export interface SectionPreviewPaneProps {
  type: HomepageSectionType;
  sourceConfig: SourceConfig;
  layout: SectionLayout;
  maxProducts: number;
  title: string;
  badgeLabel?: string;
  badgeColor?: string;
  badgeTextColor?: string;
  viewAllUrl?: string;
  manualItems?: SectionItem[];
}

export function SectionPreviewPane({
  type,
  sourceConfig,
  layout,
  maxProducts,
  title,
  badgeLabel,
  badgeColor,
  badgeTextColor,
  viewAllUrl,
  manualItems = [],
}: SectionPreviewPaneProps) {
  const [products, setProducts] = useState<PreviewProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [key, setKey] = useState(0); // used to manually re-fetch

  // Serialize to primitives so the effect re-runs when config/items content changes
  const configKey = useMemo(() => JSON.stringify(sourceConfig), [sourceConfig]);
  const itemsKey  = useMemo(() => JSON.stringify(manualItems),  [manualItems]);

  useEffect(() => {
    if (type === "manual") {
      setProducts(
        manualItems.slice(0, maxProducts).map((item) => ({
          sanPhamId: item.sanPhamId,
          phienBanId: item.phienBanId,
          tenSanPham: item.tenSanPham,
          SKU: item.SKU,
          giaBan: item.giaBan,
          giaGoc: item.giaGoc,
          hinhAnh: item.hinhAnh,
        }))
      );
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    getPreviewProducts(type, sourceConfig, maxProducts).then((data) => {
      if (!cancelled) {
        setProducts(data);
        setIsLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [type, maxProducts, key, configKey, itemsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const cardWidth = layout === "carousel" ? 160 : undefined;

  return (
    <div className="flex flex-col gap-4">
      {/* Preview info badge */}
      <div className="flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-3 py-2">
        <span className="text-xs text-primary-600">
          Đây là <strong>xem trước ước lượng</strong> — dữ liệu thực sẽ được lấy từ API khi storefront render.
        </span>
        <button
          type="button"
          onClick={() => setKey((k) => k + 1)}
          className="ml-auto shrink-0 rounded-md p-1 text-primary-500 hover:bg-primary-100 transition-colors"
          title="Tải lại preview"
        >
          <ArrowPathIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Storefront section mock */}
      <div className="rounded-xl border border-secondary-200 bg-white p-4">
        {/* Section header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-secondary-900">
              {title || <span className="italic text-secondary-300">Tiêu đề section</span>}
            </h3>
            {badgeLabel && (
              <Badge
                shape="tag"
                size="sm"
                backgroundColor={badgeColor || "#ef4444"}
                textColor={badgeTextColor || "#ffffff"}
                className="uppercase"
              >
                {badgeLabel}
              </Badge>
            )}
          </div>
          {viewAllUrl && (
            <span className="text-xs font-medium text-primary-600">
              Xem tất cả ›
            </span>
          )}
        </div>

        {/* Products */}
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner size="md" color="primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-xl border-2 border-dashed border-secondary-200">
            <p className="text-sm text-secondary-400">
              {type === "manual" && manualItems.length === 0
                ? "Chưa có sản phẩm được chọn"
                : "Không tìm thấy sản phẩm phù hợp với cấu hình"}
            </p>
          </div>
        ) : (
          <LayoutWrapper layout={layout}>
            {products.map((product) => (
              <div
                key={product.phienBanId}
                style={cardWidth ? { minWidth: cardWidth, maxWidth: cardWidth } : undefined}
              >
                <PreviewCard product={product} />
              </div>
            ))}
          </LayoutWrapper>
        )}

        {/* Footer info */}
        {products.length > 0 && (
          <p className="mt-3 text-right text-[10px] text-secondary-400">
            Hiển thị {products.length} / tối đa {maxProducts} sản phẩm
          </p>
        )}
      </div>
    </div>
  );
}
