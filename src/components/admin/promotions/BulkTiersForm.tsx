"use client";

import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { formatVND } from "@/src/lib/format";
import type { BulkTier, DiscountType } from "@/src/types/promotion.types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface BulkTiersFormProps {
  tiers: BulkTier[];
  onChange: (tiers: BulkTier[]) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BulkTiersForm({ tiers, onChange }: BulkTiersFormProps) {
  function addTier() {
    const prevMax = tiers[tiers.length - 1]?.maxQuantity;
    const newMin = prevMax !== undefined ? prevMax + 1 : (tiers.length === 0 ? 2 : 1);
    onChange([
      ...tiers,
      {
        minQuantity: newMin,
        maxQuantity: undefined,
        discountValue: 5,
        discountType: tiers[0]?.discountType ?? "percentage",
      },
    ]);
  }

  function removeTier(idx: number) {
    onChange(tiers.filter((_, i) => i !== idx));
  }

  function updateTier(idx: number, patch: Partial<BulkTier>) {
    onChange(tiers.map((t, i) => (i === idx ? { ...t, ...patch } : t)));
  }

  const hasMultipleTypes = new Set(tiers.map((t) => t.discountType)).size > 1;

  return (
    <div className="space-y-3">
      <p className="text-xs text-secondary-500">
        Define quantity tiers. The highest applicable tier will be applied.
        Leave "Max qty" blank for the top tier (unlimited upper bound).
      </p>

      {tiers.length === 0 && (
        <p className="text-sm text-secondary-400 italic">No tiers defined.</p>
      )}

      {/* Header */}
      {tiers.length > 0 && (
        <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 px-3 text-[10px] font-semibold uppercase tracking-wide text-secondary-400">
          <span>Min Qty</span>
          <span>Max Qty</span>
          <span>Discount</span>
          <span>Type</span>
          <span />
        </div>
      )}

      {tiers.map((tier, idx) => (
        <div key={idx} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-center rounded-xl border border-secondary-200 bg-secondary-50 px-3 py-2.5">
          {/* Min qty */}
          <input
            type="number"
            min={1}
            step={1}
            value={tier.minQuantity}
            onChange={(e) => updateTier(idx, { minQuantity: Math.max(1, parseInt(e.target.value, 10) || 1) })}
            className="w-full rounded-lg border border-secondary-300 bg-white px-2 py-1.5 text-sm text-center text-secondary-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />

          {/* Max qty */}
          <input
            type="number"
            min={tier.minQuantity}
            step={1}
            value={tier.maxQuantity ?? ""}
            placeholder="∞"
            onChange={(e) =>
              updateTier(idx, {
                maxQuantity: e.target.value ? parseInt(e.target.value, 10) : undefined,
              })
            }
            className="w-full rounded-lg border border-secondary-300 bg-white px-2 py-1.5 text-sm text-center text-secondary-800 placeholder:text-secondary-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />

          {/* Discount value */}
          <div className="relative">
            <input
              type="number"
              min={0}
              max={tier.discountType === "percentage" ? 100 : undefined}
              step={tier.discountType === "percentage" ? 1 : 1000}
              value={tier.discountValue}
              onChange={(e) => updateTier(idx, { discountValue: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-lg border border-secondary-300 bg-white px-2 py-1.5 text-sm text-center text-secondary-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          {/* Discount type */}
          <select
            value={tier.discountType}
            onChange={(e) => updateTier(idx, { discountType: e.target.value as DiscountType })}
            className="w-full rounded-lg border border-secondary-300 bg-white px-2 py-1.5 text-sm text-secondary-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="percentage">% off</option>
            <option value="fixed">₫ off/item</option>
          </select>

          {/* Remove */}
          <button
            type="button"
            onClick={() => removeTier(idx)}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-error-500 hover:bg-error-50 transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addTier}
        className="inline-flex items-center gap-2 rounded-lg border border-dashed border-secondary-300 px-4 py-2 text-sm font-medium text-secondary-500 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
      >
        <PlusIcon className="w-4 h-4" />
        Add Tier
      </button>

      {/* Preview */}
      {tiers.length > 0 && (
        <div className="rounded-xl bg-secondary-50 border border-secondary-200 px-4 py-3 space-y-1">
          <p className="text-xs font-semibold text-secondary-600">Tier preview:</p>
          {tiers.map((tier, idx) => (
            <p key={idx} className="text-xs text-secondary-600">
              • Buy {tier.minQuantity}{tier.maxQuantity ? `–${tier.maxQuantity}` : "+"} items →{" "}
              <span className="font-semibold text-primary-700">
                {tier.discountType === "percentage"
                  ? `${tier.discountValue}% off`
                  : `${formatVND(tier.discountValue)} off per item`}
              </span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
