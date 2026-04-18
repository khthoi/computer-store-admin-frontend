export const dynamic = "force-dynamic";

import { getStockMovements } from "@/src/services/inventory.service";
import { MovementsTable } from "@/src/components/admin/inventory/MovementsTable";

export default async function MovementsPage() {
  const movements = await getStockMovements();
  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Lịch sử nhập/xuất kho</h1>
        <p className="mt-1 text-sm text-secondary-500">
          Xem lại các hoạt động nhập và xuất kho gần đây để theo dõi lượng tồn kho theo thời gian.
        </p>
      </div>
      <MovementsTable initialMovements={movements} />
    </div>
  );
}
