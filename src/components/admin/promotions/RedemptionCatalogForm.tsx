"use client";

import { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { LoyaltyRedemptionCatalog } from "@/src/types/loyalty.types";
import type { SelectOption } from "@/src/components/ui/Select";
import { Select } from "@/src/components/ui/Select";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { Toggle } from "@/src/components/ui/Toggle";
import { DateInput } from "@/src/components/ui/DateInput";
import { Button } from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/Toast";
import { getPromotionList } from "@/src/services/promotion.service";
import {
  createRedemptionCatalogItem,
  updateRedemptionCatalogItem,
} from "@/src/services/loyalty.service";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  item?: LoyaltyRedemptionCatalog;
  onClose: () => void;
  onSaved: (item: LoyaltyRedemptionCatalog) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RedemptionCatalogForm({ item, onClose, onSaved }: Props) {
  const { showToast } = useToast();
  const isEdit = !!item;

  // ── Form state ─────────────────────────────────────────────────────────────
  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [pointsRequired, setPointsRequired] = useState(
    item?.pointsRequired ? String(item.pointsRequired) : ""
  );
  const [promotionId, setPromotionId] = useState(item?.promotionId ?? "");
  const [isActive, setIsActive] = useState(item?.isActive ?? true);
  const [stockLimit, setStockLimit] = useState(
    item?.stockLimit != null ? String(item.stockLimit) : ""
  );
  const [validFrom, setValidFrom] = useState(item?.validFrom ?? "");
  const [validUntil, setValidUntil] = useState(item?.validUntil ?? "");

  // ── Coupon options ─────────────────────────────────────────────────────────
  const [couponOptions, setCouponOptions] = useState<SelectOption[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);

  useEffect(() => {
    getPromotionList().then((promos) => {
      const coupons = promos.filter((p) => p.isCoupon);
      setCouponOptions(
        coupons.map((p) => ({
          value: p.id,
          label: p.code ?? p.name,
          description: p.discountDisplay ?? p.name,
          boldLabel: true,
        }))
      );
      setLoadingCoupons(false);
    });
  }, []);

  // ── Validation errors ──────────────────────────────────────────────────────
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required.";
    const pts = Number(pointsRequired);
    if (!pointsRequired || isNaN(pts) || pts <= 0)
      newErrors.pointsRequired = "Points required must be greater than 0.";
    if (!promotionId) newErrors.promotionId = "Please select a coupon.";
    if (validFrom && validUntil && validUntil <= validFrom)
      newErrors.validUntil = "Valid Until must be after Valid From.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        pointsRequired: pts,
        promotionId,
        isActive,
        stockLimit: stockLimit ? Number(stockLimit) : undefined,
        validFrom: validFrom || undefined,
        validUntil: validUntil || undefined,
      };

      const result = isEdit
        ? await updateRedemptionCatalogItem(item!.id, payload)
        : await createRedemptionCatalogItem(payload);

      showToast(isEdit ? "Catalog item updated." : "Catalog item created.", "success");
      onSaved(result);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-w-lg w-full bg-white rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-secondary-900">
            {isEdit ? "Edit Redemption Item" : "New Redemption Item"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-600 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <Input
            label="Name"
            required
            placeholder="e.g. Summer 20% Off Coupon"
            value={name}
            onChange={(e) => setName(e.target.value)}
            errorMessage={errors.name}
            fullWidth
          />

          {/* Description */}
          <Textarea
            label="Description"
            placeholder="Optional description…"
            rows={2}
            maxCharCount={300}
            showCharCount
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Points Required */}
          <Input
            label="Points Required"
            type="number"
            min={1}
            required
            placeholder="e.g. 800"
            value={pointsRequired}
            onChange={(e) => setPointsRequired(e.target.value)}
            errorMessage={errors.pointsRequired}
            fullWidth
          />

          {/* Coupon to Award */}
          <Select
            label="Coupon to Award"
            placeholder={loadingCoupons ? "Loading coupons…" : "Select a coupon…"}
            options={couponOptions}
            value={promotionId}
            onChange={(v) => setPromotionId(v as string)}
            searchable
            clearable
            disabled={loadingCoupons}
            errorMessage={errors.promotionId}
            helperText="Only coupons (is_coupon=TRUE) are shown"
          />

          {/* Active toggle */}
          <div className="flex items-center gap-3 py-1">
            <Toggle
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              label="Active"
            />
          </div>

          {/* Stock Limit */}
          <Input
            label="Stock Limit"
            type="number"
            min={1}
            placeholder="Blank = unlimited"
            value={stockLimit}
            onChange={(e) => setStockLimit(e.target.value)}
            fullWidth
          />

          {/* Valid From / Until */}
          <div className="grid grid-cols-2 gap-3">
            <DateInput
              label="Valid From"
              value={validFrom}
              onChange={setValidFrom}
            />
            <DateInput
              label="Valid Until"
              value={validUntil}
              onChange={setValidUntil}
              errorMessage={errors.validUntil}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={saving} disabled={saving}>
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
