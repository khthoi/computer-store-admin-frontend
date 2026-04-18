"use client";

import { useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/src/components/ui/Modal";
import { Input } from "@/src/components/ui/Input";
import { DateInput } from "@/src/components/ui/DateInput";
import { Button } from "@/src/components/ui/Button";
import { RadioGroup, Radio } from "@/src/components/ui/Radio";
import { useToast } from "@/src/components/ui/Toast";
import {
  UpdateProfileSchema,
  type UpdateProfileFormValues,
} from "@/src/lib/validators/profile.schema";
import { updateCurrentProfile } from "@/src/services/profile.service";
import type { NhanVien, GenderType } from "@/src/types/employee.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProfileEditFormProps {
  isOpen: boolean;
  onClose: () => void;
  employee: NhanVien;
  onSaved: (updated: NhanVien) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProfileEditForm({
  isOpen,
  onClose,
  employee,
  onSaved,
}: ProfileEditFormProps) {
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: {
      fullName: employee.fullName,
      phone: employee.phone ?? "",
      gender: employee.gender ?? null,
      dateOfBirth: employee.dateOfBirth ?? "",
    },
  });

  // Reset form to latest employee data when modal opens
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        reset({
          fullName: employee.fullName,
          phone: employee.phone ?? "",
          gender: employee.gender ?? null,
          dateOfBirth: employee.dateOfBirth ?? "",
        });
      } else {
        onClose();
      }
    },
    [employee, reset, onClose]
  );

  const onSubmit = useCallback(
    async (values: UpdateProfileFormValues) => {
      try {
        const updated = await updateCurrentProfile({
          fullName: values.fullName,
          phone: values.phone ?? "",
          gender: values.gender ?? null,
          dateOfBirth: values.dateOfBirth || null,
        });
        showToast("Cập nhật hồ sơ thành công.", "success");
        onSaved(updated);
        onClose();
      } catch {
        showToast("Cập nhật thất bại, vui lòng thử lại.", "error");
      }
    },
    [showToast, onSaved, onClose]
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => handleOpenChange(false)}
      title="Chỉnh sửa hồ sơ"
      size="xl"
      animated
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang lưu…" : "Lưu thay đổi"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Họ và tên"
          placeholder="VD: Nguyễn Văn A"
          required
          errorMessage={errors.fullName?.message}
          {...register("fullName")}
        />

        <Input
          label="Số điện thoại"
          placeholder="09xxxxxxxx"
          errorMessage={errors.phone?.message}
          {...register("phone")}
        />

        <Controller
          control={control}
          name="gender"
          render={({ field }) => (
            <RadioGroup legend="Giới tính" direction="horizontal">
              {(["male", "female", "other"] as GenderType[]).map((g) => (
                <Radio
                  key={g}
                  name="profile-gender"
                  value={g}
                  label={g === "male" ? "Nam" : g === "female" ? "Nữ" : "Khác"}
                  checked={field.value === g}
                  onChange={() => field.onChange(g)}
                />
              ))}
            </RadioGroup>
          )}
        />

        <Controller
          control={control}
          name="dateOfBirth"
          render={({ field }) => (
            <DateInput
              label="Ngày sinh"
              value={field.value ?? ""}
              onChange={field.onChange}
              errorMessage={errors.dateOfBirth?.message}
              placeholder="DD/MM/YYYY"
            />
          )}
        />

        {/* Read-only fields */}
        <Input
          label="Mã nhân viên"
          value={employee.code}
          disabled
          helperText="Mã nhân viên không thể thay đổi."
        />
        <Input
          label="Email"
          value={employee.email}
          disabled
          helperText="Email đăng nhập không thể thay đổi."
        />
      </div>
    </Modal>
  );
}
