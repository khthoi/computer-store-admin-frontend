export const dynamic = "force-dynamic";

import Link from "next/link";
import { PlusIcon } from "@heroicons/react/24/outline";
import { getStockOutList } from "@/src/services/inventory.service";
import { StockOutTable } from "@/src/components/admin/inventory/StockOutTable";
import { Button } from "@/src/components/ui/Button";

export default async function StockOutPage() {
  const records = await getStockOutList();
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Xuất kho</h1>
          <p className="mt-1 text-sm text-secondary-500">
            Quản lý các phiếu xuất kho và lịch sử xuất kho
          </p>
        </div>
        <Button
          href="/inventory/stock-out/new"
          variant="primary"
          className="rounded-lg"
        >
          <PlusIcon className="w-4 h-4" />
          Phiếu xuất kho
        </Button>
      </div>
      <StockOutTable initialRecords={records} />
    </div>
  );
}
