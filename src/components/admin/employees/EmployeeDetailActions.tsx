"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { PencilSquareIcon, KeyIcon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { EmployeeFormModal } from "@/src/components/admin/employees/EmployeeFormModal";
import { ResetPasswordModal } from "@/src/components/admin/shared/ResetPasswordModal";
import { useToast } from "@/src/components/ui/Toast";
import { resetEmployeePassword } from "@/src/services/employee.service";
import { useAuth } from "@/src/store/auth.store";
import type { NhanVien } from "@/src/types/employee.types";
import type { VaiTro } from "@/src/types/role.types";

export interface EmployeeDetailActionsProps {
  employee: NhanVien;
  allRoles: VaiTro[];
}

export function EmployeeDetailActions({ employee, allRoles }: EmployeeDetailActionsProps) {
  const { showToast } = useToast();
  const { state: authState } = useAuth();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const isSelf = authState.user?.id === employee.id;

  const handleSaved = useCallback(() => {
    setModalOpen(false);
    showToast("Đã cập nhật thông tin nhân viên.", "success");
    router.refresh();
  }, [showToast, router]);

  const handleResetPassword = useCallback(async (payload: { newPassword: string; confirmPassword: string }) => {
    await resetEmployeePassword(employee.id, payload);
    setResetOpen(false);
    showToast("Đã đặt lại mật khẩu.", "success");
  }, [employee.id, showToast]);

  return (
    <>
      <div className="flex items-center gap-2">
        {!isSelf && (
          <Button variant="ghost" onClick={() => setResetOpen(true)}>
            <KeyIcon className="h-4 w-4" />
            Đặt lại mật khẩu
          </Button>
        )}

        <Button variant="secondary" onClick={() => setModalOpen(true)}>
          <PencilSquareIcon className="h-4 w-4" />
          Chỉnh sửa
        </Button>
      </div>

      <EmployeeFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        employee={employee}
        allRoles={allRoles}
        onSaved={handleSaved}
      />

      <ResetPasswordModal
        isOpen={resetOpen}
        onClose={() => setResetOpen(false)}
        targetName={employee.fullName}
        onConfirm={handleResetPassword}
      />
    </>
  );
}
