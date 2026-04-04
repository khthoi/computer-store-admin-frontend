export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { getSuppliers, getWarehouses, getInventoryItems, generateReceiptCode } from "@/src/services/inventory.service";
import { StockInFormClient } from "@/src/components/admin/inventory/StockInFormClient";

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
        <Link
          href="/inventory/stock-in"
          className="inline-flex items-center gap-2 rounded-lg border border-secondary-200 bg-white px-3 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">New Stock-In</h1>
          <p className="mt-0.5 text-sm text-secondary-500">
            Record incoming inventory from a supplier.
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
