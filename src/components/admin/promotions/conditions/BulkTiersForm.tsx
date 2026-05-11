"use client";

import { useMemo } from "react";
import { PlusIcon, TrashIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Select } from "@/src/components/ui/Select";
import { formatVND } from "@/src/lib/format";
import type { BulkTier, DiscountType } from "@/src/types/promotion.types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface BulkTiersFormProps {
  tiers: BulkTier[];
  onChange: (tiers: BulkTier[]) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BulkTiersForm({ tiers, onChange }: BulkTiersFormProps) {
  // ── Overlap / gap detection ──────────────────────────────────────────────────
  const tierIssues = useMemo(() => {
    const issues: { type: "overlap" | "gap"; idxA: number; idxB: number; msg: string }[] = [];
    for (let i = 0; i < tiers.length - 1; i++) {
      const curr = tiers[i];
      const next = tiers[i + 1];
      if (curr.maxQuantity === undefined) continue;
      if (curr.maxQuantity >= next.minQuantity) {
        issues.push({
          type: "overlap",
          idxA: i,
          idxB: i + 1,
          msg: `Bậc ${i + 1} (tối đa ${curr.maxQuantity}) và Bậc ${i + 2} (tối thiểu ${next.minQuantity}) bị chồng lấp — cùng số lượng được tính 2 bậc.`,
        });
      } else if (curr.maxQuantity + 1 < next.minQuantity) {
        issues.push({
          type: "gap",
          idxA: i,
          idxB: i + 1,
          msg: `Khoảng trống ${curr.maxQuantity + 1}–${next.minQuantity - 1} sản phẩm giữa Bậc ${i + 1} và Bậc ${i + 2} — đơn trong khoảng này không được giảm giá.`,
        });
      }
    }
    return issues;
  }, [tiers]);

  const tierFlags = useMemo(() => {
    const flags: ("overlap" | "gap" | null)[] = tiers.map(() => null);
    for (const issue of tierIssues) {
      if (issue.type === "overlap") {
        flags[issue.idxA] = "overlap";
        flags[issue.idxB] = "overlap";
      } else {
        if (flags[issue.idxA] !== "overlap") flags[issue.idxA] = "gap";
      }
    }
    return flags;
  }, [tierIssues, tiers]);

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
        Xác định các bậc số lượng. Bậc cao nhất phù hợp sẽ được áp dụng.
        Để trống "SL tối đa" cho bậc cao nhất (không giới hạn trên).
      </p>

      {tiers.length === 0 && (
        <p className="text-sm text-secondary-400 italic">Chưa có bậc nào.</p>
      )}

      {/* Header */}
      {tiers.length > 0 && (
        <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 px-3 text-[10px] font-semibold uppercase tracking-wide text-secondary-400">
          <span>SL tối thiểu</span>
          <span>SL tối đa</span>
          <span>Giảm giá</span>
          <span>Loại</span>
          <span />
        </div>
      )}

      {tiers.map((tier, idx) => (
        <div
          key={idx}
          className={[
            "grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-center rounded-xl border px-3 py-2.5",
            tierFlags[idx] === "overlap"
              ? "border-error-300 bg-error-50"
              : tierFlags[idx] === "gap"
              ? "border-warning-300 bg-warning-50"
              : "border-secondary-200 bg-secondary-50",
          ].join(" ")}
        >
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
          <Select
            options={[
              { value: "percentage", label: "% giảm" },
              { value: "fixed",      label: "₫ giảm/SP" },
            ]}
            value={tier.discountType}
            onChange={(v) => updateTier(idx, { discountType: v as DiscountType })}
            size="sm"
          />

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
        Thêm bậc
      </button>

      {/* Multiple discount type warning */}
      {hasMultipleTypes && (
        <div className="flex items-start gap-2 rounded-lg bg-warning-50 border border-warning-200 px-3 py-2 text-xs text-warning-700">
          <ExclamationTriangleIcon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          Các bậc đang dùng nhiều loại giảm giá khác nhau (% và ₫) — đảm bảo đây là cố ý.
        </div>
      )}

      {/* Overlap / gap issues */}
      {tierIssues.length > 0 && (
        <div className="space-y-1.5">
          {tierIssues.map((issue, i) => (
            <div
              key={i}
              className={[
                "flex items-start gap-2 rounded-lg px-3 py-2 text-xs",
                issue.type === "overlap"
                  ? "bg-error-50 border border-error-200 text-error-700"
                  : "bg-warning-50 border border-warning-200 text-warning-700",
              ].join(" ")}
            >
              <ExclamationTriangleIcon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                <span className="font-semibold">{issue.type === "overlap" ? "Lỗi chồng lấp: " : "Cảnh báo khoảng trống: "}</span>
                {issue.msg}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Preview */}
      {tiers.length > 0 && (
        <div className="rounded-xl bg-secondary-50 border border-secondary-200 px-4 py-3 space-y-1">
          <p className="text-xs font-semibold text-secondary-600">Xem trước bậc:</p>
          {tiers.map((tier, idx) => (
            <p key={idx} className="text-xs text-secondary-600">
              • Mua {tier.minQuantity}{tier.maxQuantity ? `–${tier.maxQuantity}` : "+"} sản phẩm →{" "}
              <span className="font-semibold text-primary-700">
                {tier.discountType === "percentage"
                  ? `${tier.discountValue}% giảm`
                  : `${formatVND(tier.discountValue)} giảm/sản phẩm`}
              </span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
