"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { Select } from "@/src/components/ui/Select";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { Button } from "@/src/components/ui/Button";
import { Toggle } from "@/src/components/ui/Toggle";
import { Alert } from "@/src/components/ui/Alert";
import { Badge } from "@/src/components/ui/Badge";
import { TECH_KEY_OPTIONS, slotsToOptions } from "@/src/services/buildpc.service";
import type { BuildPCRule, BuildPCRuleFormData, BuildPCSlot, RuleCheckType } from "@/src/types/buildpc.types";

// ─── Check type descriptions ──────────────────────────────────────────────────

const CHECK_TYPE_INFO: Record<RuleCheckType, { label: string; hint: string }> = {
  exact_match: {
    label: "Khớp chính xác",
    hint: "Thông số của khe đích phải bằng thông số khe nguồn. VD: socket CPU = socket Mainboard.",
  },
  contains: {
    label: "Chứa giá trị",
    hint: "Danh sách hỗ trợ của khe đích phải chứa giá trị của khe nguồn. VD: Mainboard hỗ trợ DDR5 khi CPU cần DDR5.",
  },
  min_sum: {
    label: "Tổng tối thiểu",
    hint: "Tổng thông số các khe đích (×hệ số) phải ≥ khe nguồn. VD: PSU ≥ tổng TDP × 1.3.",
  },
  min_value: {
    label: "Giá trị tối thiểu",
    hint: "Thông số khe đích phải ≥ thông số khe nguồn × hệ số. VD: RAM speed ≤ giới hạn Mainboard.",
  },
};

const CHECK_TYPE_OPTIONS = (Object.entries(CHECK_TYPE_INFO) as [RuleCheckType, { label: string }][]).map(
  ([value, { label }]) => ({ value, label })
);

const EMPTY_FORM: BuildPCRuleFormData = {
  slotNguonId: "",
  slotDichId: "",
  maKyThuat: "",
  loaiKiemTra: "exact_match",
  giaTriMacDinh: "",
  heSo: "",
  moTa: "",
  batBuoc: true,
  isActive: true,
};

function ruleToForm(r: BuildPCRule): BuildPCRuleFormData {
  return {
    slotNguonId: r.slotNguonId,
    slotDichId: r.slotDichId,
    maKyThuat: r.maKyThuat,
    loaiKiemTra: r.loaiKiemTra,
    giaTriMacDinh: r.giaTriMacDinh ?? "",
    heSo: r.heSo !== undefined ? String(r.heSo) : "",
    moTa: r.moTa ?? "",
    batBuoc: r.batBuoc,
    isActive: r.isActive,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

interface RuleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BuildPCRuleFormData) => Promise<void>;
  editing?: BuildPCRule | null;
  slots: BuildPCSlot[];
}

export function RuleFormModal({
  isOpen,
  onClose,
  onSubmit,
  editing = null,
  slots,
}: RuleFormModalProps) {
  const [form, setForm] = useState<BuildPCRuleFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof BuildPCRuleFormData, string>>>({});
  const [isSaving, setIsSaving] = useState(false);

  const slotOptions = slotsToOptions(slots).map((o) => ({ value: o.value, label: o.label, description: o.description }));
  const techKeySelectOptions = TECH_KEY_OPTIONS.map((t) => ({
    value: t.value,
    label: t.label,
    description: t.description,
  }));

  const selectedCheckType = form.loaiKiemTra;
  const checkTypeInfo = CHECK_TYPE_INFO[selectedCheckType];
  const needsHeSo = selectedCheckType === "min_sum" || selectedCheckType === "min_value";

  useEffect(() => {
    if (!isOpen) return;
    setForm(editing ? ruleToForm(editing) : EMPTY_FORM);
    setErrors({});
  }, [isOpen, editing]);

  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.slotNguonId) next.slotNguonId = "Chọn khe nguồn.";
    if (!form.slotDichId)  next.slotDichId  = "Chọn khe đích.";
    if (form.slotNguonId && form.slotDichId && form.slotNguonId === form.slotDichId)
      next.slotDichId = "Khe nguồn và khe đích phải khác nhau.";
    if (!form.maKyThuat) next.maKyThuat = "Chọn thông số kỹ thuật.";
    if (needsHeSo && form.heSo !== "" && isNaN(parseFloat(form.heSo)))
      next.heSo = "Hệ số phải là số hợp lệ.";
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

  function set<K extends keyof BuildPCRuleFormData>(key: K, value: BuildPCRuleFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editing ? "Chỉnh sửa quy tắc tương thích" : "Thêm quy tắc tương thích"}
      size="2xl"
      animated
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Hủy
          </Button>
          <Button variant="primary" isLoading={isSaving} onClick={handleSubmit}>
            {editing ? "Lưu thay đổi" : "Thêm quy tắc"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Slot pair */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Khe nguồn"
            placeholder="Chọn khe nguồn…"
            options={slotOptions}
            value={form.slotNguonId}
            onChange={(v) => set("slotNguonId", Array.isArray(v) ? v[0] : v)}
            errorMessage={errors.slotNguonId}
            required
          />
          <Select
            label="Khe đích"
            placeholder="Chọn khe đích…"
            options={slotOptions}
            value={form.slotDichId}
            onChange={(v) => set("slotDichId", Array.isArray(v) ? v[0] : v)}
            errorMessage={errors.slotDichId}
            required
          />
        </div>

        {/* Tech key */}
        <Select
          label="Thông số kỹ thuật"
          placeholder="Chọn thông số cần kiểm tra…"
          options={techKeySelectOptions}
          value={form.maKyThuat}
          onChange={(v) => set("maKyThuat", Array.isArray(v) ? v[0] : v)}
          errorMessage={errors.maKyThuat}
          required
        />

        {/* Check type */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-secondary-700">
            Loại kiểm tra <span className="text-error-500">*</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            {CHECK_TYPE_OPTIONS.map((opt) => {
              const active = form.loaiKiemTra === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set("loaiKiemTra", opt.value as RuleCheckType)}
                  className={[
                    "flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-left text-sm transition-all",
                    active
                      ? "border-primary-400 bg-primary-50 text-primary-700 font-semibold"
                      : "border-secondary-200 text-secondary-700 hover:border-secondary-300",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <Alert variant="info">
            <p className="text-xs">{checkTypeInfo.hint}</p>
          </Alert>
        </div>

        {/* Optional value override + heSo */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Giá trị tham chiếu (tùy chọn)"
            placeholder="Để trống = lấy từ thông số linh kiện"
            value={form.giaTriMacDinh}
            onChange={(e) => set("giaTriMacDinh", e.target.value)}
            helperText="Ghi đè giá trị đọc từ DB"
          />
          {needsHeSo ? (
            <Input
              label="Hệ số"
              type="number"
              step="0.1"
              min={0}
              placeholder="VD: 1.3"
              value={form.heSo}
              onChange={(e) => set("heSo", e.target.value)}
              errorMessage={errors.heSo}
              helperText="Nhân với giá trị nguồn"
            />
          ) : (
            <div /> // spacer
          )}
        </div>

        <Textarea
          label="Mô tả"
          placeholder="Giải thích quy tắc này cho nhân viên hiểu…"
          value={form.moTa}
          onChange={(e) => set("moTa", e.target.value)}
          rows={2}
          showCharCount
          maxCharCount={250}
        />

        {/* Flags */}
        <div className="flex items-center justify-between rounded-xl border border-secondary-200 bg-secondary-50 px-4 py-3">
          <Toggle
            checked={form.batBuoc}
            onChange={(e) => set("batBuoc", e.target.checked)}
            size="sm"
            label="Bắt buộc"
            description="Vi phạm → chặn thêm vào build"
          />
          <Toggle
            checked={form.isActive}
            onChange={(e) => set("isActive", e.target.checked)}
            size="sm"
            label="Kích hoạt"
            description="Tắt = quy tắc bị bỏ qua"
          />
        </div>
      </div>
    </Modal>
  );
}
