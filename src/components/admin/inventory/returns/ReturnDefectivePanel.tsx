"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { Select } from "@/src/components/ui/Select";
import { useToast } from "@/src/components/ui/Toast";
import {
  updateDefectiveHandling,
  completeReuse,
  type UpdateDefectiveHandlingDto,
  type CompleteReuseDto,
} from "@/src/services/returns.service";

function formatDate(s?: string) {
  if (!s) return "—";
  const d = new Date(s);
  const time = d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const date = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  return `${time} ${date}`;
}

const DEFECTIVE_HANDLING_LABELS: Record<string, string> = {
  TraNhaCungCap: "Trả nhà cung cấp",
  TieuHuy:       "Tiêu hủy",
  TaiSuDung:     "Tái sử dụng linh kiện",
};

const DEFECTIVE_HANDLING_OPTIONS = [
  { value: "TraNhaCungCap", label: "Trả nhà cung cấp" },
  { value: "TieuHuy",       label: "Tiêu hủy" },
  { value: "TaiSuDung",     label: "Tái sử dụng linh kiện" },
];

// ─── DefectiveHandlingPanel ───────────────────────────────────────────────────

export function DefectiveHandlingPanel({ resolutionId, defectiveHandling, defectiveHandledAt, defectiveNotes, onDone }: {
  resolutionId: string;
  defectiveHandling?: string | null;
  defectiveHandledAt?: string | null;
  defectiveNotes?: string | null;
  onDone: () => void;
}) {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<UpdateDefectiveHandlingDto>({
    defectiveHandling: "TraNhaCungCap",
    defectiveNotes:    "",
  });

  if (defectiveHandling) {
    return (
      <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm space-y-3">
        <h3 className="text-sm font-semibold text-secondary-900">Xử lý hàng lỗi</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Hướng xử lý</p>
            <p className="mt-1 text-sm font-medium text-secondary-800">
              {DEFECTIVE_HANDLING_LABELS[defectiveHandling] ?? defectiveHandling}
            </p>
          </div>
          {defectiveHandledAt && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Thời điểm xử lý</p>
              <p className="mt-1 text-sm text-secondary-700">{formatDate(defectiveHandledAt)}</p>
            </div>
          )}
          {defectiveNotes && (
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Ghi chú</p>
              <p className="mt-1 text-sm text-secondary-700">{defectiveNotes}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateDefectiveHandling(resolutionId, {
        defectiveHandling: form.defectiveHandling,
        defectiveNotes:    form.defectiveNotes || undefined,
      });
      showToast("Đã lưu xử lý hàng lỗi.", "success");
      onDone();
    } catch (err) {
      showToast((err as Error)?.message || "Không thể lưu.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm space-y-4">
      <h3 className="text-sm font-semibold text-secondary-900">Xử lý hàng lỗi</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Select
            label="Hướng xử lý"
            required
            options={DEFECTIVE_HANDLING_OPTIONS}
            value={form.defectiveHandling}
            onChange={(v) => setForm((f) => ({ ...f, defectiveHandling: v as UpdateDefectiveHandlingDto["defectiveHandling"] }))}
          />
        </div>
        <div className="sm:col-span-2">
          <Textarea
            label="Ghi chú"
            value={form.defectiveNotes || ""}
            onChange={(e) => setForm((f) => ({ ...f, defectiveNotes: e.target.value }))}
            showCharCount
            maxCharCount={512}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button variant="secondary" onClick={handleSave} disabled={saving} isLoading={saving}>
          Lưu xử lý hàng lỗi
        </Button>
      </div>
    </div>
  );
}

// ─── CompleteReusePanel ───────────────────────────────────────────────────────

export function CompleteReusePanel({ resolutionId, onDone }: { resolutionId: string; onDone: () => void }) {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CompleteReuseDto>({ phieuNhapKhoId: 0, ghiChu: "" });

  async function handleSubmit() {
    if (!form.phieuNhapKhoId || form.phieuNhapKhoId <= 0) {
      showToast("Vui lòng nhập mã phiếu nhập kho hợp lệ.", "error");
      return;
    }
    setSaving(true);
    try {
      await completeReuse(resolutionId, {
        phieuNhapKhoId: form.phieuNhapKhoId,
        ghiChu:         form.ghiChu || undefined,
      });
      showToast("Đã hoàn tất tái sử dụng linh kiện.", "success");
      onDone();
    } catch (err) {
      showToast((err as Error)?.message || "Không thể hoàn tất.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-secondary-900">Hoàn tất tái sử dụng linh kiện</h3>
        <p className="mt-0.5 text-xs text-secondary-500">Liên kết phiếu nhập kho hàng tái sử dụng để hoàn tất xử lý.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Input
            label="Mã phiếu nhập kho"
            required
            type="number"
            min={1}
            value={form.phieuNhapKhoId || ""}
            onChange={(e) => setForm((f) => ({ ...f, phieuNhapKhoId: e.target.value ? Number(e.target.value) : 0 }))}
          />
        </div>
        <div className="sm:col-span-2">
          <Textarea
            label="Ghi chú"
            value={form.ghiChu || ""}
            onChange={(e) => setForm((f) => ({ ...f, ghiChu: e.target.value }))}
            showCharCount
            maxCharCount={512}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button variant="primary" onClick={handleSubmit} disabled={saving} isLoading={saving}>
          Hoàn tất tái sử dụng
        </Button>
      </div>
    </div>
  );
}
