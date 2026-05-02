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

const PAGE_SIZE = 20;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function TransactionsPage() {
  const [{ data, total }, stats] = await Promise.all([
    getTransactions({ page: 1, pageSize: PAGE_SIZE }),
    getTransactionStats(),
  ]);

  return (
    <AdminPageWrapper
      title="Giao dịch thanh toán"
      description={`${total} giao dịch · Đối soát theo trạng thái và ngày`}
    >
      <div className="space-y-6">
        <TransactionStatCards stats={stats} />
        <TransactionsTable initialData={data} initialTotal={total} />
      </div>
    </AdminPageWrapper>
  );
}
