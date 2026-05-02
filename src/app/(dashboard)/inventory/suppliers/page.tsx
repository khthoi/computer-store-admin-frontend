export const dynamic = "force-dynamic";

import { SuppliersTable } from "@/src/components/admin/inventory/SuppliersTable";

export default function SuppliersPage() {
  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Nhà cung cấp</h1>
        <p className="mt-1 text-sm text-secondary-500">
          Quản lý nhà cung cấp sản phẩm và thông tin liên hệ.
        </p>
      </div>
      <SuppliersTable />
    </div>
  );
}
