"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import type { ReturnLineItem } from "@/src/types/inventory.types";

interface MarkReceivedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (adminNote: string) => Promise<void>;
  lineItems: ReturnLineItem[];
  isConfirming: boolean;
}

export function MarkReceivedModal({
  isOpen,
  onClose,
  onConfirm,
  lineItems,
  isConfirming,
}: MarkReceivedModalProps) {
  const [adminNote, setAdminNote] = useState("");

  function handleClose() {
    setAdminNote("");
    onClose();
  }

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
        aria-label="Mark Items Received"
        className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-secondary-100 px-6 py-4">
          <h2 className="text-base font-semibold text-secondary-900">Mark Items Received</h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary-400 hover:bg-secondary-100 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {/* Items summary */}
          <div className="rounded-xl bg-secondary-50 border border-secondary-100 p-3 space-y-2">
            {lineItems.map((li) => (
              <div key={li.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-secondary-800">{li.productName}</p>
                  <p className="text-xs text-secondary-500 font-mono">{li.sku}</p>
                </div>
                <span className="font-semibold text-secondary-700">×{li.quantity}</span>
              </div>
            ))}
          </div>

          {/* Note */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-secondary-700">
              Admin Note (optional)
            </label>
            <textarea
              rows={2}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="e.g. Items received in good condition, proceeding with replacement…"
              className="w-full resize-none rounded-lg border border-secondary-300 px-3 py-2 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-secondary-100 px-6 py-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isConfirming}
            className="rounded-xl border border-secondary-200 px-5 py-2.5 text-sm font-medium text-secondary-700 hover:bg-secondary-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <Button
            variant="primary"
            onClick={() => onConfirm(adminNote.trim())}
            disabled={isConfirming}
            isLoading={isConfirming}
          >
            Confirm Received
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
