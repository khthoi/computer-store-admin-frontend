import type { Metadata } from "next";
import { getProductPerformanceReport } from "@/src/services/report.service";
import { ProductReportClient } from "@/src/components/admin/reports/products/ProductReportClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Báo cáo Sản phẩm — Admin",
};

export default async function ProductReportPage() {
  const data = await getProductPerformanceReport("30d");
  return <ProductReportClient initialData={data} />;
}
