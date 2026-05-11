"use client";

import { useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { Select } from "@/src/components/ui/Select";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { Button } from "@/src/components/ui/Button";

// ─── Types ────────────────────────────────────────────────────────────────────

type AdjustmentType = "add" | "remove" | "set";
type AdjustmentReason = "received" | "damaged" | "returned" | "correction" | "other";

export interface StockAdjustmentPayload {
  sku: string;
  type: AdjustmentType;
  quantity: number;
  reason: AdjustmentReason;
  note: string;
  newStock: number;
}

export interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: StockAdjustmentPayload) => void;
  product: { name: string; sku: string; currentStock: number };
  isSaving?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ADJUSTMENT_TYPE_OPTIONS = [
  { value: "add",    label: "Nhập thêm" },
  { value: "remove", label: "Xuất kho" },
  { value: "set",    label: "Đặt chính xác" },
];

const REASON_OPTIONS = [
  { value: "received",   label: "Hàng nhập mới" },
  { value: "damaged",    label: "Hàng hỏng / mất" },
  { value: "returned",   label: "Hàng hoàn trả" },
  { value: "correction", label: "Điều chỉnh kiểm kê" },
  { value: "other",      label: "Lý do khác" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcNewStock(
  currentStock: number,
  type: AdjustmentType,
  quantity: number
): number {
  if (type === "add")    return currentStock + quantity;
  if (type === "remove") return currentStock - quantity;
  if (type === "set")    return quantity;
  return currentStock;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * StockAdjustmentModal — modal for adjusting a product's inventory level.
 *
 * Shows a live preview of the resulting stock after the adjustment and
 * prevents invalid submissions (zero quantity, over-remove).
 */
export function StockAdjustmentModal({
  isOpen,
  onClose,
  onConfirm,
  product,
  isSaving = false,
}: StockAdjustmentModalProps) {
  const [type, setType]         = useState<AdjustmentType>("add");
  const [quantity, setQuantity] = useState<string>("");
  const [reason, setReason]     = useState<AdjustmentReason>("received");
  const [note, setNote]         = useState("");

  const parsedQty = parseInt(quantity, 10);
  const validQty  = !isNaN(parsedQty) && parsedQty > 0;

  const newStock = validQty
    ? calcNewStock(product.currentStock, type, parsedQty)
    : product.currentStock;

  const isOverRemove = type === "remove" && validQty && parsedQty > product.currentStock;
  const canConfirm   = validQty && !isOverRemove && !isSaving;

  // ── Preview color ─────────────────────────────────────────────────────────

  const previewColor =
    type === "add"
      ? "text-success-600"
      : type === "remove"
      ? "text-error-600"
      : "text-info-600";

  // ── Handlers ─────────────────────────────────────────────────────────────

  function handleTypeChange(v: string | string[]) {
    setType(v as AdjustmentType);
  }

  function handleReasonChange(v: string | string[]) {
    setReason(v as AdjustmentReason);
  }

  function handleConfirm() {
    if (!canConfirm) return;
    onConfirm({
      sku:      product.sku,
      type,
      quantity: parsedQty,
      reason,
      note,
      newStock: calcNewStock(product.currentStock, type, parsedQty),
    });
  }

  function handleClose() {
    // Reset state on close
    setType("add");
    setQuantity("");
    setReason("received");
    setNote("");
    onClose();
  }

  // ── Footer ────────────────────────────────────────────────────────────────

  const footer = (
    <>
      <Button variant="secondary" onClick={handleClose} disabled={isSaving}>
        Hủy
      </Button>
      <Button
        variant="primary"
        onClick={handleConfirm}
        disabled={!canConfirm}
        isLoading={isSaving}
      >
        Xác nhận điều chỉnh
      </Button>
    </>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Điều chỉnh tồn kho"
      size="md"
      footer={footer}
      animated
    >
      {/* Product info header */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-secondary-100 bg-secondary-50 px-4 py-3 mb-5">
        <div className="min-w-0">
          <p className="font-medium text-secondary-900 truncate">{product.name}</p>
          <p className="font-mono text-xs text-secondary-400 mt-0.5">{product.sku}</p>
        </div>
        <div className="shrink-0">
          <span className="inline-flex items-center gap-1 rounded-full border border-secondary-200 bg-white px-3 py-1 text-sm font-semibold text-secondary-700">
            Tồn kho hiện tại:
            <span className="text-primary-600">{product.currentStock}</span>
          </span>
        </div>
      </div>

      {/* Form fields */}
      <div className="flex flex-col gap-4">
        {/* Adjustment type */}
        <Select
          label="Loại điều chỉnh"
          options={ADJUSTMENT_TYPE_OPTIONS}
          value={type}
          onChange={handleTypeChange}
        />

        {/* Quantity */}
        <Input
          label="Số lượng"
          type="number"
          min="0"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Nhập số lượng…"
          errorMessage={
            quantity !== "" && !validQty
              ? "Số lượng phải lớn hơn 0"
              : undefined
          }
        />

        {/* Reason */}
        <Select
          label="Lý do"
          options={REASON_OPTIONS}
          value={reason}
          onChange={handleReasonChange}
        />

        {/* Note */}
        <Textarea
          label="Ghi chú nội bộ"
          rows={2}
          placeholder="(Tùy chọn)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {/* Preview */}
      {quantity !== "" && validQty && (
        <div className="mt-4 rounded-xl border border-secondary-100 bg-secondary-50 px-4 py-3">
          {isOverRemove ? (
            <p className="text-sm font-medium text-error-600">
              Không đủ tồn kho — không thể xuất {parsedQty} đơn vị (hiện có{" "}
              {product.currentStock}).
            </p>
          ) : (
            <p className="text-sm">
              <span className="text-secondary-600">Tồn kho sau điều chỉnh: </span>
              <span className={`font-bold text-base ${previewColor}`}>
                {newStock}
              </span>
              <span className="text-secondary-400 text-xs ml-2">
                ({product.currentStock}{" "}
                {type === "add" ? `+ ${parsedQty}` : type === "remove" ? `− ${parsedQty}` : `→ ${parsedQty}`})
              </span>
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}
