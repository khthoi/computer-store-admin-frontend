export const dynamic = "force-dynamic";

import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { getSuppliers, getInventoryItems } from "@/src/services/inventory.service";
import { StockInFormClient } from "@/src/components/admin/inventory/StockInFormClient";
import { Button } from "@/src/components/ui/Button";

interface Props {
  searchParams: Promise<{
    variantId?: string;
    qty?: string;
    supplierId?: string;
    note?: string;
    lineNote?: string;
    expectedDate?: string;
  }>;
}

export default async function NewStockInPage({ searchParams }: Props) {
  const [suppliersPage, inventoryItemsPage, params] = await Promise.all([
    getSuppliers({ limit: 200 }),
    getInventoryItems(),
    searchParams,
  ]);
  const suppliers = suppliersPage.data;
  const inventoryItems = inventoryItemsPage?.data ?? [];

  const prefill = {
    variantId: params.variantId,
    qty: params.qty ? parseInt(params.qty, 10) : undefined,
    supplierId: params.supplierId,
    note: params.note,
    lineNote: params.lineNote,
    expectedDate: params.expectedDate,
  };

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
        inventoryItems={inventoryItems}
        prefill={prefill}
      />
    </div>
  );
}
