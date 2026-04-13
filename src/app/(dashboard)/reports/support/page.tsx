import type { Metadata } from "next";
import { getSupportReport } from "@/src/services/report.service";
import { SupportReportClient } from "@/src/components/admin/reports/support/SupportReportClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Báo cáo Hỗ trợ & Đánh giá — Admin",
};

export default async function SupportReportPage() {
  const data = await getSupportReport("30d");
  return <SupportReportClient initialData={data} />;
}
