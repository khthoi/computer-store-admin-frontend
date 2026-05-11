"use client";

import { useState, useEffect } from "react";
import { CreditCardIcon, GiftIcon } from "@heroicons/react/24/outline";
import { Modal } from "@/src/components/ui/Modal";
import { Checkbox } from "@/src/components/ui/Checkbox";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { Tooltip } from "@/src/components/ui/Tooltip";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LineItem {
  productId: string;
  variantId: string;
  name: string;
  variantName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
}

type RefundMethod = "original" | "store_credit";

interface OrderRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: {
    items: { productId: string; variantId: string; quantity: number }[];
    method: RefundMethod;
    totalAmount: number;
  }) => void;
  lineItems: LineItem[];
  /** Quantities already refunded per variantId (across all settled refunds) */
  refundedQtyByVariantId?: Record<string, number>;
  isConfirming?: boolean;
  /** When set, modal is pre-scoped to this return request */
  returnRequestId?: number;
  /** Max refundable qty per variantId from the return request (stricter than order qty) */
  requestMaxQtyByVariantId?: Record<string, number>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatVND(n: number): string {
  return n.toLocaleString("vi-VN") + "₫";
}

const STEP_LABELS = ["Chọn sản phẩm", "Phương thức", "Xác nhận"];

// ─── Component ────────────────────────────────────────────────────────────────

export function OrderRefundModal({
  isOpen,
  onClose,
  onConfirm,
  lineItems,
  refundedQtyByVariantId = {},
  isConfirming = false,
  returnRequestId,
  requestMaxQtyByVariantId,
}: OrderRefundModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  function getAvailableQty(item: LineItem): number {
    const orderAvailable = item.quantity - (refundedQtyByVariantId[item.variantId] ?? 0);
    if (requestMaxQtyByVariantId) {
      const requestMax = requestMaxQtyByVariantId[item.variantId] ?? 0;
      return Math.min(orderAvailable, requestMax);
    }
    return orderAvailable;
  }

  // When scoped to a return request, only show items in that request
  const visibleItems = requestMaxQtyByVariantId
    ? lineItems.filter((i) => (requestMaxQtyByVariantId[i.variantId] ?? 0) > 0)
    : lineItems;

  // Use variantId as key (productId would collide when same product has multiple variants)
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  const [refundQty, setRefundQty] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      lineItems.map((i) => [i.variantId, Math.max(1, getAvailableQty(i))])
    )
  );

  const [method, setMethod] = useState<RefundMethod>("original");

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedItems({});
      setRefundQty(
        Object.fromEntries(
          visibleItems.map((i) => [i.variantId, Math.max(1, getAvailableQty(i))])
        )
      );
      setMethod("original");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  function handleToggleItem(variantId: string, checked: boolean) {
    setSelectedItems((prev) => ({ ...prev, [variantId]: checked }));
  }

  function handleQtyChange(variantId: string, qty: number, max: number) {
    const clamped = Math.max(1, Math.min(qty, max));
    setRefundQty((prev) => ({ ...prev, [variantId]: clamped }));
  }

  const selectedLineItems = visibleItems.filter(
    (i) => selectedItems[i.variantId] && getAvailableQty(i) > 0
  );

  const totalAmount = selectedLineItems.reduce(
    (sum, item) => sum + (refundQty[item.variantId] ?? 1) * item.unitPrice,
    0
  );

  const canProceedStep1 = selectedLineItems.length > 0;

  function handleConfirm() {
    onConfirm({
      items: selectedLineItems.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity:  refundQty[i.variantId] ?? getAvailableQty(i),
      })),
      method,
      totalAmount,
    });
  }

  function resetAndClose() {
    setStep(1);
    setSelectedItems({});
    setRefundQty(
      Object.fromEntries(
        visibleItems.map((i) => [i.variantId, Math.max(1, getAvailableQty(i))])
      )
    );
    setMethod("original");
    onClose();
  }

  // ── Step indicator ──────────────────────────────────────────────────────────

  const StepIndicator = (
    <div className="flex items-center justify-center gap-2 mb-5">
      {STEP_LABELS.map((label, idx) => {
        const n = idx + 1;
        const isActive = step === n;
        const isDone = step > n;
        return (
          <div key={n} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div
                className={[
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                  isDone
                    ? "bg-success-600 text-white"
                    : isActive
                    ? "bg-primary-600 text-white"
                    : "bg-secondary-100 text-secondary-400",
                ].join(" ")}
              >
                {n}
              </div>
              <span
                className={[
                  "text-xs font-medium",
                  isActive ? "text-secondary-900" : "text-secondary-400",
                ].join(" ")}
              >
                {label}
              </span>
            </div>
            {idx < STEP_LABELS.length - 1 && (
              <div className="h-px w-6 bg-secondary-200 shrink-0" aria-hidden="true" />
            )}
          </div>
        );
      })}
    </div>
  );

  // ── Footer ──────────────────────────────────────────────────────────────────

  const footer = (
    <>
      {step === 1 && (
        <>
          <Button variant="secondary" onClick={resetAndClose}>Hủy</Button>
          <Button variant="primary" onClick={() => setStep(2)} disabled={!canProceedStep1}>
            Tiếp theo
          </Button>
        </>
      )}
      {step === 2 && (
        <>
          <Button variant="secondary" onClick={() => setStep(1)}>Quay lại</Button>
          <Button variant="primary" onClick={() => setStep(3)}>Tiếp theo</Button>
        </>
      )}
      {step === 3 && (
        <>
          <Button variant="secondary" onClick={() => setStep(2)} disabled={isConfirming}>
            Quay lại
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={isConfirming}
            isLoading={isConfirming}
          >
            {isConfirming ? "Đang xử lý…" : "Xác nhận hoàn tiền"}
          </Button>
        </>
      )}
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title="Hoàn tiền đơn hàng"
      size="4xl"
      footer={footer}
      animated
    >
      {StepIndicator}

      {/* Return request context banner */}
      {returnRequestId && (
        <div className="mb-4 rounded-lg border border-primary-200 bg-primary-50 px-3 py-2 text-xs text-primary-700 font-medium">
          Hoàn tiền theo yêu cầu đổi trả <span className="font-mono">#{returnRequestId}</span>
          {" "}— chỉ hiển thị sản phẩm trong yêu cầu.
        </div>
      )}

      {/* ── Step 1: Select items ──────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-secondary-500 border-b border-secondary-100">
                <th className="pb-2 pr-2 w-[4%]" />
                <th className="pb-2 pr-3 w-[44%]">Sản phẩm</th>
                <th className="pb-2 pr-3 w-[18%] text-right">Đơn giá</th>
                <th className="pb-2 pr-3 w-[18%] text-center">SL hoàn</th>
                <th className="pb-2 w-[16%] text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-50">
              {visibleItems.map((item) => {
                const available    = getAvailableQty(item);
                const alreadyDone  = item.quantity - available;
                const isFullyDone  = available <= 0;
                const isSelected   = !isFullyDone && Boolean(selectedItems[item.variantId]);
                const qty          = refundQty[item.variantId] ?? Math.max(1, available);
                const lineAmt      = isSelected ? qty * item.unitPrice : 0;

                return (
                  <tr
                    key={item.variantId}
                    className={[
                      isFullyDone  ? "opacity-50"          : "",
                      isSelected   ? "bg-primary-50/30"    : "",
                    ].join(" ")}
                  >
                    <td className="py-2.5 pr-2 w-[4%]">
                      <Checkbox
                        checked={isSelected}
                        disabled={isFullyDone}
                        onChange={(e) => handleToggleItem(item.variantId, e.target.checked)}
                        aria-label={`Chọn ${item.name}`}
                      />
                    </td>
                    <td className="py-2.5 pr-3 w-[44%]">
                      <Tooltip content={item.name} placement="top" multiline maxWidth="360px">
                        <a
                          href={`/products/${item.productId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block max-w-[500px] truncate font-bold text-secondary-900 hover:text-primary-600 hover:underline leading-tight"
                        >
                          {item.name}
                        </a>
                      </Tooltip>
                      <p className="text-xs text-secondary-500 leading-tight mt-0.5">{item.variantName}</p>
                      <p className="text-xs font-mono text-secondary-400 leading-tight">{item.sku}</p>
                      {isFullyDone && (
                        <Badge variant="error" size="sm" className="mt-1">Đã hoàn đủ</Badge>
                      )}
                      {!isFullyDone && alreadyDone > 0 && (
                        <Badge variant="warning" size="sm" className="mt-1">
                          Đã hoàn {alreadyDone}/{item.quantity}
                        </Badge>
                      )}
                    </td>
                    <td className="py-2.5 pr-3 text-right text-secondary-600">
                      {formatVND(item.unitPrice)}
                    </td>
                    <td className="py-2.5 pr-3 text-center">
                      <input
                        type="number"
                        min={1}
                        max={available}
                        value={isFullyDone ? 0 : qty}
                        disabled={!isSelected || isFullyDone}
                        onChange={(e) =>
                          handleQtyChange(item.variantId, Number(e.target.value), available)
                        }
                        className="w-16 rounded border border-secondary-300 px-2 py-1 text-center text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-500 disabled:bg-secondary-100 disabled:text-secondary-400 disabled:cursor-not-allowed"
                      />
                      <span className="ml-1 text-xs text-secondary-400">
                        / {isFullyDone ? item.quantity : available}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-medium text-secondary-800">
                      {isSelected ? formatVND(lineAmt) : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex justify-end border-t border-secondary-100 pt-3">
            <div className="text-sm">
              <span className="text-secondary-600">Tổng hoàn tiền: </span>
              <span className="font-semibold text-secondary-900 text-base">
                {formatVND(totalAmount)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Refund method ─────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-3">
          <p className="text-sm text-secondary-600 mb-4">Chọn phương thức hoàn tiền:</p>

          <label
            className={[
              "flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer transition-colors",
              method === "original"
                ? "border-primary-500 bg-primary-50"
                : "border-secondary-200 hover:border-secondary-300",
            ].join(" ")}
          >
            <input
              type="radio"
              name="refund_method"
              value="original"
              checked={method === "original"}
              onChange={() => setMethod("original")}
              className="mt-0.5 accent-primary-600"
            />
            <div className="flex items-center gap-2">
              <CreditCardIcon className="w-5 h-5 text-primary-600 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-medium text-secondary-800">Hoàn tiền gốc</p>
                <p className="text-xs text-secondary-500">
                  Hoàn tiền về phương thức thanh toán ban đầu.
                </p>
              </div>
            </div>
          </label>

          <label
            className={[
              "flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer transition-colors",
              method === "store_credit"
                ? "border-primary-500 bg-primary-50"
                : "border-secondary-200 hover:border-secondary-300",
            ].join(" ")}
          >
            <input
              type="radio"
              name="refund_method"
              value="store_credit"
              checked={method === "store_credit"}
              onChange={() => setMethod("store_credit")}
              className="mt-0.5 accent-primary-600"
            />
            <div className="flex items-center gap-2">
              <GiftIcon className="w-5 h-5 text-warning-500 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-medium text-secondary-800">Tín dụng cửa hàng</p>
                <p className="text-xs text-secondary-500">
                  Cộng số tiền hoàn vào ví của khách hàng.
                </p>
              </div>
            </div>
          </label>
        </div>
      )}

      {/* ── Step 3: Confirmation summary ─────────────────────────── */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="rounded-xl bg-error-50 border border-error-200 p-4 text-center">
            <p className="text-xs font-medium text-error-600 mb-1">Tổng hoàn tiền</p>
            <p className="text-3xl font-bold text-error-700">{formatVND(totalAmount)}</p>
          </div>

          <div className="rounded-xl border border-secondary-100 overflow-hidden">
            <div className="bg-secondary-50 px-3 py-2 text-xs font-semibold text-secondary-500 uppercase tracking-wide">
              Sản phẩm hoàn trả
            </div>
            <ul className="divide-y divide-secondary-100">
              {selectedLineItems.map((item) => {
                const qty = refundQty[item.variantId] ?? getAvailableQty(item);
                return (
                  <li key={item.variantId} className="flex items-center justify-between px-3 py-2.5">
                    <div className="min-w-0 flex-1 mr-3">
                      <Tooltip content={item.name} placement="top" multiline maxWidth="360px">
                        <a
                          href={`/products/${item.productId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block max-w-[500px] truncate font-bold text-secondary-900 hover:text-primary-600 hover:underline text-sm leading-tight"
                        >
                          {item.name}
                        </a>
                      </Tooltip>
                      <p className="text-xs text-secondary-500 leading-tight mt-0.5">{item.variantName}</p>
                      <p className="text-xs font-mono text-secondary-400 leading-tight">{item.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-secondary-700">x{qty}</p>
                      <p className="text-sm font-medium text-secondary-900">
                        {formatVND(qty * item.unitPrice)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-secondary-100 bg-secondary-50 px-3 py-2.5">
            {method === "original" ? (
              <CreditCardIcon className="w-4 h-4 text-primary-600" aria-hidden="true" />
            ) : (
              <GiftIcon className="w-4 h-4 text-warning-500" aria-hidden="true" />
            )}
            <span className="text-sm text-secondary-700">
              Phương thức:{" "}
              <span className="font-semibold">
                {method === "original" ? "Hoàn tiền gốc" : "Tín dụng cửa hàng"}
              </span>
            </span>
          </div>
        </div>
      )}
    </Modal>
  );
}
