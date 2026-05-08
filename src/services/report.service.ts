import type {
  ReportPeriod,
  ExecutiveSummaryReport,
  RevenueReport,
  ProductPerformanceReport,
  CustomerReport,
  InventoryReport,
  PromotionReport,
  SupportReport,
} from "@/src/types/report.types";
import { apiFetch } from "@/src/services/api";

export async function getExecutiveSummary(period: ReportPeriod): Promise<ExecutiveSummaryReport> {
  return apiFetch<ExecutiveSummaryReport>(`/admin/reports/agg/executive?period=${period}`);
}

export async function getRevenueReport(period: ReportPeriod): Promise<RevenueReport> {
  return apiFetch<RevenueReport>(`/admin/reports/agg/revenue?period=${period}`);
}

export async function getProductPerformanceReport(period: ReportPeriod): Promise<ProductPerformanceReport> {
  return apiFetch<ProductPerformanceReport>(`/admin/reports/agg/products?period=${period}`);
}

export async function getCustomerReport(period: ReportPeriod): Promise<CustomerReport> {
  return apiFetch<CustomerReport>(`/admin/reports/agg/customers?period=${period}`);
}

export async function getInventoryReport(): Promise<InventoryReport> {
  return apiFetch<InventoryReport>(`/admin/reports/agg/inventory`);
}

export async function getPromotionReport(period: ReportPeriod): Promise<PromotionReport> {
  return apiFetch<PromotionReport>(`/admin/reports/agg/promotions?period=${period}`);
}

export async function getSupportReport(period: ReportPeriod): Promise<SupportReport> {
  return apiFetch<SupportReport>(`/admin/reports/agg/support?period=${period}`);
}
