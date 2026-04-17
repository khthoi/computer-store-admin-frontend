import type { Metadata } from "next";
import {
  getTransactions,
  getTransactionStats,
} from "@/src/services/transaction.service";
import { AdminPageWrapper } from "@/src/components/admin/layout/AdminPageWrapper";
import { TransactionStatCards } from "@/src/components/admin/orders/TransactionStatCards";
import { TransactionsTable } from "@/src/components/admin/orders/TransactionsTable";

// ─── Route config ─────────────────────────────────────────────────────────────
// CRITICAL: Admin pages must NEVER be ISR/cached — always fresh data.

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Giao dịch thanh toán — Admin",
  description: "Quản lý và đối soát toàn bộ giao dịch thanh toán.",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function TransactionsPage() {
  const [{ data, total }, stats] = await Promise.all([
    getTransactions({ pageSize: 50 }),
    getTransactionStats(),
  ]);

  return (
    <AdminPageWrapper
      title="Giao dịch thanh toán"
      description={`${total} giao dịch · Đối soát theo trạng thái và ngày`}
    >
      <div className="space-y-6">
        {/* KPI cards */}
        <TransactionStatCards stats={stats} />

        {/* DataTable */}
        <TransactionsTable initialData={data} initialTotal={total} />
      </div>
    </AdminPageWrapper>
  );
}
