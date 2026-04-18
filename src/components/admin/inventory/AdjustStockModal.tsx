"use client";

import { useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { Button } from "@/src/components/ui/Button";
import { Textarea } from "../../ui";
 
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Điều Chỉnh Tồn Kho"
      size="lg"
      animated
      footer={
        <>
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isConfirming}
            
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={delta === 0 || !note.trim() || isConfirming}
            isLoading={isConfirming}
          >
            Xác Nhận
          </Button>
        </>
      }
    >
      {/* Item name */}
      <p className="mb-5 text-sm text-secondary-500 truncate">{itemName}</p>

      {/* Current / New qty */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="rounded-xl bg-secondary-50 border border-secondary-100 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Số Lượng Hiện Tại</p>
          <p className="mt-1 text-xl font-bold text-secondary-900">{currentQty}</p>
        </div>
        <div className={[
          "rounded-xl border px-4 py-3",
          delta > 0 ? "bg-success-50 border-success-200" : delta < 0 ? "bg-error-50 border-error-200" : "bg-secondary-50 border-secondary-100",
        ].join(" ")}>
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Số Lượng Mới</p>
          <p className={[
            "mt-1 text-xl font-bold",
            delta > 0 ? "text-success-700" : delta < 0 ? "text-error-700" : "text-secondary-900",
          ].join(" ")}>{newQty}</p>
        </div>
      </div>

      {/* Delta input */}
      <div className="mb-5">
        <label className="mb-1.5 block text-sm font-medium text-secondary-700">
          Điều chỉnh (số dương = thêm, số âm = bớt)
        </label>
        <input
          type="number"
          value={delta === 0 ? "" : delta}
          onChange={(e) => setDelta(parseInt(e.target.value, 10) || 0)}
          placeholder="VD: 10 hoặc -5"
          className="w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm text-secondary-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      {/* Note */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-secondary-700">
          Lý Do / Ghi Chú <span className="text-error-600" aria-hidden="true">*</span>
        </label>
        <Textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="VD: Kiểm kê thủ công, hàng hỏng đã loại bỏ…"
          className="w-full resize-none rounded-lg border border-secondary-300 px-3 py-2 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          showCharCount
          maxCharCount={250}
        />
      </div>
    </Modal>
  );
}
