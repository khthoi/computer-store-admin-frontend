"use client";

import { useEffect, useState } from "react";
import type { LoyaltyRedemptionCatalog } from "@/src/types/loyalty.types";
import type { SelectOption } from "@/src/components/ui/Select";
import { Modal } from "@/src/components/ui/Modal";
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
  onSaved: () => void;
}

const FORM_ID = "redemption-catalog-form";

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
      const coupons = promos.data.filter((p) => p.isCoupon);
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
    if (!name.trim()) newErrors.name = "Tên không được để trống.";
    const pts = Number(pointsRequired);
    if (!pointsRequired || isNaN(pts) || pts <= 0)
      newErrors.pointsRequired = "Điểm cần dùng phải lớn hơn 0.";
    if (!promotionId) newErrors.promotionId = "Vui lòng chọn mã giảm giá.";
    if (validFrom && validUntil && validUntil <= validFrom)
      newErrors.validUntil = "Ngày kết thúc phải sau ngày bắt đầu.";

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

      if (isEdit) {
        await updateRedemptionCatalogItem(item!.id, payload);
      } else {
        await createRedemptionCatalogItem(payload);
      }

      showToast(isEdit ? "Đã cập nhật mục đổi thưởng." : "Đã thêm mục đổi thưởng.", "success");
      onSaved();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Không thể lưu.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? "Sửa mục đổi thưởng" : "Thêm mục đổi thưởng"}
      size="2xl"
      animated
      closeOnBackdrop={!saving}
      closeOnEscape={!saving}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Huỷ
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            variant="primary"
            isLoading={saving}
            disabled={saving}
          >
            Lưu
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-4">
        {/* Tên */}
        <Input
          label="Tên"
          required
          placeholder="VD: Phiếu giảm giá 20% mùa hè"
          value={name}
          onChange={(e) => setName(e.target.value)}
          errorMessage={errors.name}
          fullWidth
        />

        {/* Mô tả */}
        <Textarea
          label="Mô tả"
          placeholder="Mô tả tùy chọn…"
          rows={2}
          maxCharCount={300}
          showCharCount
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Điểm cần dùng */}
        <Input
          label="Điểm cần dùng"
          type="number"
          min={1}
          required
          placeholder="VD: 800"
          value={pointsRequired}
          onChange={(e) => setPointsRequired(e.target.value)}
          errorMessage={errors.pointsRequired}
          fullWidth
        />

        {/* Mã giảm giá trao thưởng */}
        <Select
          label="Mã giảm giá trao thưởng"
          placeholder={loadingCoupons ? "Đang tải mã giảm giá…" : "Chọn mã giảm giá…"}
          options={couponOptions}
          value={promotionId}
          onChange={(v) => setPromotionId(v as string)}
          searchable
          clearable
          disabled={loadingCoupons}
          errorMessage={errors.promotionId}
          helperText="Chỉ hiển thị mã giảm giá (is_coupon=TRUE)"
        />

        {/* Kích hoạt */}
        <div className="flex items-center gap-3 py-1">
          <Toggle
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            label="Kích hoạt"
          />
        </div>

        {/* Giới hạn tồn kho */}
        <Input
          label="Giới hạn tồn kho"
          type="number"
          min={1}
          placeholder="Để trống = không giới hạn"
          value={stockLimit}
          onChange={(e) => setStockLimit(e.target.value)}
          fullWidth
        />

        {/* Thời hạn */}
        <div className="grid grid-cols-2 gap-3">
          <DateInput
            label="Từ ngày"
            value={validFrom}
            onChange={setValidFrom}
          />
          <DateInput
            label="Đến ngày"
            value={validUntil}
            onChange={setValidUntil}
            errorMessage={errors.validUntil}
          />
        </div>
      </form>
    </Modal>
  );
}
