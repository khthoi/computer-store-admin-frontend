"use client";

import Link from "next/link";
import {
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { Drawer } from "@/src/components/ui/Drawer";
import { Alert } from "@/src/components/ui/Alert";
import { TransactionStatusBadge } from "@/src/components/admin/orders/TransactionStatusBadge";
import type { TransactionRow, TransactionPaymentMethod } from "@/src/types/transaction.types";

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
    second: "2-digit",
  });
}

const PAYMENT_METHOD_LABELS: Record<TransactionPaymentMethod, string> = {
  COD:         "Thanh toán khi nhận hàng (COD)",
  ChuyenKhoan: "Chuyển khoản ngân hàng",
  VNPAY:       "VNPAY",
  Momo:        "Ví MoMo",
  ZaloPay:     "ZaloPay",
  TraGop:      "Trả góp",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5">
      <span className="text-[11px] font-medium uppercase tracking-wide text-secondary-400">
        {label}
      </span>
      <span
        className={[
          "text-sm text-secondary-800",
          mono ? "font-mono text-xs" : "",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-secondary-100" aria-hidden="true" />;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface TransactionDetailDrawerProps {
  transaction: TransactionRow | null;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * TransactionDetailDrawer — slide-in panel hiển thị chi tiết một giao dịch.
 *
 * Mở khi click "Xem lỗi" trên row ThatBai trong TransactionsTable,
 * hoặc có thể mở từ bất kỳ row nào.
 *
 * Footer: Link → /orders/[donHangId]
 */
export function TransactionDetailDrawer({
  transaction,
  onClose,
}: TransactionDetailDrawerProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const isFailed  = transaction?.trangThaiGiaoDich === "ThatBai";
  const isRefunded = transaction?.trangThaiGiaoDich === "DaHoan";

  return (
    <Drawer
      isOpen={transaction !== null}
      onClose={onClose}
      position="right"
      size="lg"
      title={transaction ? `Giao dịch #${transaction.giaoDichId}` : ""}
      footer={
        transaction ? (
          <Link
            href={`/orders/${transaction.donHangId}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
            onClick={onClose}
          >
            <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden="true" />
            Xem đơn hàng {transaction.maDonHang}
          </Link>
        ) : null
      }
    >
      {transaction && (
        <div className="space-y-1">
          {/* Status + amount — prominent header */}
          <div className="mb-4 rounded-xl border border-secondary-100 bg-secondary-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-secondary-500 mb-1">Số tiền</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {formatVND(transaction.soTien)}
                </p>
              </div>
              <TransactionStatusBadge status={transaction.trangThaiGiaoDich} size="lg" />
            </div>
          </div>

          {/* Cảnh báo lỗi */}
          {isFailed && transaction.ghiChuLoi && (
            <div className="mb-3">
              <Alert variant="error" title="Chi tiết lỗi từ cổng thanh toán">
                <p className="font-mono text-xs leading-relaxed">{transaction.ghiChuLoi}</p>
              </Alert>
            </div>
          )}

          {/* Hoàn tiền notice */}
          {isRefunded && (
            <div className="mb-3">
              <Alert variant="info" title="Giao dịch đã hoàn tiền">
                Khoản thanh toán này đã được hoàn trả về phương thức gốc.
              </Alert>
            </div>
          )}

          {/* Thông tin chi tiết */}
          <div className="divide-y divide-secondary-100 rounded-xl border border-secondary-100 bg-white px-4">
            <DetailRow
              label="Đơn hàng"
              value={
                <span className="font-semibold text-primary-600">
                  {transaction.maDonHang}
                </span>
              }
            />

            <DetailRow
              label="Khách hàng"
              value={transaction.tenKhachHang}
            />

            <Divider />

            <DetailRow
              label="Phương thức thanh toán"
              value={PAYMENT_METHOD_LABELS[transaction.phuongThucThanhToan]}
            />

            {transaction.nganHangVi && (
              <DetailRow
                label="Ngân hàng / Ví"
                value={transaction.nganHangVi}
              />
            )}

            {transaction.maGiaoDichNgoai && (
              <DetailRow
                label="Mã giao dịch ngoài"
                value={
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-secondary-700 break-all">
                      {transaction.maGiaoDichNgoai}
                    </span>
                    <button
                      type="button"
                      aria-label="Sao chép mã giao dịch"
                      onClick={() => handleCopy(transaction.maGiaoDichNgoai!)}
                      className="shrink-0 rounded p-1 text-secondary-400 transition-colors hover:bg-secondary-100 hover:text-secondary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    >
                      {copied ? (
                        <CheckIcon className="h-3.5 w-3.5 text-success-600" aria-hidden="true" />
                      ) : (
                        <ClipboardDocumentIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                }
                mono
              />
            )}

            <Divider />

            <DetailRow
              label="Ngày tạo giao dịch"
              value={formatDatetime(transaction.ngayTao)}
            />

            {transaction.thoiDiemThanhToan ? (
              <DetailRow
                label="Thời điểm thanh toán thành công"
                value={formatDatetime(transaction.thoiDiemThanhToan)}
              />
            ) : (
              <DetailRow
                label="Thời điểm thanh toán"
                value={<span className="text-secondary-400">Chưa có</span>}
              />
            )}
          </div>

          {/* ID kỹ thuật — dành cho support/debug */}
          <div className="rounded-xl border border-secondary-100 bg-secondary-50/50 px-4 py-3 text-xs text-secondary-400">
            <span className="font-medium">giao_dich_id:</span>{" "}
            <span className="font-mono">{transaction.giaoDichId}</span>
            {" · "}
            <span className="font-medium">don_hang_id:</span>{" "}
            <span className="font-mono">{transaction.donHangId}</span>
          </div>
        </div>
      )}
    </Drawer>
  );
}
