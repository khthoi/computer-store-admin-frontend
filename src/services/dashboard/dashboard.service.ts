import { apiFetch } from "@/src/services/api";

export interface DashboardKpi {
  value: number;
  changePercent: number;
  sparkline: number[];
}

export interface DashboardOverview {
  kpis: {
    revenue: DashboardKpi;
    orders: DashboardKpi;
    newCustomers: DashboardKpi;
    lowStockCount: DashboardKpi;
  };
  revenueChart: { date: string; revenue: number }[];
  topProducts: { productId: string; name: string; unitsSold: number; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
  recentOrders: { id: string; customerName: string; total: number; status: string; date: string }[];
  lowStock: { productId: string; name: string; sku: string; currentStock: number; threshold: number }[];
}

export const DashboardService = {
  async getOverview(): Promise<DashboardOverview> {
    return apiFetch<DashboardOverview>("/admin/dashboard/overview");
  },
};
