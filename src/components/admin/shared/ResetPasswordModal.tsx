"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/src/components/ui/Modal";
import { PasswordInput } from "@/src/components/ui/PasswordInput";
import { Button } from "@/src/components/ui/Button";
import {
  ResetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/src/lib/validators/reset-password.schema";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetName: string;
  onConfirm: (payload: { newPassword: string; confirmPassword: string }) => Promise<void>;
}

export function ResetPasswordModal({
  isOpen,
  onClose,
  targetName,
  onConfirm,
}: ResetPasswordModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  function handleClose() {
    reset();
    onClose();
  }

  async function onSubmit(values: ResetPasswordFormValues) {
    setIsSubmitting(true);
    try {
      await onConfirm({ newPassword: values.newPassword, confirmPassword: values.confirmPassword });
      reset();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Đặt lại mật khẩu — ${targetName}`}
      size="sm"
      animated
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Huỷ
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang lưu..." : "Xác nhận"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <PasswordInput
          label="Mật khẩu mới"
          errorMessage={errors.newPassword?.message}
          {...register("newPassword")}
        />
        <PasswordInput
          label="Xác nhận mật khẩu"
          errorMessage={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
      </form>
    </Modal>
  );
}
