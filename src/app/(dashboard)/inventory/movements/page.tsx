export const dynamic = "force-dynamic";

import { getStockMovements } from "@/src/services/inventory.service";
import { MovementsTable } from "@/src/components/admin/inventory/MovementsTable";

export default async function MovementsPage() {
  const movements = await getStockMovements();
  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Stock Movements</h1>
        <p className="mt-1 text-sm text-secondary-500">
          Full audit log of all stock changes.
        </p>
      </div>
      <MovementsTable initialMovements={movements} />
    </div>
  );
}
