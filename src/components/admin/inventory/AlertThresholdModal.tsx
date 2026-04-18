"use client";

import { useEffect, useState } from "react";
import { XMarkIcon, BellAlertIcon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { Modal } from "@/src/components/ui/Modal";
import type { InventoryItem } from "@/src/types/inventory.types";

interface AlertThresholdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (threshold: number) => Promise<void>;
  item: InventoryItem;
  isConfirming: boolean;
}

export function AlertThresholdModal({
  isOpen,
  onClose,
  onConfirm,
  item,
  isConfirming,
}: AlertThresholdModalProps) {
  const [threshold, setThreshold] = useState(item.lowStockThreshold);

  // Reset to item's current threshold each time modal opens
  useEffect(() => {
    if (isOpen) setThreshold(item.lowStockThreshold);
  }, [isOpen, item.lowStockThreshold]);

  const isUnchanged = threshold === item.lowStockThreshold;
  const isDisabled = threshold < 0 || isUnchanged || isConfirming;

  // Preview: what alertLevel would be with the new threshold
  const previewLevel =
    item.quantityOnHand === 0
      ? "out_of_stock_inv"
      : item.quantityOnHand <= threshold
      ? "low_stock"
      : "ok";

  const previewStyles: Record<string, { wrapper: string; label: string }> = {
    ok:               { wrapper: "bg-success-50 border-success-200 text-success-700", label: "OK - không có cảnh báo" },
    low_stock:        { wrapper: "bg-warning-50 border-warning-200 text-warning-700", label: "Sẽ kích hoạt cảnh báo tồn kho thấp" },
    out_of_stock_inv: { wrapper: "bg-error-50   border-error-200   text-error-700",   label: "Hết hàng" },
  };
  const preview = previewStyles[previewLevel];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      hideCloseButton
      animated
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isConfirming}
            className="rounded-lg"
          >
            Huỷ
          </Button>
          <Button
            variant="primary"
            className="rounded-lg"
            onClick={() => onConfirm(threshold)}
            disabled={isDisabled}
            isLoading={isConfirming}
          >
            Xác nhận
          </Button>
        </>
      }
    >
      {/* Custom header — break out of Modal body padding to sit flush at top */}
      <div className="-mx-6 -mt-5 mb-5 flex items-center justify-between border-b border-secondary-100 px-6 py-4">
        <div className="flex items-center gap-2">
          <BellAlertIcon className="w-5 h-5 text-warning-600" />
          <h2 className="text-base font-semibold text-secondary-900">Configure Alert Threshold</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary-400 hover:bg-secondary-100 hover:text-secondary-600 transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="space-y-5">
        {/* Item info */}
        <div className="rounded-xl border border-secondary-100 bg-secondary-50 px-4 py-3">
          <p className="text-sm font-semibold text-secondary-900">{item.productName}</p>
          <p className="text-xs text-secondary-500">{item.variantName}</p>
          <p className="mt-0.5 font-mono text-xs text-secondary-400">{item.sku}</p>
        </div>

        {/* Current vs new */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-secondary-100 bg-secondary-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">On Hand</p>
            <p className="mt-1 text-xl font-bold text-secondary-900">{item.quantityOnHand}</p>
          </div>
          <div className="rounded-xl border border-secondary-100 bg-secondary-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Current Threshold</p>
            <p className="mt-1 text-xl font-bold text-secondary-700">{item.lowStockThreshold}</p>
          </div>
        </div>

        {/* Threshold input */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-secondary-700">
            New Alert Threshold
          </label>
          <input
            type="number"
            min={0}
            value={threshold}
            onChange={(e) => setThreshold(Math.max(0, parseInt(e.target.value, 10) || 0))}
            className="w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm text-secondary-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
          <p className="mt-1 text-xs text-secondary-400">
            An alert triggers when stock on hand falls to or below this number. Set to 0 to disable.
          </p>
        </div>

        {/* Preview */}
        <div className={["rounded-xl border px-4 py-3 text-sm font-medium", preview.wrapper].join(" ")}>
          <span className="mr-1.5 font-semibold">Preview:</span>
          {preview.label}
          {threshold > 0 && previewLevel !== "out_of_stock_inv" && (
            <span className="ml-1 font-normal text-xs opacity-75">
              (alerts when stock ≤ {threshold})
            </span>
          )}
        </div>
      </div>
    </Modal>
  );
}
