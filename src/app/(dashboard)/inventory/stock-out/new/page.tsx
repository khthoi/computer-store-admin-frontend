export const dynamic = "force-dynamic";

import { getInventoryItems } from "@/src/services/inventory.service";
import { StockOutFormClient } from "@/src/components/admin/inventory/StockOutFormClient";
import { Button } from "@/src/components/ui/Button";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default async function NewStockOutPage() {
  const inventoryItems = await getInventoryItems();
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
         <Button
          href="/inventory/stock-in"
          variant="secondary"
          className="rounded rounded-lg"
          leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
        >
          Back
        </Button>
        <div>
        <h1 className="text-2xl font-bold text-secondary-900">Tạo phiếu xuất kho</h1>
        <p className="mt-1 text-sm text-secondary-500">
          Ghi nhận hàng hóa xuất kho do bán hàng, điều chuyển, hoặc các lý do khác.
        </p>
        </div>
      </div>
      <StockOutFormClient inventoryItems={inventoryItems} />
    </div>
  );
}
