"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { Input } from "@/src/components/ui/Input";
import { Select } from "@/src/components/ui/Select";
import { Textarea } from "@/src/components/ui/Textarea";
import { Button } from "@/src/components/ui/Button";
import { Toggle } from "@/src/components/ui/Toggle";
import { Alert } from "@/src/components/ui/Alert";
import { CATEGORY_OPTIONS } from "@/src/services/buildpc.service";
import type { BuildPCSlot, BuildPCSlotFormData } from "@/src/types/buildpc.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const EMPTY_FORM: BuildPCSlotFormData = {
  tenKhe: "",
  maKhe: "",
  danhMucId: "",
  soLuong: 1,
  batBuoc: true,
  thuTu: 1,
  moTa: "",
  isActive: true,
};

function slotToForm(s: BuildPCSlot): BuildPCSlotFormData {
  return {
    tenKhe: s.tenKhe,
    maKhe: s.maKhe,
    danhMucId: s.danhMucId,
    soLuong: s.soLuong,
    batBuoc: s.batBuoc,
    thuTu: s.thuTu,
    moTa: s.moTa ?? "",
    isActive: s.isActive,
  };
}

const CATEGORY_SELECT_OPTIONS = CATEGORY_OPTIONS.map((c) => ({
  value: String(c.value),
  label: c.label,
  description: c.description,
}));

// ─── Component ────────────────────────────────────────────────────────────────

interface SlotFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BuildPCSlotFormData) => Promise<void>;
  editing?: BuildPCSlot | null;
  nextThuTu?: number;
}

export function SlotFormModal({
  isOpen,
  onClose,
  onSubmit,
  editing = null,
  nextThuTu = 1,
}: SlotFormModalProps) {
  const [form, setForm] = useState<BuildPCSlotFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof BuildPCSlotFormData, string>>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Populate form when opening for edit
  useEffect(() => {
    if (!isOpen) return;
    if (editing) {
      setForm(slotToForm(editing));
    } else {
      setForm({ ...EMPTY_FORM, thuTu: nextThuTu });
    }
    setErrors({});
  }, [isOpen, editing, nextThuTu]);

  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.tenKhe.trim()) next.tenKhe = "Tên khe không được để trống.";
    if (!form.maKhe.trim()) next.maKhe = "Mã kỹ thuật không được để trống.";
    else if (!/^[a-z0-9_]+$/.test(form.maKhe)) next.maKhe = "Chỉ được dùng chữ thường, số, gạch dưới.";
    if (form.danhMucId === "") next.danhMucId = "Chọn danh mục sản phẩm.";
    if (form.soLuong < 1 || form.soLuong > 8) next.soLuong = "Số lượng phải từ 1 đến 8.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setIsSaving(true);
    try {
      await onSubmit(form);
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  function set<K extends keyof BuildPCSlotFormData>(key: K, value: BuildPCSlotFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editing ? "Chỉnh sửa khe linh kiện" : "Thêm khe linh kiện"}
      size="3xl"
      animated
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Hủy
          </Button>
          <Button variant="primary" isLoading={isSaving} onClick={handleSubmit}>
            {editing ? "Lưu thay đổi" : "Thêm khe"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Alert variant="info">
          Khe linh kiện xác định các thành phần người dùng có thể lắp ráp trong Build PC.
          Mã kỹ thuật <code className="rounded bg-info-50 px-1 py-0.5 text-xs">maKhe</code> phải
          duy nhất và không thay đổi sau khi có quy tắc tương thích trỏ vào.
        </Alert>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Tên khe"
            placeholder="VD: CPU, RAM, GPU…"
            value={form.tenKhe}
            onChange={(e) => set("tenKhe", e.target.value)}
            errorMessage={errors.tenKhe}
            required
          />
          <Input
            label="Mã kỹ thuật (maKhe)"
            placeholder="VD: cpu, ram, gpu…"
            value={form.maKhe}
            onChange={(e) => set("maKhe", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
            errorMessage={errors.maKhe}
            helperText="Chữ thường, số, gạch dưới"
            required
          />
        </div>

        <Select
          label="Danh mục sản phẩm"
          placeholder="Chọn danh mục…"
          options={CATEGORY_SELECT_OPTIONS}
          value={form.danhMucId !== "" ? String(form.danhMucId) : ""}
          onChange={(v) => set("danhMucId", (Array.isArray(v) ? v[0] : v) !== "" ? Number(Array.isArray(v) ? v[0] : v) : "")}
          errorMessage={errors.danhMucId}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Số lượng tối đa"
            type="number"
            min={1}
            max={8}
            value={String(form.soLuong)}
            onChange={(e) => set("soLuong", Math.max(1, parseInt(e.target.value) || 1))}
            errorMessage={errors.soLuong}
            helperText="VD: 2 cho khe RAM dual-channel"
          />
          <Input
            label="Thứ tự hiển thị"
            type="number"
            min={1}
            value={String(form.thuTu)}
            onChange={(e) => set("thuTu", Math.max(1, parseInt(e.target.value) || 1))}
          />
        </div>

        <Textarea
          label="Mô tả"
          placeholder="Ghi chú thêm về khe linh kiện này…"
          value={form.moTa}
          onChange={(e) => set("moTa", e.target.value)}
          rows={2}
          showCharCount
          maxCharCount={250}
        />

        <div className="flex items-center justify-between rounded-xl border border-secondary-200 bg-secondary-50 px-4 py-3">
          <label className="flex cursor-pointer items-center gap-3">
            <Toggle
              checked={form.batBuoc}
              onChange={(e) => set("batBuoc", e.target.checked)}
              size="sm"
            />
            <span className="text-sm font-medium text-secondary-700">Bắt buộc</span>
            <span className="text-xs text-secondary-400">Build thiếu khe này sẽ không hợp lệ</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3">
            <Toggle
              checked={form.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
              size="sm"
            />
            <span className="text-sm font-medium text-secondary-700">Kích hoạt</span>
            <span className="text-xs text-secondary-400">Tắt = ẩn khỏi giao diện</span>
          </label>
        </div>
      </div>
    </Modal>
  );
}
