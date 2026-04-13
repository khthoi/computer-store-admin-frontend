import type { Metadata } from "next";
import { getCustomerReport } from "@/src/services/report.service";
import { CustomerReportClient } from "@/src/components/admin/reports/customers/CustomerReportClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Báo cáo Khách hàng — Admin",
};

export default async function CustomerReportPage() {
  const data = await getCustomerReport("30d");
  return <CustomerReportClient initialData={data} />;
}
