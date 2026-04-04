export const dynamic = "force-dynamic";

import Link from "next/link";
import { PlusIcon } from "@heroicons/react/24/outline";
import { getStockOutList } from "@/src/services/inventory.service";
import { StockOutTable } from "@/src/components/admin/inventory/StockOutTable";

export default async function StockOutPage() {
  const records = await getStockOutList();
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Stock Out</h1>
          <p className="mt-1 text-sm text-secondary-500">
            Write-offs, showroom units, and outgoing stock.
          </p>
        </div>
        <Link
          href="/inventory/stock-out/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          New Stock-Out
        </Link>
      </div>
      <StockOutTable initialRecords={records} />
    </div>
  );
}
