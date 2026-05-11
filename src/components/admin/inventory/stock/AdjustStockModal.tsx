"use client";

import { useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "../../ui";

// ─── Types ────────────────────────────────────────────────────────────────────

type AdjustAction =
  | { kind: "adjust"; soLuong: number; loaiGiaoDich: "Nhap"; ghiChu: string }
  | { kind: "export"; soLuong: number; loaiPhieu: "XuatHuy" | "XuatDieuChinh" | "XuatNoiBo"; lyDo: string; ghiChu: string };

interface AdjustStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (action: AdjustAction) => Promise<void>;
  itemName: string;
  variantId: number;
  currentQty: number;
  isConfirming: boolean;
}

// ─── Options ──────────────────────────────────────────────────────────────────

const OPTIONS = [
  { value: "Nhap",          label: "Nhập bù",          isExport: false },
  { value: "XuatDieuChinh", label: "Xuất điều chỉnh",  isExport: true },
  { value: "XuatHuy",       label: "Huỷ hàng hỏng",    isExport: true },
  { value: "XuatNoiBo",     label: "Xuất nội bộ",       isExport: true },
] as const;

type OptionValue = (typeof OPTIONS)[number]["value"];

// ─── Component ────────────────────────────────────────────────────────────────

export function AdjustStockModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  variantId,
  currentQty,
  isConfirming,
}: AdjustStockModalProps) {
  const [selected, setSelected] = useState<OptionValue>("Nhap");
  const [soLuong, setSoLuong] = useState(0);
  const [lyDo, setLyDo] = useState("");
  const [ghiChu, setGhiChu] = useState("");

  const isExport = OPTIONS.find((o) => o.value === selected)?.isExport ?? false;

  function reset() {
    setSelected("Nhap");
    setSoLuong(0);
    setLyDo("");
    setGhiChu("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit() {
    if (soLuong <= 0) return;
    if (isExport && !lyDo.trim()) return;

    let action: AdjustAction;
    if (!isExport) {
      action = { kind: "adjust", soLuong, loaiGiaoDich: "Nhap", ghiChu: ghiChu.trim() };
    } else {
      action = {
        kind: "export",
        soLuong,
        loaiPhieu: selected as "XuatHuy" | "XuatDieuChinh" | "XuatNoiBo",
        lyDo: lyDo.trim(),
        ghiChu: ghiChu.trim(),
      };
    }

    await onConfirm(action);
    reset();
  }

  const previewQty = isExport
    ? Math.max(0, currentQty - soLuong)
    : currentQty + soLuong;

  const isSubmitDisabled =
    soLuong <= 0 ||
    (isExport && !lyDo.trim()) ||
    isConfirming;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Điều Chỉnh Tồn Kho"
      size="lg"
      animated
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={isConfirming}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            isLoading={isConfirming}
          >
            {isExport ? "Tạo phiếu xuất" : "Xác nhận"}
          </Button>
        </>
      }
    >
      <p className="mb-5 text-sm text-secondary-500 truncate">{itemName}</p>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="rounded-xl bg-secondary-50 border border-secondary-100 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Tồn Kho Hiện Tại</p>
          <p className="mt-1 text-xl font-bold text-secondary-900">{currentQty}</p>
        </div>
        <div className={[
          "rounded-xl border px-4 py-3",
          soLuong > 0 && !isExport ? "bg-success-50 border-success-200" :
          soLuong > 0 && isExport   ? "bg-error-50 border-error-200"   :
          "bg-secondary-50 border-secondary-100",
        ].join(" ")}>
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Sau Điều Chỉnh</p>
          <p className={[
            "mt-1 text-xl font-bold",
            soLuong > 0 && !isExport ? "text-success-700" :
            soLuong > 0 && isExport   ? "text-error-700"   :
            "text-secondary-900",
          ].join(" ")}>{previewQty}</p>
        </div>
      </div>

      {/* Loại thao tác */}
      <div className="mb-5">
        <p className="mb-2 text-sm font-medium text-secondary-700">Loại thao tác</p>
        <div className="space-y-2">
          {OPTIONS.map((opt) => (
            <label key={opt.value} className="flex cursor-pointer items-center gap-3">
              <input
                type="radio"
                name="loai-thao-tac"
                value={opt.value}
                checked={selected === opt.value}
                onChange={() => setSelected(opt.value)}
                className="accent-primary-600"
              />
              <span className="text-sm text-secondary-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Số lượng */}
      <div className="mb-5">
        <Input
          label={`Số lượng${isExport ? ` (tối đa: ${currentQty})` : ""}`}
          type="number"
          min={1}
          max={isExport ? currentQty : undefined}
          value={soLuong === 0 ? "" : soLuong}
          onChange={(e) => setSoLuong(Math.max(0, parseInt(e.target.value, 10) || 0))}
          placeholder="VD: 2"
        />
      </div>

      {/* Lý do (bắt buộc cho xuất) */}
      {isExport && (
        <div className="mb-5">
          <label className="mb-1.5 block text-sm font-medium text-secondary-700">
            Lý do <span className="text-error-600" aria-hidden="true">*</span>
          </label>
          <Textarea
            rows={2}
            value={lyDo}
            onChange={(e) => setLyDo(e.target.value)}
            placeholder="VD: Hư hỏng khi vận chuyển nội bộ…"
            className="w-full resize-none rounded-lg border border-secondary-300 px-3 py-2 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            showCharCount
            maxCharCount={500}
          />
        </div>
      )}

      {/* Ghi chú */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-secondary-700">
          Ghi chú
        </label>
        <Textarea
          rows={2}
          value={ghiChu}
          onChange={(e) => setGhiChu(e.target.value)}
          placeholder="Ghi chú thêm (không bắt buộc)"
          className="w-full resize-none rounded-lg border border-secondary-300 px-3 py-2 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          showCharCount
          maxCharCount={250}
        />
      </div>
    </Modal>
  );
}
