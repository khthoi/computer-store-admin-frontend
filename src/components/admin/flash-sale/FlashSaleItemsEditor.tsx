"use client";

import { useState } from "react";
import {
  TrashIcon,
  PlusIcon,
  ExclamationCircleIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { VariantPickerModal } from "./VariantPickerModal";
import { formatVND } from "@/src/lib/format";
import type { FlashSaleItemPayload } from "@/src/types/flash-sale.types";
import type { VariantSearchResult } from "@/src/types/flash-sale.types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface FlashSaleItemsEditorProps {
  items:     FlashSaleItemPayload[];
  onChange:  (items: FlashSaleItemPayload[]) => void;
  /** Field-level error messages keyed by index */
  errors?:   Record<number, { giaFlash?: string; soLuongGioiHan?: string }>;
  /** Show soLuongDaBan column (only on edit) */
  showSold?: boolean;
  soldMap?:  Record<number, number>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function discountPct(flash: number, original: number): number {
  if (!original || flash >= original) return 0;
  return Math.round(((original - flash) / original) * 100);
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
      giaFlash:       Math.floor(variant.giaBan * 0.8),   // default: 20% off
      giaGocSnapshot: variant.giaBan,
      soLuongGioiHan: Math.min(variant.tonKho, 20),
      thuTuHienThi:   items.length + 1,
      tenPhienBan:    variant.tenPhienBan,
      skuSnapshot:    variant.sku,
      sanPhamTen:     variant.sanPhamTen,
      hinhAnh:        variant.hinhAnh,
    };
    onChange([...items, newItem]);
  }

  function updateItem(idx: number, patch: Partial<FlashSaleItemPayload>) {
    onChange(items.map((item, i) => (i === idx ? { ...item, ...patch } : item)));
  }

  function removeItem(idx: number) {
    const updated = items
      .filter((_, i) => i !== idx)
      .map((item, i) => ({ ...item, thuTuHienThi: i + 1 }));
    onChange(updated);
  }

  return (
    <div className="space-y-3">
      {/* Header row */}
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

      {/* Empty state */}
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

      {/* Table */}
      {items.length > 0 && (
        <div className="rounded-xl border border-secondary-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-secondary-100 bg-secondary-50">
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wide min-w-[200px]">
                    Sản phẩm / SKU
                  </th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold text-secondary-500 uppercase tracking-wide whitespace-nowrap">
                    Giá gốc
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wide whitespace-nowrap min-w-[160px]">
                    Giá flash
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wide whitespace-nowrap min-w-[120px]">
                    Giới hạn SL
                  </th>
                  {showSold && (
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-secondary-500 uppercase tracking-wide whitespace-nowrap">
                      Đã bán
                    </th>
                  )}
                  <th className="px-3 py-2.5 text-center text-xs font-semibold text-secondary-500 uppercase tracking-wide w-16">
                    Thứ tự
                  </th>
                  <th className="px-3 py-2.5 w-10" aria-hidden="true" />
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-50">
                {items.map((item, idx) => {
                  const pct      = discountPct(item.giaFlash, item.giaGocSnapshot);
                  const hasError = !!errors[idx]?.giaFlash;
                  const soldQty  = soldMap[item.phienBanId] ?? 0;

                  return (
                    <tr
                      key={item.phienBanId}
                      className="hover:bg-secondary-50/60 transition-colors"
                    >
                      {/* Product info */}
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="shrink-0 h-9 w-9 rounded-lg border border-secondary-100 bg-secondary-50 flex items-center justify-center overflow-hidden">
                            {item.hinhAnh ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.hinhAnh}
                                alt={item.tenPhienBan}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <PhotoIcon className="h-4 w-4 text-secondary-300" aria-hidden="true" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-secondary-500 truncate max-w-[140px]">
                              {item.sanPhamTen}
                            </p>
                            <p className="font-medium text-secondary-900 truncate max-w-[140px] text-xs">
                              {item.tenPhienBan}
                            </p>
                            <p className="font-mono text-[10px] text-secondary-400 mt-0.5">
                              {item.skuSnapshot}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Original price (readonly) */}
                      <td className="px-3 py-2.5 text-right text-secondary-500 whitespace-nowrap text-xs">
                        {formatVND(item.giaGocSnapshot)}
                      </td>

                      {/* Flash price */}
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div>
                            <input
                              type="number"
                              value={item.giaFlash || ""}
                              min={0}
                              step={1000}
                              onChange={(e) =>
                                updateItem(idx, {
                                  giaFlash: parseInt(e.target.value, 10) || 0,
                                })
                              }
                              className={[
                                "w-28 h-8 rounded border px-2 text-sm text-secondary-700 focus:outline-none focus:ring-1",
                                hasError
                                  ? "border-error-400 focus:border-error-500 focus:ring-error-500/15"
                                  : "border-secondary-200 focus:border-primary-400 focus:ring-primary-500/15",
                              ].join(" ")}
                              aria-label={`Giá flash cho ${item.tenPhienBan}`}
                            />
                            {hasError && (
                              <p className="mt-0.5 flex items-center gap-0.5 text-[10px] text-error-600">
                                <ExclamationCircleIcon className="h-3 w-3" aria-hidden="true" />
                                {errors[idx]?.giaFlash}
                              </p>
                            )}
                          </div>
                          {pct > 0 && !hasError && (
                            <span className="shrink-0 rounded-md bg-success-50 border border-success-200 px-1.5 py-0.5 text-[10px] font-bold text-success-700 whitespace-nowrap">
                              -{pct}%
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock limit */}
                      <td className="px-3 py-2.5">
                        <input
                          type="number"
                          value={item.soLuongGioiHan || ""}
                          min={1}
                          max={10000}
                          onChange={(e) =>
                            updateItem(idx, {
                              soLuongGioiHan: parseInt(e.target.value, 10) || 1,
                            })
                          }
                          className="w-20 h-8 rounded border border-secondary-200 px-2 text-sm text-secondary-700 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-500/15"
                          aria-label={`Giới hạn số lượng cho ${item.tenPhienBan}`}
                        />
                      </td>

                      {/* Sold (readonly, edit mode only) */}
                      {showSold && (
                        <td className="px-3 py-2.5 text-right">
                          <span className="text-sm font-semibold text-secondary-700">
                            {soldQty}
                          </span>
                          <span className="text-xs text-secondary-400">
                            /{item.soLuongGioiHan}
                          </span>
                        </td>
                      )}

                      {/* Display order */}
                      <td className="px-3 py-2.5 text-center">
                        <input
                          type="number"
                          value={item.thuTuHienThi || ""}
                          min={1}
                          onChange={(e) =>
                            updateItem(idx, {
                              thuTuHienThi: parseInt(e.target.value, 10) || 1,
                            })
                          }
                          className="w-14 h-8 rounded border border-secondary-200 px-1 text-sm text-center text-secondary-700 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-500/15"
                          aria-label={`Thứ tự hiển thị cho ${item.tenPhienBan}`}
                        />
                      </td>

                      {/* Remove */}
                      <td className="px-3 py-2.5 text-center">
                        <button
                          type="button"
                          aria-label={`Xóa ${item.tenPhienBan}`}
                          onClick={() => removeItem(idx)}
                          className="flex h-7 w-7 items-center justify-center rounded text-secondary-400 hover:bg-error-50 hover:text-error-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error-500"
                        >
                          <TrashIcon className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Picker modal */}
      <VariantPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleVariantSelected}
        excludeIds={excludeIds}
      />
    </div>
  );
}
