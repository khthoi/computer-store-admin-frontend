"use client";

import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { Modal } from "@/src/components/ui/Modal";
import { PasswordInput } from "@/src/components/ui/PasswordInput";
import { Button } from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/Toast";
import {
  ChangePasswordSchema,
  type ChangePasswordFormValues,
} from "@/src/lib/validators/profile.schema";
import { changeCurrentPassword } from "@/src/services/profile.service";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChangePasswordFormProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ChangePasswordForm({ isOpen, onClose }: ChangePasswordFormProps) {
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const onSubmit = useCallback(
    async (values: ChangePasswordFormValues) => {
      try {
        await changeCurrentPassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });
        showToast("Đổi mật khẩu thành công.", "success");
        handleClose();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Đổi mật khẩu thất bại, vui lòng thử lại.";
        showToast(message, "error");
      }
    },
    [showToast, handleClose]
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Đổi mật khẩu"
      size="xl"
      animated
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang xử lý…" : "Xác nhận đổi mật khẩu"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Security hint */}
        <div className="flex items-start gap-3 rounded-lg bg-primary-50 px-4 py-3 text-sm text-primary-700 border border-primary-100">
          <ShieldCheckIcon className="h-5 w-5 shrink-0 mt-0.5 text-primary-500" />
          <p>
            Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa và chữ số.
          </p>
        </div>

        <PasswordInput
          label="Mật khẩu hiện tại"
          placeholder="Nhập mật khẩu hiện tại"
          required
          autoComplete="current-password"
          errorMessage={errors.currentPassword?.message}
          {...register("currentPassword")}
        />

        <PasswordInput
          label="Mật khẩu mới"
          placeholder="Ít nhất 8 ký tự"
          required
          autoComplete="new-password"
          errorMessage={errors.newPassword?.message}
          {...register("newPassword")}
        />

        <PasswordInput
          label="Xác nhận mật khẩu mới"
          placeholder="Nhập lại mật khẩu mới"
          required
          autoComplete="new-password"
          errorMessage={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
      </div>
    </Modal>
  );
}
