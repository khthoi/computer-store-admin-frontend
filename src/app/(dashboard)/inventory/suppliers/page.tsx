export const dynamic = "force-dynamic";

import { getSuppliers } from "@/src/services/inventory.service";
import { SuppliersTable } from "@/src/components/admin/inventory/SuppliersTable";

export default async function SuppliersPage() {
  const suppliers = await getSuppliers();
  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Suppliers</h1>
        <p className="mt-1 text-sm text-secondary-500">
          Manage your product suppliers and contact information.
        </p>
      </div>
      <SuppliersTable initialSuppliers={suppliers} />
    </div>
  );
}
