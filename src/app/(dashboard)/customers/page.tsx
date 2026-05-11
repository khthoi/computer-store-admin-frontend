import type { Metadata } from "next";
import { getCustomers } from "@/src/services/customer.service";
import { CustomersTable } from "@/src/components/admin/customers/CustomersTable";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Khách hàng — Admin",
  description: "Quản lý hồ sơ và địa chỉ giao hàng của khách hàng.",
};

export default async function CustomersPage() {
  let customers: import("@/src/types/customer.types").KhachHang[] = [];
  let total = 0;
  try {
    ({ data: customers, total } = await getCustomers({ limit: 10 }));
  } catch {
    // Backend unavailable — render empty shell; client-side refetch will recover
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Khách hàng</h1>
          <p className="mt-1 text-sm text-secondary-500">
            {total} khách hàng tổng cộng
          </p>
        </div>
      </div>
      <CustomersTable initialCustomers={customers} initialTotal={total} />
    </div>
  );
}
