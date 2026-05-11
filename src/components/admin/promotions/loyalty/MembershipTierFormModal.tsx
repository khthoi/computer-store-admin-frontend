"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import type { MembershipTier } from "@/src/types/loyalty.types";
import { Modal } from "@/src/components/ui/Modal";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { Toggle } from "@/src/components/ui/Toggle";
import { ColorSelect } from "@/src/components/ui/ColorSelect";
import { Button } from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/Toast";
import { createMembershipTier, getMembershipTiersAdmin, updateMembershipTier } from "@/src/services/loyalty.service";
import { membershipTierSchema, type MembershipTierFormValues } from "@/src/lib/validators/membership-tier.schema";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  tier?: MembershipTier;
  onClose: () => void;
  onSaved: () => void;
}

const FORM_ID = "membership-tier-form";

// ─── Component ────────────────────────────────────────────────────────────────

export function MembershipTierFormModal({ tier, onClose, onSaved }: Props) {
  const { showToast } = useToast();
  const isEdit = !!tier;
  const [isFetchingMin, setIsFetchingMin] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MembershipTierFormValues>({
    resolver: zodResolver(membershipTierSchema),
    defaultValues: {
      displayName: tier?.displayName ?? "",
      minPoints: tier?.minPoints ?? 0,
      unlimited: tier?.maxPoints === null,
      maxPoints: tier?.maxPoints ?? undefined,
      color: tier?.color ?? "",
      description: tier?.description ?? "",
      isActive: tier?.isActive ?? true,
    },
  });

  const unlimited = watch("unlimited");

  useEffect(() => {
    if (isEdit) return;
    setIsFetchingMin(true);
    getMembershipTiersAdmin(1, 200)
      .then(({ data }) => {
        // Sort highest rank first (by minPoints desc) then find first with a finite maxPoints
        const sorted = [...data].sort((a, b) => b.minPoints - a.minPoints);
        const found = sorted.find((t) => t.maxPoints !== null);
        setValue("minPoints", found ? (found.maxPoints as number) + 1 : 0);
      })
      .catch(() => { /* leave default 0 */ })
      .finally(() => setIsFetchingMin(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(values: MembershipTierFormValues) {
    const payload = {
      displayName: values.displayName.trim(),
      minPoints: values.minPoints,
      maxPoints: values.unlimited ? null : (values.maxPoints ?? null),
      color: values.color?.trim() || null,
      description: values.description?.trim() || null,
      isActive: values.isActive,
    };

    try {
      if (isEdit) {
        await updateMembershipTier(tier!.id, payload);
        showToast("Đã cập nhật bậc thứ hạng.", "success");
      } else {
        await createMembershipTier(payload);
        showToast("Đã thêm bậc thứ hạng mới.", "success");
      }
      onSaved();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Không thể lưu.", "error");
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? "Sửa bậc thứ hạng" : "Thêm bậc thứ hạng"}
      size="xl"
      animated
      closeOnBackdrop={!isSubmitting}
      closeOnEscape={!isSubmitting}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Huỷ
          </Button>
          <Button type="submit" form={FORM_ID} variant="primary" isLoading={isSubmitting} disabled={isSubmitting}>
            Lưu
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Inline guide */}
        <div className="rounded-xl border border-primary-200 bg-primary-50 p-4 text-sm text-primary-800">
          <div className="flex gap-2">
            <InformationCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
            <div className="space-y-1">
              <p className="font-semibold">Cách hoạt động của bậc thứ hạng</p>
              <ul className="list-disc space-y-0.5 pl-4 text-primary-700">
                <li>Khoảng điểm của các bậc <strong>không được chồng lấp nhau</strong>.</li>
                <li>Chỉ <strong>một bậc</strong> được phép có điểm tối đa "Không giới hạn".</li>
                <li>Sau khi lưu, hệ thống tự động xếp lại rank cho khách hàng.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tên bậc */}
        <Input
          label="Tên bậc"
          required
          placeholder="VD: Hạng Vàng"
          fullWidth
          errorMessage={errors.displayName?.message}
          {...register("displayName")}
        />

        {/* Điểm tối thiểu */}
        <Input
          label="Điểm tối thiểu"
          type="number"
          required
          placeholder={isFetchingMin ? "Đang tải…" : "VD: 3000"}
          fullWidth
          disabled={isFetchingMin}
          errorMessage={errors.minPoints?.message}
          {...register("minPoints", { valueAsNumber: true })}
        />

        {/* Không giới hạn toggle */}
        <Controller
          name="unlimited"
          control={control}
          render={({ field }) => (
            <div className="flex items-center gap-3">
              <Toggle
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                size="sm"
              />
              <label className="text-sm text-secondary-700">
                Không giới hạn điểm tối đa (bậc cao nhất)
              </label>
            </div>
          )}
        />

        {/* Điểm tối đa */}
        {!unlimited && (
          <Input
            label="Điểm tối đa"
            type="number"
            required
            placeholder="VD: 4999"
            fullWidth
            errorMessage={errors.maxPoints?.message}
            {...register("maxPoints", { valueAsNumber: true })}
          />
        )}

        {/* Màu đại diện */}
        <Controller
          name="color"
          control={control}
          render={({ field }) => (
            <ColorSelect
              label="Màu đại diện"
              value={field.value || "#ef4444"}
              onChange={field.onChange}
              errorMessage={errors.color?.message}
              helperText={watch("displayName") || undefined}
            />
          )}
        />

        {/* Mô tả */}
        <Textarea
          label="Mô tả / Đặc quyền"
          placeholder="Mô tả đặc quyền của bậc này hiển thị trên storefront…"
          rows={5}
          showCharCount
          maxLength={400}
          errorMessage={errors.description?.message}
          {...register("description")}
        />

        {/* Kích hoạt */}
        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <div className="flex items-center gap-3">
              <Toggle
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                size="sm"
              />
              <label className="text-sm text-secondary-700">Kích hoạt bậc này</label>
            </div>
          )}
        />
      </form>
    </Modal>
  );
}
