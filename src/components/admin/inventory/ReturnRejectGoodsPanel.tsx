"use client";

import { useState } from "react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { useToast } from "@/src/components/ui/Toast";
import { rejectAfterInspection, type RejectAfterInspectionDto } from "@/src/services/returns.service";
import type { ReturnRequest } from "@/src/types/inventory.types";

// ─── RejectGoodsPanel ─────────────────────────────────────────────────────────

export function RejectGoodsPanel({ returnId, onDone, onAccept }: {
  returnId: string;
  onDone: (updated: ReturnRequest) => void;
  onAccept?: () => void;
}) {
  const { showToast }   = useToast();
  const [mode, setMode] = useState<"idle" | "rejecting">("idle");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<RejectAfterInspectionDto>({
    rejectTrackingCode: "",
    rejectCarrier:      "",
    rejectNotes:        "",
  });

  async function handleReject() {
    setSaving(true);
    try {
      const updated = await rejectAfterInspection(returnId, {
        rejectTrackingCode: form.rejectTrackingCode || undefined,
        rejectCarrier:      form.rejectCarrier      || undefined,
        rejectNotes:        form.rejectNotes        || undefined,
      });
      showToast("Đã từ chối nhận hàng.", "success");
      onDone(updated);
    } catch (err) {
      showToast((err as Error)?.message || "Không thể từ chối nhận hàng.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-secondary-900">Quyết định sau kiểm tra</h3>
        <p className="mt-0.5 text-xs text-secondary-500">
          Chấp nhận hàng để tiếp tục xử lý, hoặc từ chối nếu hàng không đúng mô tả và hoàn trả lại khách.
        </p>
      </div>

      {mode === "idle" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Chấp nhận */}
          <div className="flex flex-col gap-3 rounded-xl border-2 border-success-200 bg-success-50 p-4">
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-success-600" />
              <div>
                <p className="text-sm font-semibold text-success-800">Chấp nhận hàng</p>
                <p className="mt-1 text-xs leading-relaxed text-success-700">
                  Hàng đúng mô tả — tiếp tục xử lý theo hướng đã chọn.
                </p>
              </div>
            </div>
            {onAccept && (
              <div className="flex justify-end">
                <Button variant="secondary" onClick={onAccept}>
                  Tiếp tục xử lý
                </Button>
              </div>
            )}
          </div>

          {/* Từ chối */}
          <div className="flex flex-col gap-3 rounded-xl border-2 border-error-200 bg-error-50 p-4">
            <div className="flex items-start gap-3">
              <XCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-error-600" />
              <div>
                <p className="text-sm font-semibold text-error-800">Từ chối nhận hàng</p>
                <p className="mt-1 text-xs leading-relaxed text-error-700">
                  Hàng không đúng mô tả — hoàn trả lại khách và đóng yêu cầu.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="danger" onClick={() => setMode("rejecting")}>
                Từ chối nhận hàng
              </Button>
            </div>
          </div>
        </div>
      )}

      {mode === "rejecting" && (
        <div className="space-y-4 border-t border-secondary-100 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Thông tin hoàn trả lại khách</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Input
                label="Mã vận đơn trả khách"
                type="text"
                value={form.rejectTrackingCode || ""}
                onChange={(e) => setForm((f) => ({ ...f, rejectTrackingCode: e.target.value }))}
                placeholder="VD: GHTK-REJ-2025-001"
              />
            </div>
            <div>
              <Input
                label="Đơn vị vận chuyển"
                type="text"
                value={form.rejectCarrier || ""}
                onChange={(e) => setForm((f) => ({ ...f, rejectCarrier: e.target.value }))}
                placeholder="VD: GHTK, GHN..."
              />
            </div>
            <div className="sm:col-span-2">
              <Textarea
                label="Ghi chú lý do từ chối"
                value={form.rejectNotes || ""}
                onChange={(e) => setForm((f) => ({ ...f, rejectNotes: e.target.value }))}
                placeholder="VD: Hàng không đúng mô tả, bị thay thế linh kiện..."
                showCharCount
                maxCharCount={512}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setMode("idle")} disabled={saving}>
              Huỷ
            </Button>
            <Button variant="danger" onClick={handleReject} disabled={saving} isLoading={saving}>
              Xác nhận từ chối
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
