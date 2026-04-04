"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon, BellAlertIcon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
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
    ok:              { wrapper: "bg-success-50 border-success-200 text-success-700", label: "OK — no alert" },
    low_stock:       { wrapper: "bg-warning-50 border-warning-200 text-warning-700", label: "Will trigger Low Stock alert" },
    out_of_stock_inv:{ wrapper: "bg-error-50   border-error-200   text-error-700",   label: "Out of Stock" },
  };
  const preview = previewStyles[previewLevel];

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-secondary-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Configure Alert Threshold"
        className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-secondary-100 px-6 py-4">
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
        <div className="px-6 py-5 space-y-5">
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

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-secondary-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isConfirming}
            className="rounded-xl border border-secondary-200 px-5 py-2.5 text-sm font-medium text-secondary-700 hover:bg-secondary-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <Button
            variant="primary"
            onClick={() => onConfirm(threshold)}
            disabled={isDisabled}
            isLoading={isConfirming}
          >
            Save Threshold
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
