"use client";

import { useEffect, useState } from "react";
import { XMarkIcon, BellAlertIcon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Modal } from "@/src/components/ui/Modal";
import type { InventoryItem } from "@/src/types/inventory.types";

interface AlertThresholdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (threshold: number, reorderPoint: number) => Promise<void>;
  item: InventoryItem;
  initialReorderPoint?: number;
  isConfirming: boolean;
}

export function AlertThresholdModal({
  isOpen,
  onClose,
  onConfirm,
  item,
  initialReorderPoint = 0,
  isConfirming,
}: AlertThresholdModalProps) {
  const [threshold, setThreshold] = useState(item.lowStockThreshold);
  const [reorderPoint, setReorderPoint] = useState(initialReorderPoint);

  useEffect(() => {
    if (isOpen) {
      setThreshold(item.lowStockThreshold);
      setReorderPoint(initialReorderPoint);
    }
  }, [isOpen, item.lowStockThreshold, initialReorderPoint]);

  const isUnchanged = threshold === item.lowStockThreshold && reorderPoint === initialReorderPoint;
  const isDisabled = threshold < 0 || reorderPoint < 0 || isUnchanged || isConfirming;

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
          <Button variant="secondary" onClick={onClose} disabled={isConfirming}>
            Huỷ
          </Button>
          <Button
            variant="primary"
            onClick={() => onConfirm(threshold, reorderPoint)}
            disabled={isDisabled}
            isLoading={isConfirming}
          >
            Xác nhận
          </Button>
        </>
      }
    >
      <div className="-mx-6 -mt-5 mb-5 flex items-center justify-between border-b border-secondary-100 px-6 py-4">
        <div className="flex items-center gap-2">
          <BellAlertIcon className="w-5 h-5 text-warning-600" />
          <h2 className="text-base font-semibold text-secondary-900">Chỉnh Ngưỡng Cảnh Báo</h2>
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

      <div className="space-y-5">
        <div className="rounded-xl border border-secondary-100 bg-secondary-50 px-4 py-3">
          <p className="text-sm font-semibold text-secondary-900">{item.productName}</p>
          <p className="text-xs text-secondary-500">{item.variantName}</p>
          <p className="mt-0.5 font-mono text-xs text-secondary-400">{item.sku}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-secondary-100 bg-secondary-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Hiện có</p>
            <p className="mt-1 text-xl font-bold text-secondary-900">{item.quantityOnHand}</p>
          </div>
          <div className="rounded-xl border border-secondary-100 bg-secondary-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Ngưỡng hiện tại</p>
            <p className="mt-1 text-xl font-bold text-secondary-700">{item.lowStockThreshold}</p>
          </div>
        </div>

        <Input
          label="Ngưỡng cảnh báo tồn kho thấp"
          type="number"
          min={0}
          value={threshold}
          onChange={(e) => setThreshold(Math.max(0, parseInt(e.target.value, 10) || 0))}
          helperText="Cảnh báo khi số lượng tồn kho bằng hoặc thấp hơn con số này. Đặt 0 để tắt."
        />

        <Input
          label="Điểm đặt hàng lại (Reorder Point)"
          type="number"
          min={0}
          value={reorderPoint}
          onChange={(e) => setReorderPoint(Math.max(0, parseInt(e.target.value, 10) || 0))}
          helperText="Hệ thống sẽ gợi ý nhập hàng khi tồn kho xuống dưới mức này."
        />

        <div className={["rounded-xl border px-4 py-3 text-sm font-medium", preview.wrapper].join(" ")}>
          <span className="mr-1.5 font-semibold">Xem trước:</span>
          {preview.label}
          {threshold > 0 && previewLevel !== "out_of_stock_inv" && (
            <span className="ml-1 font-normal text-xs opacity-75">
              (cảnh báo khi tồn ≤ {threshold})
            </span>
          )}
        </div>
      </div>
    </Modal>
  );
}
