export const dynamic = "force-dynamic";

import { getReturns } from "@/src/services/returns.service";
import { ReturnsTable } from "@/src/components/admin/inventory/ReturnsTable";

const PAGE_SIZE = 20;

export default async function OrderReturnsPage() {
  const result = await getReturns({ page: 1, limit: PAGE_SIZE });
  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Trả hàng & Hoàn tiền</h1>
        <p className="mt-1 text-sm text-secondary-500">
          Quản lý các yêu cầu trả hàng, hoàn tiền và tình trạng xử lý của chúng.
        </p>
      </div>
      <ReturnsTable initialData={result.items} initialTotal={result.total} />
    </div>
  );
}
