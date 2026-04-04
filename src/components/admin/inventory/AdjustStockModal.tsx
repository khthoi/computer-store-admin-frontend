"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";

interface AdjustStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (delta: number, note: string) => Promise<void>;
  itemName: string;
  currentQty: number;
  isConfirming: boolean;
}

export function AdjustStockModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  currentQty,
  isConfirming,
}: AdjustStockModalProps) {
  const [delta, setDelta] = useState(0);
  const [note, setNote] = useState("");

  function handleClose() {
    setDelta(0);
    setNote("");
    onClose();
  }

  async function handleSubmit() {
    if (delta === 0 || !note.trim()) return;
    await onConfirm(delta, note.trim());
    setDelta(0);
    setNote("");
  }

  const newQty = Math.max(0, currentQty + delta);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-secondary-900/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Adjust Stock"
        className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-secondary-100 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-secondary-900">Adjust Stock</h2>
            <p className="mt-0.5 text-sm text-secondary-500 truncate max-w-xs">{itemName}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary-400 hover:bg-secondary-100 hover:text-secondary-600 transition-colors"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Current / New qty */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-secondary-50 border border-secondary-100 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Current Qty</p>
              <p className="mt-1 text-xl font-bold text-secondary-900">{currentQty}</p>
            </div>
            <div className={[
              "rounded-xl border px-4 py-3",
              delta > 0 ? "bg-success-50 border-success-200" : delta < 0 ? "bg-error-50 border-error-200" : "bg-secondary-50 border-secondary-100",
            ].join(" ")}>
              <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">New Qty</p>
              <p className={[
                "mt-1 text-xl font-bold",
                delta > 0 ? "text-success-700" : delta < 0 ? "text-error-700" : "text-secondary-900",
              ].join(" ")}>{newQty}</p>
            </div>
          </div>

          {/* Delta input */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-secondary-700">
              Adjustment (positive = add, negative = remove)
            </label>
            <input
              type="number"
              value={delta === 0 ? "" : delta}
              onChange={(e) => setDelta(parseInt(e.target.value, 10) || 0)}
              placeholder="e.g. 10 or -5"
              className="w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm text-secondary-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          {/* Note */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-secondary-700">
              Reason / Note <span className="text-error-600" aria-hidden="true">*</span>
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Manual count correction, damaged units removed…"
              className="w-full resize-none rounded-lg border border-secondary-300 px-3 py-2 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-secondary-100 px-6 py-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isConfirming}
            className="rounded-xl border border-secondary-200 px-5 py-2.5 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={delta === 0 || !note.trim() || isConfirming}
            isLoading={isConfirming}
          >
            Apply Adjustment
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
