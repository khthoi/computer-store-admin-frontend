"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { Select } from "@/src/components/ui/Select";
import { useToast } from "@/src/components/ui/Toast";
import { processRefund, type ProcessRefundDto } from "@/src/services/returns.service";

// ─── RefundPanel ──────────────────────────────────────────────────────────────

const PAYMENT_METHOD_OPTIONS = [
  { value: "ChuyenKhoan", label: "Chuyển khoản" },
  { value: "TienMat",     label: "Tiền mặt" },
  { value: "Vi",          label: "Ví điện tử" },
];

export function RefundPanel({ returnId, onDone }: { returnId: string; onDone: () => void }) {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProcessRefundDto>({
    soTienHoan:     0,
    phuongThucHoan: "ChuyenKhoan",
    maGiaoDichHoan: "",
    nganHangViHoan: "",
    ghiChu:         "",
  });

  async function handleSubmit() {
    if (!form.soTienHoan || form.soTienHoan <= 0) {
      showToast("Vui lòng nhập số tiền hoàn trả hợp lệ.", "error");
      return;
    }
    if (!form.phuongThucHoan) {
      showToast("Vui lòng chọn phương thức hoàn tiền.", "error");
      return;
    }
    setSaving(true);
    try {
      await processRefund(returnId, {
        ...form,
        maGiaoDichHoan: form.maGiaoDichHoan || undefined,
        nganHangViHoan: form.nganHangViHoan || undefined,
        ghiChu:         form.ghiChu         || undefined,
      });
      showToast("Hoàn tiền thành công.", "success");
      onDone();
    } catch (err) {
      showToast((err as Error)?.message || "Không thể thực hiện hoàn tiền.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm space-y-4">
      <h3 className="text-sm font-semibold text-secondary-900">Thực hiện hoàn tiền</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Input
            label="Số tiền hoàn (VNĐ)"
            required
            type="number"
            min={0}
            value={form.soTienHoan || ""}
            onChange={(e) => setForm((f) => ({ ...f, soTienHoan: Number(e.target.value) }))}
          />
        </div>
        <div>
          <Select
            label="Phương thức hoàn"
            required
            options={PAYMENT_METHOD_OPTIONS}
            value={form.phuongThucHoan}
            onChange={(v) => setForm((f) => ({ ...f, phuongThucHoan: v as string }))}
          />
        </div>
        <div>
          <Input
            label="Mã giao dịch hoàn"
            type="text"
            value={form.maGiaoDichHoan || ""}
            onChange={(e) => setForm((f) => ({ ...f, maGiaoDichHoan: e.target.value }))}
          />
        </div>
        <div>
          <Input
            label="Ngân hàng / Ví"
            type="text"
            value={form.nganHangViHoan || ""}
            onChange={(e) => setForm((f) => ({ ...f, nganHangViHoan: e.target.value }))}
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
          Xác nhận hoàn tiền
        </Button>
      </div>
    </div>
  );
}
