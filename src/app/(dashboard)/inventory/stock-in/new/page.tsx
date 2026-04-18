export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { getSuppliers, getWarehouses, getInventoryItems, generateReceiptCode } from "@/src/services/inventory.service";
import { StockInFormClient } from "@/src/components/admin/inventory/StockInFormClient";
import { Button } from "@/src/components/ui/Button";

export default async function NewStockInPage() {
  const [suppliers, warehouses, inventoryItems] = await Promise.all([
    getSuppliers(),
    getWarehouses(),
    getInventoryItems(),
  ]);
  const receiptCode = generateReceiptCode();

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
          <h1 className="text-2xl font-bold text-secondary-900">Phiếu nhập hàng mới</h1>
          <p className="mt-0.5 text-sm text-secondary-500">
            Ghi nhận hàng hóa nhập từ nhà cung cấp.
          </p>
        </div>
      </div>
      <StockInFormClient
        suppliers={suppliers}
        warehouses={warehouses}
        inventoryItems={inventoryItems}
        receiptCode={receiptCode}
      />
    </div>
  );
}
