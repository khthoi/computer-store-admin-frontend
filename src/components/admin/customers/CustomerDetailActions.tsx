"use client";

import { useCallback, useState } from "react";
import { PencilSquareIcon, KeyIcon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { CustomerFormModal } from "@/src/components/admin/customers/CustomerFormModal";
import { ResetPasswordModal } from "@/src/components/admin/shared/ResetPasswordModal";
import { useToast } from "@/src/components/ui/Toast";
import { resetCustomerPassword } from "@/src/services/customer.service";
import type { KhachHang } from "@/src/types/customer.types";

export interface CustomerDetailActionsProps {
  customer: KhachHang;
}

export function CustomerDetailActions({ customer }: CustomerDetailActionsProps) {
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const handleSaved = useCallback(() => {
    showToast("Đã cập nhật thông tin khách hàng.", "success");
    setModalOpen(false);
  }, [showToast]);

  const handleResetPassword = useCallback(async (payload: { newPassword: string; confirmPassword: string }) => {
    await resetCustomerPassword(customer.id, payload);
    setResetOpen(false);
    showToast("Đã đặt lại mật khẩu.", "success");
  }, [customer.id, showToast]);

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => setResetOpen(true)}>
          <KeyIcon className="h-4 w-4" />
          Đặt lại mật khẩu
        </Button>

        <Button variant="secondary" onClick={() => setModalOpen(true)}>
          <PencilSquareIcon className="h-4 w-4" />
          Chỉnh sửa
        </Button>
      </div>

      <CustomerFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        customer={customer}
        onSaved={handleSaved}
      />

      <ResetPasswordModal
        isOpen={resetOpen}
        onClose={() => setResetOpen(false)}
        targetName={customer.fullName}
        onConfirm={handleResetPassword}
      />
    </>
  );
}
