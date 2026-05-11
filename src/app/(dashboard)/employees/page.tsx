import type { Metadata } from "next";
import { getEmployees } from "@/src/services/employee.service";
import { EmployeesTable } from "@/src/components/admin/employees/EmployeesTable";
import type { NhanVien } from "@/src/types/employee.types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nhân viên — Admin",
  description: "Quản lý thông tin và vai trò nhân viên trong hệ thống.",
};

export default async function EmployeesPage() {
  let employees: NhanVien[] = [];
  let total = 0;
  try {
    ({ data: employees, total } = await getEmployees({ limit: 10 }));
  } catch {
    // Backend unavailable — render empty shell; client-side refetch will recover
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Nhân viên</h1>
        <p className="mt-1 text-sm text-secondary-500">
          Quản lý thông tin, vai trò và trạng thái tài khoản nhân viên.
        </p>
      </div>
      <EmployeesTable initialEmployees={employees} initialTotal={total} />
    </div>
  );
}
