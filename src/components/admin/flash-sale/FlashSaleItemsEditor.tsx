"use client";

import { useState } from "react";
import Link from "next/link";
import { Reorder, useDragControls } from "framer-motion";
import {
  TrashIcon,
  PlusIcon,
  ExclamationCircleIcon,
  PhotoIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { VariantPickerModal } from "./VariantPickerModal";
import { formatVND } from "@/src/lib/format";
import type { FlashSaleItemPayload } from "@/src/types/flash-sale.types";
import type { VariantSearchResult } from "@/src/types/flash-sale.types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface FlashSaleItemsEditorProps {
  items:     FlashSaleItemPayload[];
  onChange:  (items: FlashSaleItemPayload[]) => void;
  errors?:   Record<number, { giaFlash?: string; soLuongGioiHan?: string }>;
  showSold?: boolean;
  soldMap?:  Record<number, number>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function discountPct(flash: number, original: number): number {
  if (!original || flash >= original) return 0;
  return Math.round(((original - flash) / original) * 100);
}

// ─── Sortable row ─────────────────────────────────────────────────────────────

interface SortableRowProps {
  item:      FlashSaleItemPayload;
  idx:       number;
  hasError:  boolean;
  errorMsg?: string;
  soldQty:   number;
  showSold:  boolean;
  onUpdate:  (patch: Partial<FlashSaleItemPayload>) => void;
  onRemove:  () => void;
}

function SortableItemRow({
  item,
  idx,
  hasError,
  errorMsg,
  soldQty,
  showSold,
  onUpdate,
  onRemove,
}: SortableRowProps) {
  const controls   = useDragControls();
  const [dragging, setDragging] = useState(false);
  const pct        = discountPct(item.giaFlash, item.giaGocSnapshot);
  const variantHref = item.sanPhamId
    ? `/products/${item.sanPhamId}/variants/${item.phienBanId}`
    : null;

  return (
    <Reorder.Item
      as="div"
      value={item}
      dragControls={controls}
      dragListener={false}
      onDragStart={() => setDragging(true)}
      onDragEnd={() => setDragging(false)}
      style={{ position: "relative", userSelect: "none", zIndex: dragging ? 50 : "auto" }}
      animate={
        dragging
          ? { scale: 1.01, boxShadow: "0 6px 24px rgba(0,0,0,0.10)" }
          : { scale: 1,    boxShadow: "0 0px 0px rgba(0,0,0,0.00)" }
      }
      className={[
        "flex items-center gap-2 border-b border-secondary-50 bg-white px-3 py-2.5 transition-colors last:border-b-0",
        dragging ? "" : "hover:bg-secondary-50/60",
      ].join(" ")}
    >
      {/* ── Drag handle ── */}
      <span
        className="shrink-0 touch-none cursor-grab text-secondary-300 hover:text-secondary-500 active:cursor-grabbing"
        onPointerDown={(e) => { e.preventDefault(); controls.start(e); }}
      >
        <Bars3Icon className="h-4 w-4" />
      </span>

      {/* ── Order badge ── */}
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary-100 text-[10px] font-bold text-secondary-500">
        {idx + 1}
      </span>

      {/* ── Variant info ── */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div className="shrink-0 h-9 w-9 rounded-lg border border-secondary-100 bg-secondary-50 flex items-center justify-center overflow-hidden">
          {item.hinhAnh ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.hinhAnh} alt={item.tenPhienBan} className="h-full w-full object-cover" />
          ) : (
            <PhotoIcon className="h-4 w-4 text-secondary-300" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-secondary-500 truncate max-w-[160px]">{item.sanPhamTen}</p>
          {variantHref ? (
            <Tooltip content={`${item.tenPhienBan} — ${item.skuSnapshot}`} placement="top">
              <Link
                href={variantHref}
                className="block truncate max-w-[160px] font-medium text-primary-600 hover:text-primary-700 hover:underline underline-offset-2 text-xs"
              >
                {item.tenPhienBan}
              </Link>
            </Tooltip>
          ) : (
            <p className="font-medium text-secondary-900 truncate max-w-[160px] text-xs">
              {item.tenPhienBan}
            </p>
          )}
          <p className="font-mono text-[10px] text-secondary-400 mt-0.5">{item.skuSnapshot}</p>
        </div>
      </div>

      {/* ── Giá hiện tại ── */}
      <div className="w-28 shrink-0 text-right">
        <span className="text-sm font-medium text-secondary-700 whitespace-nowrap">
          {formatVND(item.giaGocSnapshot)}
        </span>
      </div>

      {/* ── Giá flash input ── */}
      <div className="w-44 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="flex flex-col">
            <input
              type="number"
              value={item.giaFlash || ""}
              min={0}
              step={1000}
              onChange={(e) => onUpdate({ giaFlash: parseInt(e.target.value, 10) || 0 })}
              className={[
                "w-28 h-8 rounded border px-2 text-sm font-semibold text-primary-700 focus:outline-none focus:ring-1",
                hasError
                  ? "border-error-400 focus:border-error-500 focus:ring-error-500/15"
                  : "border-primary-200 bg-primary-50/40 focus:border-primary-400 focus:ring-primary-500/15",
              ].join(" ")}
              aria-label={`Giá flash cho ${item.tenPhienBan}`}
            />
            {hasError && (
              <p className="mt-0.5 flex items-center gap-0.5 text-[10px] text-error-600">
                <ExclamationCircleIcon className="h-3 w-3" aria-hidden="true" />
                {errorMsg}
              </p>
            )}
          </div>
          {pct > 0 && !hasError && (
            <span className="shrink-0 rounded-md bg-success-50 border border-success-200 px-1.5 py-0.5 text-[10px] font-bold text-success-700 whitespace-nowrap">
              -{pct}%
            </span>
          )}
        </div>
      </div>

      {/* ── Giới hạn SL ── */}
      <div className="w-20 shrink-0">
        <input
          type="number"
          value={item.soLuongGioiHan || ""}
          min={1}
          max={10000}
          onChange={(e) => onUpdate({ soLuongGioiHan: parseInt(e.target.value, 10) || 1 })}
          className="w-20 h-8 rounded border border-secondary-200 px-2 text-sm text-secondary-700 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-500/15"
          aria-label={`Giới hạn số lượng cho ${item.tenPhienBan}`}
        />
      </div>

      {/* ── Đã bán (edit mode only) ── */}
      {showSold && (
        <div className="w-16 shrink-0 text-right">
          <span className="text-sm font-semibold text-secondary-700">{soldQty}</span>
          <span className="text-xs text-secondary-400">/{item.soLuongGioiHan}</span>
        </div>
      )}

      {/* ── Remove ── */}
      <button
        type="button"
        aria-label={`Xóa ${item.tenPhienBan}`}
        onClick={onRemove}
        className="shrink-0 flex h-7 w-7 items-center justify-center rounded text-secondary-400 hover:bg-error-50 hover:text-error-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error-500"
      >
        <TrashIcon className="h-4 w-4" aria-hidden="true" />
      </button>
    </Reorder.Item>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FlashSaleItemsEditor({
  items,
  onChange,
  errors = {},
  showSold = false,
  soldMap  = {},
}: FlashSaleItemsEditorProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const excludeIds = items.map((i) => i.phienBanId);

  const totalMaxRevenue = items.reduce(
    (sum, i) => sum + i.giaFlash * i.soLuongGioiHan,
    0
  );

  function handleVariantSelected(variant: VariantSearchResult) {
    const newItem: FlashSaleItemPayload = {
      phienBanId:     variant.phienBanId,
      sanPhamId:      variant.sanPhamId,
      giaFlash:       Math.floor(variant.giaBan * 0.8),
      giaGocSnapshot: variant.giaBan,
      giaGoc:         variant.giaGoc,
      soLuongGioiHan: Math.min(variant.tonKho, 20),
      thuTuHienThi:   items.length + 1,
      tenPhienBan:    variant.tenPhienBan,
      skuSnapshot:    variant.sku,
      sanPhamTen:     variant.sanPhamTen,
      hinhAnh:        variant.hinhAnh,
    };
    onChange([...items, newItem]);
  }

  function handleReorder(newOrder: FlashSaleItemPayload[]) {
    onChange(newOrder.map((item, i) => ({ ...item, thuTuHienThi: i + 1 })));
  }

  function updateItem(idx: number, patch: Partial<FlashSaleItemPayload>) {
    onChange(items.map((item, i) => (i === idx ? { ...item, ...patch } : item)));
  }

  function removeItem(idx: number) {
    onChange(
      items
        .filter((_, i) => i !== idx)
        .map((item, i) => ({ ...item, thuTuHienThi: i + 1 }))
    );
  }

  return (
    <div className="space-y-3">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-secondary-800">
            Phiên bản sản phẩm
            {items.length > 0 && (
              <span className="ml-2 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-bold text-primary-700">
                {items.length}
              </span>
            )}
          </p>
          {items.length > 0 && (
            <p className="text-xs text-secondary-400 mt-0.5">
              Tổng doanh thu tối đa:{" "}
              <span className="font-semibold text-secondary-600">
                {formatVND(totalMaxRevenue)}
              </span>
              <span className="ml-2 text-secondary-300">
                · kéo <Bars3Icon className="inline h-3 w-3" /> để sắp xếp
              </span>
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          leftIcon={<PlusIcon className="w-4 h-4" />}
          onClick={() => setPickerOpen(true)}
        >
          Thêm phiên bản
        </Button>
      </div>

      {/* ── Empty state ── */}
      {items.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-secondary-200 py-10 text-center">
          <PhotoIcon className="mx-auto h-10 w-10 text-secondary-300" aria-hidden="true" />
          <p className="mt-2 text-sm text-secondary-400">
            Chưa có phiên bản nào. Nhấn{" "}
            <button
              type="button"
              className="text-primary-600 underline underline-offset-2 hover:text-primary-700"
              onClick={() => setPickerOpen(true)}
            >
              Thêm phiên bản
            </button>{" "}
            để bắt đầu.
          </p>
        </div>
      )}

      {/* ── List ── */}
      {items.length > 0 && (
        <div className="rounded-xl border border-secondary-100 overflow-hidden">
          {/* Column headers */}
          <div className="flex items-center gap-2 border-b border-secondary-100 bg-secondary-50 px-3 py-2">
            {/* drag handle + order badge space */}
            <div className="w-[52px] shrink-0" />
            {/* variant name */}
            <div className="flex-1 min-w-0 text-xs font-semibold text-secondary-500 uppercase tracking-wide">
              Phiên bản sản phẩm
            </div>
            {/* giá hiện tại */}
            <div className="w-28 shrink-0 text-right text-xs font-semibold text-secondary-500 uppercase tracking-wide whitespace-nowrap">
              Giá hiện tại
            </div>
            {/* giá flash */}
            <div className="w-44 shrink-0 text-xs font-semibold text-secondary-500 uppercase tracking-wide whitespace-nowrap">
              Giá flash
            </div>
            {/* giới hạn */}
            <div className="w-20 shrink-0 text-xs font-semibold text-secondary-500 uppercase tracking-wide whitespace-nowrap">
              Giới hạn SL
            </div>
            {/* sold */}
            {showSold && (
              <div className="w-16 shrink-0 text-right text-xs font-semibold text-secondary-500 uppercase tracking-wide whitespace-nowrap">
                Đã bán
              </div>
            )}
            {/* delete button space */}
            <div className="w-7 shrink-0" />
          </div>

          {/* Draggable rows */}
          <Reorder.Group
            as="div"
            axis="y"
            values={items}
            onReorder={handleReorder}
            style={{ touchAction: "none" }}
          >
            {items.map((item, idx) => (
              <SortableItemRow
                key={item.phienBanId}
                item={item}
                idx={idx}
                hasError={!!errors[idx]?.giaFlash}
                errorMsg={errors[idx]?.giaFlash}
                soldQty={soldMap[item.phienBanId] ?? 0}
                showSold={showSold}
                onUpdate={(patch) => updateItem(idx, patch)}
                onRemove={() => removeItem(idx)}
              />
            ))}
          </Reorder.Group>
        </div>
      )}

      {/* ── Picker modal ── */}
      <VariantPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleVariantSelected}
        excludeIds={excludeIds}
      />
    </div>
  );
}
