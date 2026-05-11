"use client";

import { TrashIcon, PlusIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Input } from "@/src/components/ui/Input";
import { Button } from "@/src/components/ui/Button";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FlashSaleProduct {
  productId: string;
  name: string;
  sku: string;
  originalPrice: number;
  flashPrice: number;
  stockLimit: number;
  displayOrder: number;
}

export interface FlashSaleConfig {
  startAt: string;
  endAt: string;
  bannerTitle: string;
  products: FlashSaleProduct[];
}

export interface FlashSaleSchedulerProps {
  value: FlashSaleConfig;
  onChange: (v: FlashSaleConfig) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style:    "currency",
    currency: "VND",
  }).format(amount);
}

function discountPercent(originalPrice: number, flashPrice: number): number {
  if (!originalPrice || flashPrice >= originalPrice) return 0;
  return Math.round((1 - flashPrice / originalPrice) * 100);
}

function generateMockProduct(): FlashSaleProduct {
  const id = Math.random().toString(36).slice(2, 8);
  return {
    productId:     id,
    name:          `Sản phẩm mẫu #${id.toUpperCase()}`,
    sku:           `SKU-${id.toUpperCase()}`,
    originalPrice: 2_000_000,
    flashPrice:    1_500_000,
    stockLimit:    50,
    displayOrder:  1,
  };
}

const MS_PER_HOUR = 3_600_000;

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * FlashSaleScheduler — three-section form for configuring a flash sale event.
 *
 * Section 1: start / end datetime pickers with validation.
 * Section 2: banner title.
 * Section 3: product list with inline flash price and stock limit editing.
 */
export function FlashSaleScheduler({ value, onChange }: FlashSaleSchedulerProps) {
  // ── Derived validation ────────────────────────────────────────────────────

  const startDate = value.startAt ? new Date(value.startAt) : null;
  const endDate   = value.endAt   ? new Date(value.endAt)   : null;

  const invalidDateRange =
    startDate && endDate && endDate <= startDate;

  const durationHours =
    startDate && endDate && endDate > startDate
      ? (endDate.getTime() - startDate.getTime()) / MS_PER_HOUR
      : 0;

  const longDurationWarning = durationHours > 24;

  // ── Helpers ───────────────────────────────────────────────────────────────

  function updateProduct(productId: string, patch: Partial<FlashSaleProduct>) {
    onChange({
      ...value,
      products: value.products.map((p) =>
        p.productId === productId ? { ...p, ...patch } : p
      ),
    });
  }

  function removeProduct(productId: string) {
    onChange({
      ...value,
      products: value.products.filter((p) => p.productId !== productId),
    });
  }

  function handleAddMockProduct() {
    onChange({ ...value, products: [...value.products, generateMockProduct()] });
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
      {/* ── Section 1: Schedule ─────────────────────────────────────────── */}
      <div>
        <p className="text-sm font-semibold text-secondary-800 mb-3">
          Lịch flash sale
        </p>
        <div className="grid grid-cols-2 gap-4">
          {/* Start */}
          <div>
            <label className="mb-1 block text-sm font-medium text-secondary-700">
              Bắt đầu
            </label>
            <input
              type="datetime-local"
              value={value.startAt}
              onChange={(e) => onChange({ ...value, startAt: e.target.value })}
              className="w-full h-10 rounded border border-secondary-300 bg-white px-3 text-sm text-secondary-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/15"
            />
          </div>

          {/* End */}
          <div>
            <label className="mb-1 block text-sm font-medium text-secondary-700">
              Kết thúc
            </label>
            <input
              type="datetime-local"
              value={value.endAt}
              onChange={(e) => onChange({ ...value, endAt: e.target.value })}
              min={value.startAt || undefined}
              className={[
                "w-full h-10 rounded border bg-white px-3 text-sm text-secondary-700 focus:outline-none focus:ring-2",
                invalidDateRange
                  ? "border-error-400 focus:border-error-500 focus:ring-error-500/15"
                  : "border-secondary-300 focus:border-primary-500 focus:ring-primary-500/15",
              ].join(" ")}
            />
          </div>
        </div>

        {/* Validation messages */}
        {invalidDateRange && (
          <p className="mt-2 text-xs text-error-600 flex items-center gap-1">
            <ExclamationTriangleIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Thời gian kết thúc phải sau thời gian bắt đầu.
          </p>
        )}
        {longDurationWarning && (
          <p className="mt-2 text-xs text-warning-600 flex items-center gap-1">
            <ExclamationTriangleIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Thời gian flash sale vượt quá 24 giờ ({durationHours.toFixed(1)}h) — hãy kiểm tra lại.
          </p>
        )}
      </div>

      {/* ── Section 2: Banner ──────────────────────────────────────────────── */}
      <div className="border-t border-secondary-100 pt-5">
        <p className="text-sm font-semibold text-secondary-800 mb-3">
          Banner flash sale
        </p>
        <Input
          label="Tiêu đề banner flash sale"
          value={value.bannerTitle}
          onChange={(e) => onChange({ ...value, bannerTitle: e.target.value })}
          placeholder="VD: Flash Sale cuối tuần — giảm đến 50%!"
        />
      </div>

      {/* ── Section 3: Products ────────────────────────────────────────────── */}
      <div className="border-t border-secondary-100 pt-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-secondary-800">
            Sản phẩm flash sale
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            leftIcon={<PlusIcon />}
            onClick={handleAddMockProduct}
          >
            Thêm sản phẩm
          </Button>
        </div>

        {value.products.length === 0 ? (
          <p className="text-sm text-secondary-400 py-4 text-center rounded-xl border border-dashed border-secondary-200">
            Chưa có sản phẩm nào. Nhấn "Thêm sản phẩm" để bắt đầu.
          </p>
        ) : (
          <div className="rounded-xl border border-secondary-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-secondary-100 bg-secondary-50">
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wide">
                      Sản phẩm / SKU
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-secondary-500 uppercase tracking-wide whitespace-nowrap">
                      Giá gốc
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wide whitespace-nowrap">
                      Giá flash
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wide whitespace-nowrap">
                      Giới hạn tồn kho
                    </th>
                    <th className="px-3 py-2.5 text-center text-xs font-semibold text-secondary-500 uppercase tracking-wide">
                      Thứ tự
                    </th>
                    <th className="px-3 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-50">
                  {value.products.map((prod) => {
                    const pct = discountPercent(prod.originalPrice, prod.flashPrice);
                    return (
                      <tr key={prod.productId} className="hover:bg-secondary-50 transition-colors">
                        {/* Name + SKU */}
                        <td className="px-3 py-2.5">
                          <p className="font-medium text-secondary-900 truncate max-w-[180px]">
                            {prod.name}
                          </p>
                          <p className="font-mono text-xs text-secondary-400 mt-0.5">
                            {prod.sku}
                          </p>
                        </td>

                        {/* Original price */}
                        <td className="px-3 py-2.5 text-right text-secondary-500 whitespace-nowrap">
                          {formatVnd(prod.originalPrice)}
                        </td>

                        {/* Flash price + discount % */}
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={prod.flashPrice}
                              min={0}
                              onChange={(e) =>
                                updateProduct(prod.productId, {
                                  flashPrice: parseInt(e.target.value, 10) || 0,
                                })
                              }
                              className="w-28 h-8 rounded border border-secondary-200 px-2 text-sm text-secondary-700 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-500/15"
                            />
                            {pct > 0 && (
                              <span className="text-xs font-semibold text-success-600 whitespace-nowrap">
                                -{pct}%
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Stock limit */}
                        <td className="px-3 py-2.5">
                          <input
                            type="number"
                            value={prod.stockLimit}
                            min={1}
                            onChange={(e) =>
                              updateProduct(prod.productId, {
                                stockLimit: parseInt(e.target.value, 10) || 1,
                              })
                            }
                            className="w-20 h-8 rounded border border-secondary-200 px-2 text-sm text-secondary-700 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-500/15"
                          />
                        </td>

                        {/* Display order */}
                        <td className="px-3 py-2.5 text-center">
                          <input
                            type="number"
                            value={prod.displayOrder}
                            min={1}
                            onChange={(e) =>
                              updateProduct(prod.productId, {
                                displayOrder: parseInt(e.target.value, 10) || 1,
                              })
                            }
                            className="w-14 h-8 rounded border border-secondary-200 px-1 text-sm text-center text-secondary-700 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-500/15"
                          />
                        </td>

                        {/* Remove */}
                        <td className="px-3 py-2.5 text-center">
                          <button
                            type="button"
                            aria-label={`Xóa ${prod.name}`}
                            onClick={() => removeProduct(prod.productId)}
                            className="flex items-center justify-center h-7 w-7 rounded text-secondary-400 hover:bg-error-50 hover:text-error-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error-500"
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
      </div>
    </div>
  );
}
