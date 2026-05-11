"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { EmployeeFormModal } from "@/src/components/admin/employees/EmployeeFormModal";
import { useToast } from "@/src/components/ui/Toast";
import type { NhanVien } from "@/src/types/employee.types";
import type { VaiTro } from "@/src/types/role.types";

export interface EmployeeDetailActionsProps {
  employee: NhanVien;
  allRoles: VaiTro[];
}

export function EmployeeDetailActions({ employee, allRoles }: EmployeeDetailActionsProps) {
  const { showToast } = useToast();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  const handleSaved = useCallback(() => {
    setModalOpen(false);
    showToast("Đã cập nhật thông tin nhân viên.", "success");
    router.refresh();
  }, [showToast, router]);

  return (
    <>
      <Button variant="secondary" onClick={() => setModalOpen(true)}>
        <PencilSquareIcon className="h-4 w-4" />
        Chỉnh sửa
      </Button>

      <EmployeeFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        employee={employee}
        allRoles={allRoles}
        onSaved={handleSaved}
      />
    </>
  );
}
