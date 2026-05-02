export const dynamic = "force-dynamic";

import { getInventorySummary } from "@/src/services/inventory.service";
import { InventoryTable } from "@/src/components/admin/inventory/InventoryTable";
import { InventoryStatsBar } from "@/src/components/admin/inventory/InventoryStatsBar";

export default async function InventoryItemsPage() {
  const stats = await getInventorySummary();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Tất cả sản phẩm tồn kho hiện tại</h1>
        <p className="mt-1 text-sm text-secondary-500">
          Tất cả các mã SKU tồn kho với mức tồn kho hiện tại.
        </p>
      </div>
      <InventoryStatsBar stats={stats} />
      <InventoryTable />
    </div>
  );
}
