import type { Metadata } from "next";
import { getExecutiveSummary } from "@/src/services/report.service";
import { ReportsSummaryClient } from "@/src/components/admin/reports/ReportsSummaryClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Báo cáo Tổng quan — Admin",
};

export default async function ReportsPage() {
  const summary = await getExecutiveSummary("30d");

  return <ReportsSummaryClient initialData={summary} />;
}
