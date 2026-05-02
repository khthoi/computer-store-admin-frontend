export const dynamic = "force-dynamic";

import { getLowStockItems } from "@/src/services/inventory.service";
import { LowStockClient } from "@/src/components/admin/inventory/LowStockClient";
import type { InventoryItem } from "@/src/types/inventory.types";

export default async function LowStockPage() {
  let items: InventoryItem[] = [];
  let total = 0;
  try {
    ({ data: items, total } = await getLowStockItems({ page: 1, limit: 20 }));
  } catch {
    // Backend unavailable — render empty shell; client-side refetch will recover
  }

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Cảnh báo tồn kho thấp</h1>
        <p className="mt-1 text-sm text-secondary-500">
          {total > 0
            ? `${total} sản phẩm cần được bổ sung tồn kho`
            : "Danh sách các sản phẩm có tồn kho dưới mức an toàn."}
        </p>
      </div>
      <LowStockClient initialItems={items} initialTotal={total} />
    </div>
  );
}
