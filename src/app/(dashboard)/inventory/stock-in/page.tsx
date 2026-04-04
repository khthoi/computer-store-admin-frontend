export const dynamic = "force-dynamic";

import Link from "next/link";
import { PlusIcon } from "@heroicons/react/24/outline";
import { getStockInList } from "@/src/services/inventory.service";
import { StockInTable } from "@/src/components/admin/inventory/StockInTable";

export default async function StockInPage() {
  const records = await getStockInList();
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Stock In</h1>
          <p className="mt-1 text-sm text-secondary-500">
            Manage incoming stock from suppliers.
          </p>
        </div>
        <Link
          href="/inventory/stock-in/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
        >
          <PlusIcon className="w-4 h-4" />
          New Stock-In
        </Link>
      </div>
      <StockInTable initialRecords={records} />
    </div>
  );
}
