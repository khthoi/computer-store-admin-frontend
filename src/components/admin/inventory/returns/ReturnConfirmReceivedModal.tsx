"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Input } from "@/src/components/ui/Input";
import { useToast } from "@/src/components/ui/Toast";
import { ModalFooter } from "./ReturnApproveDialog";
import type { ConfirmReceivedDto } from "@/src/services/returns.service";

// ─── ConfirmReceivedModal ─────────────────────────────────────────────────────

interface ConfirmReceivedModalProps {
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onConfirm: (dto: ConfirmReceivedDto) => void;
}

export function ConfirmReceivedModal({ isOpen, isSaving, onClose, onConfirm }: ConfirmReceivedModalProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState<ConfirmReceivedDto>({ returnTrackingCode: "", returnCarrier: "" });

  function handleClose() {
    setForm({ returnTrackingCode: "", returnCarrier: "" });
    onClose();
  }

  function handleConfirm() {
    if (!form.returnTrackingCode?.trim()) {
      showToast("Vui lòng nhập mã vận đơn hoàn trả.", "error");
      return;
    }
    if (!form.returnCarrier?.trim()) {
      showToast("Vui lòng nhập đơn vị vận chuyển.", "error");
      return;
    }
    onConfirm({
      returnTrackingCode: form.returnTrackingCode || undefined,
      returnCarrier:      form.returnCarrier      || undefined,
    });
  }

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden="true" onClick={handleClose} className="absolute inset-0 bg-secondary-900/60 backdrop-blur-sm" />
      <div role="dialog" aria-modal="true" aria-labelledby="confirm-received-title" className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="px-6 pb-6 pt-6 space-y-4">
          <div>
            <h2 id="confirm-received-title" className="text-base font-semibold text-secondary-900">Xác nhận đã nhận hàng</h2>
            <p className="mt-0.5 text-sm text-secondary-500">Ghi nhận kho đã nhận hàng vật lý từ khách.</p>
          </div>
          <div className="space-y-3">
            <Input
              label="Mã vận đơn hoàn trả"
              required
              type="text"
              value={form.returnTrackingCode || ""}
              onChange={(e) => setForm((f) => ({ ...f, returnTrackingCode: e.target.value }))}
              placeholder="VD: GHTK-RET-2025-001"
            />
            <Input
              label="Đơn vị vận chuyển"
              required
              type="text"
              value={form.returnCarrier || ""}
              onChange={(e) => setForm((f) => ({ ...f, returnCarrier: e.target.value }))}
              placeholder="VD: GHTK, GHN, ViettelPost..."
            />
          </div>
          <ModalFooter
            onClose={handleClose}
            onConfirm={handleConfirm}
            confirmLabel="Xác nhận đã nhận hàng"
            isLoading={isSaving}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
