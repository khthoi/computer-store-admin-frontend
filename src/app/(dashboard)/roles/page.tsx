import type { Metadata } from "next";
import { getRoles } from "@/src/services/role.service";
import { RolesTable } from "@/src/components/admin/roles/RolesTable";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vai trò & Quyền hạn — Admin",
  description: "Quản lý vai trò và phân quyền nhân viên trong hệ thống.",
};

export default async function RolesPage() {
  const { data: roles, total, totalPages } = await getRoles({ page: 1, limit: 10, sortBy: "id", sortOrder: "asc" });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Vai trò & Quyền hạn</h1>
        <p className="mt-1 text-sm text-secondary-500">
          Quản lý các vai trò, phân quyền và phân công nhân viên.
        </p>
      </div>
      <RolesTable initialRoles={roles} initialTotal={total} initialTotalPages={totalPages} />
    </div>
  );
}
