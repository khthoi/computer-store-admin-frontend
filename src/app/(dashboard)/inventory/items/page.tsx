export const dynamic = "force-dynamic";

import { getInventoryItems } from "@/src/services/inventory.service";
import { InventoryTable } from "@/src/components/admin/inventory/InventoryTable";

export default async function InventoryItemsPage() {
  const items = await getInventoryItems();
  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Tất cả sản phẩm tồn kho hiện tại</h1>
        <p className="mt-1 text-sm text-secondary-500">
          Tất cả các mã SKU tồn kho với mức tồn kho hiện tại.
        </p>
      </div>
      <InventoryTable initialItems={items} />
    </div>
  );
}
