export const dynamic = "force-dynamic";

import { getReturnRequests } from "@/src/services/inventory.service";
import { ReturnsTable } from "@/src/components/admin/inventory/ReturnsTable";

export default async function OrderReturnsPage() {
  const returns = await getReturnRequests();
  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Returns</h1>
        <p className="mt-1 text-sm text-secondary-500">
          Customer return requests and their resolution status.
        </p>
      </div>
      <ReturnsTable initialReturns={returns} />
    </div>
  );
}
