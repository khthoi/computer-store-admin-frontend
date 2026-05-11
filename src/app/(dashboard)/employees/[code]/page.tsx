import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEmployeeByCode } from "@/src/services/employee.service";
import { getRoles } from "@/src/services/role.service";
import { EmployeeDetailContent } from "@/src/components/admin/employees/EmployeeDetailContent";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const employee = await getEmployeeByCode(code);
  return {
    title: employee
      ? `${employee.fullName} — Nhân viên — Admin`
      : "Nhân viên không tồn tại — Admin",
  };
}

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const [employee, { data: allRoles }] = await Promise.all([
    getEmployeeByCode(code),
    getRoles(),
  ]);

  if (!employee) notFound();

  return (
    <EmployeeDetailContent
      employee={employee}
      allRoles={allRoles}
    />
  );
}
