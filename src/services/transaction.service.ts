import type {
  Transaction,
  GetTransactionsParams,
  GetTransactionsResult,
  TransactionStats,
} from "@/src/types/transaction.types";
import { apiFetch } from "@/src/services/api";

export async function getTransactions(
  params: GetTransactionsParams = {}
): Promise<GetTransactionsResult> {
  const { page = 1, pageSize, trangThai, phuongThuc, tuNgay, denNgay, q, sortBy, sortDir } = params;

  const qs = new URLSearchParams();
  qs.set("page", String(page));
  if (pageSize) qs.set("limit", String(pageSize));
  if (q)        qs.set("q", q);
  if (tuNgay)   qs.set("tuNgay", tuNgay);
  if (denNgay)  qs.set("denNgay", denNgay);
  if (sortBy)   qs.set("sortBy", sortBy);
  if (sortDir)  qs.set("sortOrder", sortDir.toUpperCase());
  trangThai?.forEach((s) => qs.append("trangThai", s));
  phuongThuc?.forEach((m) => qs.append("phuongThuc", m));

  return apiFetch<GetTransactionsResult>(`/admin/transactions?${qs.toString()}`);
}

export async function getTransactionStats(): Promise<TransactionStats> {
  return apiFetch<TransactionStats>("/admin/transactions/stats");
}

export async function getTransactionByOrderCode(
  orderCode: string
): Promise<Transaction | null> {
  try {
    return await apiFetch<Transaction>(`/admin/orders/${orderCode}/transaction`);
  } catch (err: unknown) {
    const msg = (err as Error)?.message ?? "";
    if (msg === "Không tìm thấy giao dịch" || msg.startsWith("HTTP 404")) return null;
    throw err;
  }
}
