export const dynamic = "force-dynamic";

import { getInventoryItems } from "@/src/services/inventory.service";
import { StockOutFormClient } from "@/src/components/admin/inventory/StockOutFormClient";

export default async function NewStockOutPage() {
  const inventoryItems = await getInventoryItems();
  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">New Stock-Out</h1>
        <p className="mt-1 text-sm text-secondary-500">
          Record outgoing stock for internal use, damage, loss, transfer, or other non-sale reasons.
        </p>
      </div>
      <StockOutFormClient inventoryItems={inventoryItems} />
    </div>
  );
}
