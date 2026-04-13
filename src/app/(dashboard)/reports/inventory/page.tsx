import type { Metadata } from "next";
import { getInventoryReport } from "@/src/services/report.service";
import { InventoryReportClient } from "@/src/components/admin/reports/inventory/InventoryReportClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Báo cáo Kho hàng — Admin",
};

export default async function InventoryReportPage() {
  const data = await getInventoryReport();
  return <InventoryReportClient data={data} />;
}
