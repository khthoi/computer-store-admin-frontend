import type { Metadata } from "next";
import { getPromotionReport } from "@/src/services/report.service";
import { PromotionReportClient } from "@/src/components/admin/reports/promotions/PromotionReportClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Báo cáo Khuyến mãi — Admin",
};

export default async function PromotionReportPage() {
  const data = await getPromotionReport("30d");
  return <PromotionReportClient initialData={data} />;
}
