import { apiFetch } from "@/src/services/api";

/**
 * Pending-work counters for the dashboard reminder grid.
 * Each field is only present when the calling user has the corresponding
 * permission — frontend should treat absence as "do not render this card".
 */
export interface DashboardActionItems {
  pendingOrders?: number;
  processingOrders?: number;
  pendingReturns?: number;
  openSupportTickets?: number;
  openContactMessages?: number;
  pendingReviews?: number;
  lowStockCount?: number;
}

export const DashboardActionItemsService = {
  async get(): Promise<DashboardActionItems> {
    return apiFetch<DashboardActionItems>("/admin/dashboard/action-items");
  },
};
