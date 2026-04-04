export const dynamic = "force-dynamic";

import { getInventoryStats } from "@/src/services/inventory.service";
import { InventoryDashboardClient } from "@/src/components/admin/inventory/InventoryDashboardClient";

export default async function InventoryPage() {
  const stats = await getInventoryStats();
  return <InventoryDashboardClient stats={stats} />;
}
