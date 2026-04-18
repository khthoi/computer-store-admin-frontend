export const dynamic = "force-dynamic";

import { getInventoryItems } from "@/src/services/inventory.service";
import { LowStockClient } from "@/src/components/admin/inventory/LowStockClient";

export default async function LowStockPage() {
  const allItems = await getInventoryItems();
  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Cảnh báo tồn kho thấp</h1>
        <p className="mt-1 text-sm text-secondary-500">
          Danh sách các sản phẩm có tồn kho dưới mức an toàn, cần được bổ sung kịp thời.
        </p>
      </div>
      <LowStockClient allItems={allItems} />
    </div>
  );
}
