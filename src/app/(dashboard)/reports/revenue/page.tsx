import type { Metadata } from "next";
import { getRevenueReport } from "@/src/services/report.service";
import { RevenueReportClient } from "@/src/components/admin/reports/revenue/RevenueReportClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Báo cáo Doanh thu — Admin",
};

export default async function RevenueReportPage() {
  const data = await getRevenueReport("30d");
  return <RevenueReportClient initialData={data} />;
}
