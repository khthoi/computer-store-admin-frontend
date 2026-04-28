"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CreditCardIcon,
  GiftIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "@/src/components/ui/Badge";
import { Modal } from "@/src/components/ui/Modal";
import { Input } from "@/src/components/ui/Input";
import { DateInput } from "@/src/components/ui/DateInput";
import { Textarea } from "@/src/components/ui/Textarea";
import { Button } from "@/src/components/ui/Button";
import { formatVND } from "@/src/lib/format";
import type { OrderRefundRecord, OrderLineItem } from "@/src/types/order.types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface OrderRefundHistoryCardProps {
  refunds: OrderRefundRecord[];
  lineItems: OrderLineItem[];
  grandTotal: number;
  onSettle?: (refundId: string, payload: { externalRef: string; bank?: string; settledAt?: string; note?: string }) => void;
  onReject?: (refundId: string, payload: { reason: string }) => void;
  isSettling?: boolean;
  isRejecting?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

const STATUS_CONFIG = {
  completed: { label: "Đã hoàn",    variant: "success" as const, Icon: CheckCircleIcon, color: "text-success-600" },
  pending:   { label: "Đang chờ",   variant: "warning" as const, Icon: ClockIcon,        color: "text-warning-600" },
  rejected:  { label: "Bị từ chối", variant: "error"   as const, Icon: XCircleIcon,      color: "text-error-600"   },
};

const METHOD_CONFIG = {
  original:     { label: "Hoàn tiền gốc",      Icon: CreditCardIcon, color: "text-primary-600", bg: "bg-primary-50" },
  store_credit: { label: "Tín dụng cửa hàng",  Icon: GiftIcon,       color: "text-warning-600", bg: "bg-warning-50" },
};

// ─── Settle dialog ─────────────────────────────────────────────────────────────

interface SettleDialogProps {
  refundId: string;
  amount: number;
  onConfirm: (payload: { externalRef: string; bank?: string; settledAt?: string; note?: string }) => void;
  onClose: () => void;
  isSaving: boolean;
}

function SettleDialog({ refundId, amount, onConfirm, onClose, isSaving }: SettleDialogProps) {
  const [externalRef, setExternalRef] = useState("");
  const [bank, setBank]               = useState("");
  const [settledAt, setSettledAt]     = useState("");
  const [note, setNote]               = useState("");

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Xác nhận hoàn tiền thành công"
      size="2xl"
      closeOnBackdrop={!isSaving}
      closeOnEscape={!isSaving}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Hủy
          </Button>
          <Button
            variant="success"
            isLoading={isSaving}
            disabled={!externalRef.trim() || isSaving}
            onClick={() =>
              onConfirm({
                externalRef: externalRef.trim(),
                bank: bank.trim() || undefined,
                settledAt: settledAt ? new Date(settledAt).toISOString() : undefined,
                note: note.trim() || undefined,
              })
            }
          >
            Xác nhận đã hoàn
          </Button>
        </>
      }
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success-100" aria-hidden="true">
          <BanknotesIcon className="w-5 h-5 text-success-600" />
        </span>
        <p className="text-sm text-secondary-500">{formatVND(amount)} — Mã #{refundId}</p>
      </div>

      <div className="space-y-3">
        <Input
          label="Mã giao dịch gateway"
          required
          value={externalRef}
          onChange={(e) => setExternalRef(e.target.value)}
          placeholder="VNPay TransactionNo / MoMo transId…"
          disabled={isSaving}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Ngân hàng / Ví"
            value={bank}
            onChange={(e) => setBank(e.target.value)}
            placeholder="Techcombank, MoMo…"
            disabled={isSaving}
          />
          <DateInput
            label="Thời điểm thực tế"
            value={settledAt}
            onChange={setSettledAt}
            showTime
            disabled={isSaving}
          />
        </div>
        <Textarea
          label="Ghi chú (tùy chọn)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Xác nhận với gateway lúc 8:30 sáng…"
          disabled={isSaving}
          autoResize
          rows={2}
          showCharCount
          maxCharCount={500}
        />
      </div>
    </Modal>
  );
}

// ─── Reject dialog ─────────────────────────────────────────────────────────────

interface RejectDialogProps {
  refundId: string;
  amount: number;
  onConfirm: (payload: { reason: string }) => void;
  onClose: () => void;
  isSaving: boolean;
}

function RejectDialog({ refundId, amount, onConfirm, onClose, isSaving }: RejectDialogProps) {
  const [reason, setReason] = useState("");

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Đánh dấu hoàn tiền thất bại"
      size="2xl"
      closeOnBackdrop={!isSaving}
      closeOnEscape={!isSaving}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Hủy
          </Button>
          <Button
            variant="danger"
            isLoading={isSaving}
            disabled={!reason.trim() || isSaving}
            onClick={() => onConfirm({ reason: reason.trim() })}
          >
            Xác nhận thất bại
          </Button>
        </>
      }
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-error-100" aria-hidden="true">
          <XCircleIcon className="w-5 h-5 text-error-600" />
        </span>
        <p className="text-sm text-secondary-500">{formatVND(amount)} — Mã #{refundId}</p>
      </div>

      <Textarea
        label="Lý do từ chối"
        required
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Gateway từ chối, tài khoản không hợp lệ, hết hạn xử lý…"
        disabled={isSaving}
        autoResize
        rows={3}
        showCharCount
        maxCharCount={500}
      />
    </Modal>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function OrderRefundHistoryCard({
  refunds,
  lineItems,
  grandTotal,
  onSettle,
  onReject,
  isSettling = false,
  isRejecting = false,
}: OrderRefundHistoryCardProps) {
  const [settleTarget, setSettleTarget] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);

  if (refunds.length === 0) return null;

  const lineItemMap = new Map(lineItems.map((li) => [li.variantId, li]));
  const settledRefunds = refunds.filter((r) => r.status !== "rejected");
  const totalRefunded  = settledRefunds.reduce((s, r) => s + r.amount, 0);
  const refundPercent  = grandTotal > 0 ? Math.round((totalRefunded / grandTotal) * 100) : 0;

  const targetRefund = settleTarget
    ? refunds.find((r) => r.id === settleTarget)
    : rejectTarget
    ? refunds.find((r) => r.id === rejectTarget)
    : null;

  return (
    <>
      <div className="rounded-2xl border border-secondary-100 bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-secondary-100">
          <h3 className="text-sm font-semibold text-secondary-900">Lịch sử hoàn tiền</h3>
          {settledRefunds.length > 0 && (
            <div className="text-right">
              <p className="text-sm font-semibold text-error-600">{formatVND(totalRefunded)}</p>
              <p className="text-xs text-secondary-400">{refundPercent}% tổng đơn</p>
            </div>
          )}
        </div>

        {/* Refund list */}
        <div className="divide-y divide-secondary-50">
          {refunds.map((refund, idx) => {
            const statusCfg = STATUS_CONFIG[refund.status] ?? STATUS_CONFIG.pending;
            const methodCfg = METHOD_CONFIG[refund.method] ?? METHOD_CONFIG.original;

            return (
              <div key={refund.id} className="px-4 py-3 space-y-2.5">
                {/* Row 1: index, amount, status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary-100 text-xs font-semibold text-secondary-600">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-semibold text-secondary-900">{formatVND(refund.amount)}</span>
                  </div>
                  <Badge variant={statusCfg.variant} size="sm" dot>{statusCfg.label}</Badge>
                </div>

                {/* Row 2: method + date */}
                <div className="flex items-center justify-between text-xs text-secondary-500">
                  <span className={["inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium", methodCfg.bg, methodCfg.color].join(" ")}>
                    <methodCfg.Icon className="w-3.5 h-3.5" aria-hidden="true" />
                    {methodCfg.label}
                  </span>
                  <span>{formatDate(refund.createdAt)}</span>
                </div>

                {/* Row 3: items */}
                {refund.items.length > 0 && (
                  <div className="rounded-lg border border-secondary-100 bg-secondary-50/50 px-3 py-2 space-y-1">
                    {refund.items.map((ri, riIdx) => {
                      const li = lineItemMap.get(ri.variantId);
                      return (
                        <div key={riIdx} className="flex items-start justify-between gap-2 text-xs">
                          <span className="min-w-0 flex-1 text-secondary-700 line-clamp-1">
                            {li ? li.productName : `Variant #${ri.variantId}`}
                            {li?.variantName && <span className="ml-1 text-secondary-400">({li.variantName})</span>}
                          </span>
                          <span className="shrink-0 font-medium text-secondary-600">
                            x{ri.quantity}
                            {li && <span className="ml-1 text-secondary-400">= {formatVND(ri.quantity * li.unitPrice)}</span>}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Row 4: evidence (completed) / reason (rejected) / actions (pending) */}
                {refund.status === "completed" && (refund.externalRef || refund.bank || refund.settledAt) && (
                  <div className="rounded-lg bg-success-50 border border-success-100 px-3 py-2 space-y-1 text-xs">
                    {refund.externalRef && (
                      <div className="flex items-center gap-1.5 text-success-700">
                        <BanknotesIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span className="font-mono font-medium">{refund.externalRef}</span>
                      </div>
                    )}
                    {refund.bank && (
                      <div className="flex items-center gap-1.5 text-success-700">
                        <BuildingLibraryIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span>{refund.bank}</span>
                      </div>
                    )}
                    {refund.settledAt && (
                      <p className="text-success-600">{formatDate(refund.settledAt)}</p>
                    )}
                  </div>
                )}

                {refund.status === "rejected" && refund.errorNote && (
                  <div className="rounded-lg bg-error-50 border border-error-100 px-3 py-2 text-xs text-error-700">
                    {refund.errorNote}
                  </div>
                )}

                {refund.status === "pending" && onSettle && onReject && (
                  <div className="flex gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setSettleTarget(refund.id)}
                      className="flex-1 rounded-lg bg-success-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-success-700 transition-colors"
                    >
                      Xác nhận đã hoàn
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejectTarget(refund.id)}
                      className="flex-1 rounded-lg border border-error-300 px-3 py-1.5 text-xs font-semibold text-error-600 hover:bg-error-50 transition-colors"
                    >
                      Đánh dấu thất bại
                    </button>
                  </div>
                )}

                {/* Processor */}
                <div className="flex items-center gap-1 text-xs text-secondary-400">
                  <UserIcon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>
                    Xử lý bởi{" "}
                    {refund.processedById ? (
                      <Link
                        href={`/employees/${refund.processedById}`}
                        className="font-medium text-secondary-600 hover:text-primary-600 hover:underline"
                      >
                        {refund.processedBy}
                      </Link>
                    ) : (
                      <span className="font-medium text-secondary-600">{refund.processedBy}</span>
                    )}
                  </span>
                  {refund.returnRequestId && (
                    <span className="ml-1 rounded-full bg-secondary-100 px-1.5 py-0.5 text-secondary-500">
                      YC #{refund.returnRequestId}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer summary */}
        {refunds.length > 1 && settledRefunds.length > 0 && (
          <div className="flex items-center justify-between border-t border-secondary-100 bg-secondary-50/50 px-4 py-2.5">
            <span className="text-xs text-secondary-500">{settledRefunds.length} lần hoàn</span>
            <span className="text-xs font-semibold text-error-600">Tổng: {formatVND(totalRefunded)}</span>
          </div>
        )}
      </div>

      {/* Settle dialog */}
      {settleTarget && targetRefund && (
        <SettleDialog
          refundId={settleTarget}
          amount={targetRefund.amount}
          isSaving={isSettling}
          onClose={() => setSettleTarget(null)}
          onConfirm={(payload) => {
            onSettle?.(settleTarget, payload);
            setSettleTarget(null);
          }}
        />
      )}

      {/* Reject dialog */}
      {rejectTarget && targetRefund && (
        <RejectDialog
          refundId={rejectTarget}
          amount={targetRefund.amount}
          isSaving={isRejecting}
          onClose={() => setRejectTarget(null)}
          onConfirm={(payload) => {
            onReject?.(rejectTarget, payload);
            setRejectTarget(null);
          }}
        />
      )}
    </>
  );
}
