"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CreditCardIcon,
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import { Alert } from "@/src/components/ui/Alert";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { TransactionStatusBadge } from "@/src/components/admin/orders/TransactionStatusBadge";
import { getTransactionByOrderCode } from "@/src/services/transaction.service";
import type { Transaction, TransactionPaymentMethod } from "@/src/types/transaction.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatVND(amount: number): string {
  return amount.toLocaleString("vi-VN") + " ₫";
}

function formatDatetime(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const PAYMENT_METHOD_LABELS: Record<TransactionPaymentMethod, string> = {
  COD:         "Thanh toán khi nhận hàng",
  ChuyenKhoan: "Chuyển khoản ngân hàng",
  TheNganHang: "Thẻ ngân hàng",
  ViDienTu:    "Ví điện tử",
  TraGop:      "Trả góp",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <span className="shrink-0 text-xs text-secondary-500">{label}</span>
      <span className="text-right text-xs font-medium text-secondary-800">{value}</span>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex justify-between py-1.5">
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-3 w-28 rounded" />
        </div>
      ))}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface PaymentInfoCardProps {
  /** maDonHang — dùng để query giao_dich qua GET /admin/orders/:orderCode/transaction */
  orderCode: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * PaymentInfoCard — hiển thị thông tin giao_dich của một đơn hàng.
 *
 * Đặt trong right sidebar của OrderDetailPageClient.
 * Fetch client-side để không block server render của order detail.
 *
 * ```tsx
 * <PaymentInfoCard donHangId={order.id} />
 * ```
 */
export function PaymentInfoCard({ orderCode }: PaymentInfoCardProps) {
  const [transaction, setTransaction] = useState<Transaction | null | undefined>(
    undefined // undefined = đang load, null = không tìm thấy
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getTransactionByOrderCode(orderCode).then((tx) => {
      if (!cancelled) setTransaction(tx);
    });
    return () => { cancelled = true; };
  }, [orderCode]);

  // ── Copy mã GD ngoài ──────────────────────────────────────────────────────

  function handleCopyMaGD(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="rounded-2xl border border-secondary-100 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-secondary-100 px-4 py-3">
        <CreditCardIcon className="h-4 w-4 text-secondary-400" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-secondary-900">Thông tin thanh toán</h3>
      </div>

      <div className="px-4 py-3">
        {/* Loading */}
        {transaction === undefined && <LoadingSkeleton />}

        {/* Không có giao dịch */}
        {transaction === null && (
          <p className="py-4 text-center text-xs text-secondary-400">
            Chưa có thông tin giao dịch.
          </p>
        )}

        {/* Có dữ liệu */}
        {transaction !== null && transaction !== undefined && (
          <div>
            {/* Cảnh báo lỗi */}
            {transaction.trangThaiGiaoDich === "ThatBai" && transaction.ghiChuLoi && (
              <div className="mb-3">
                <Alert variant="error" title="Giao dịch thất bại">
                  {transaction.ghiChuLoi}
                </Alert>
              </div>
            )}

            {/* Trạng thái — nổi bật */}
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs text-secondary-500">Trạng thái</span>
              <TransactionStatusBadge
                status={transaction.trangThaiGiaoDich}
                size="md"
              />
            </div>

            {/* Divider */}
            <div className="border-t border-secondary-50" />

            {/* Các trường thông tin */}
            <div className="divide-y divide-secondary-50">
              <InfoRow
                label="Phương thức"
                value={PAYMENT_METHOD_LABELS[transaction.phuongThucThanhToan]}
              />

              <InfoRow
                label="Số tiền"
                value={
                  <span className="font-semibold text-secondary-900">
                    {formatVND(transaction.soTien)}
                  </span>
                }
              />

              {transaction.nganHangVi && (
                <InfoRow label="Ngân hàng / Ví" value={transaction.nganHangVi} />
              )}

              {transaction.maGiaoDichNgoai && (
                <InfoRow
                  label="Mã giao dịch"
                  value={
                    <div className="flex items-center gap-1">
                      <Tooltip content={transaction.maGiaoDichNgoai}>
                        <span className="max-w-[120px] truncate font-mono text-[11px] text-secondary-700">
                          {transaction.maGiaoDichNgoai}
                        </span>
                      </Tooltip>
                      <Tooltip content={copied ? "Đã sao chép!" : "Sao chép"}>
                        <button
                          type="button"
                          aria-label="Sao chép mã giao dịch"
                          onClick={() => handleCopyMaGD(transaction.maGiaoDichNgoai!)}
                          className="flex items-center text-secondary-400 transition-colors hover:text-secondary-600 focus-visible:outline-none"
                        >
                          <ClipboardDocumentIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </Tooltip>
                    </div>
                  }
                />
              )}

              {transaction.thoiDiemThanhToan && (
                <InfoRow
                  label="Thời điểm TT"
                  value={formatDatetime(transaction.thoiDiemThanhToan)}
                />
              )}

              <InfoRow
                label="Ngày tạo GD"
                value={formatDatetime(transaction.ngayTao)}
              />
            </div>

            {/* Link → trang danh sách giao dịch */}
            <div className="mt-3 border-t border-secondary-100 pt-3">
              <Link
                href="/orders/transactions"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 transition-colors hover:text-primary-700"
              >
                <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" aria-hidden="true" />
                Xem tất cả giao dịch
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
