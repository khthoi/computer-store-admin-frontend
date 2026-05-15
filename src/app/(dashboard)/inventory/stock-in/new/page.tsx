export const dynamic = "force-dynamic";

import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { getSuppliers, getInventoryItems } from "@/src/services/inventory.service";
import { StockInFormClient } from "@/src/components/admin/inventory/stock-in/StockInFormClient";
import { Button } from "@/src/components/ui/Button";
import type { InventoryItem } from "@/src/types/inventory.types";

interface Props {
  searchParams: Promise<{
    variantId?: string;
    sku?: string;
    qty?: string;
    supplierId?: string;
    note?: string;
    lineNote?: string;
    expectedDate?: string;
  }>;
}

export default async function NewStockInPage({ searchParams }: Props) {
  const params = await searchParams;
  // Suppliers list is bounded (typically dozens) — load up to 500 inline.
  // Inventory items can be 10k+ → load only what we need:
  //   - the pre-fill item (if any) so the form can render the selected row,
  //   - the dropdown's initial page comes from async search in the client.
  const [suppliersPage, prefillItem] = await Promise.all([
    getSuppliers({ limit: 500 }),
    // Prefill item resolved via SKU (passed alongside variantId in the URL).
    // Backend `q` matches name/SKU, so SKU gives the most precise lookup.
    params.variantId && params.sku
      ? getInventoryItems({ q: params.sku, limit: 25 }).then(
          (res) => res?.data?.find((i) => i.variantId === params.variantId) ?? null,
        )
      : Promise.resolve(null as InventoryItem | null),
  ]);
  const suppliers = suppliersPage.data;

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
        prefillItem={prefillItem}
        prefill={prefill}
      />
    </div>
  );
}
