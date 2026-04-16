"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Select } from "@/src/components/ui/Select";
import { DateInput } from "@/src/components/ui/DateInput";
import { Toggle } from "@/src/components/ui/Toggle";
import { Dropzone } from "@/src/components/ui/Dropzone";
import { RichTextEditor } from "@/src/components/editor/DynamicRichTextEditor";
import { PopupPreview } from "./PopupPreview";
import { createPopup, updatePopup } from "@/src/services/content.service";
import type { Popup, PopupFormData, PopupPosition, PopupStatus, PopupTrigger } from "@/src/types/content.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PopupFormModalProps {
  popup?: Popup | null;
  onClose: () => void;
  onSaved: (popup: Popup) => void;
}

// ─── Option lists ─────────────────────────────────────────────────────────────

const POSITION_OPTIONS = [
  { value: "center",       label: "Giữa màn hình" },
  { value: "top_left",     label: "Góc trên trái" },
  { value: "top_right",    label: "Góc trên phải" },
  { value: "bottom_left",  label: "Góc dưới trái" },
  { value: "bottom_right", label: "Góc dưới phải" },
];

const TRIGGER_OPTIONS = [
  { value: "on_load",  label: "Tải trang",          description: "Hiện ngay khi trang được mở" },
  { value: "on_exit",  label: "Khi thoát trang",     description: "Hiện khi chuột rời khỏi cửa sổ" },
  { value: "on_scroll", label: "Khi cuộn trang",     description: "Hiện sau khi cuộn đủ % trang" },
  { value: "on_delay", label: "Sau thời gian trễ",   description: "Hiện sau N giây kể từ khi tải trang" },
];

const STATUS_OPTIONS = [
  { value: "draft",     label: "Nháp" },
  { value: "active",    label: "Đang hoạt động" },
  { value: "scheduled", label: "Lên lịch" },
  { value: "ended",     label: "Kết thúc" },
];

// ─── Default ──────────────────────────────────────────────────────────────────

const DEFAULT: PopupFormData = {
  name: "", status: "draft", position: "center", trigger: "on_load",
  delaySeconds: 3, title: "", body: "", showCloseButton: true, showOnce: true,
  targetPages: [],
};

// ─── Component ────────────────────────────────────────────────────────────────

export function PopupFormModal({ popup, onClose, onSaved }: PopupFormModalProps) {
  const [form, setForm] = useState<PopupFormData>(DEFAULT);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof PopupFormData, string>>>({});

  useEffect(() => {
    if (popup) {
      setForm({
        name: popup.name, status: popup.status, position: popup.position,
        trigger: popup.trigger, delaySeconds: popup.delaySeconds,
        scrollPercent: popup.scrollPercent,
        title: popup.title ?? "", body: popup.body,
        imageUrl: popup.imageUrl,
        ctaLabel: popup.ctaLabel ?? "", ctaUrl: popup.ctaUrl ?? "",
        showCloseButton: popup.showCloseButton, showOnce: popup.showOnce,
        targetPages: popup.targetPages,
        startDate: popup.startDate, endDate: popup.endDate,
      });
    } else {
      setForm(DEFAULT);
    }
    setErrors({});
  }, [popup]);

  function set<K extends keyof PopupFormData>(key: K, value: PopupFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate() {
    const errs: typeof errors = {};
    if (!form.name.trim()) errs.name = "Tên popup không được để trống";
    if (!form.body.trim()) errs.body = "Nội dung không được để trống";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setIsSaving(true);
    try {
      const saved = popup
        ? await updatePopup(popup.id, form)
        : await createPopup(form);
      onSaved(saved);
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={popup ? "Chỉnh sửa Popup" : "Tạo Popup mới"}
      size="4xl"
      animated
    >
      <div className="max-h-[70vh] overflow-y-auto p-5 space-y-4">

        {/* Tên nội bộ */}
        <Input
          label="Tên popup (nội bộ)"
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Ví dụ: Popup đăng ký nhận tin"
          errorMessage={errors.name}
        />

        {/* Vị trí + Kích hoạt */}
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Vị trí hiển thị"
            required
            value={form.position}
            onChange={(v) => set("position", v as PopupPosition)}
            options={POSITION_OPTIONS}
          />
          <Select
            label="Kích hoạt khi"
            required
            value={form.trigger}
            onChange={(v) => set("trigger", v as PopupTrigger)}
            options={TRIGGER_OPTIONS}
          />
        </div>

        {/* Trigger-specific fields */}
        {form.trigger === "on_delay" && (
          <Input
            type="number"
            label="Thời gian trễ (giây)"
            required
            value={String(form.delaySeconds ?? 3)}
            onChange={(e) => set("delaySeconds", Number(e.target.value))}
            min="0"
            helperText="Popup sẽ hiện sau N giây kể từ khi trang tải xong"
          />
        )}
        {form.trigger === "on_scroll" && (
          <Input
            type="number"
            label="Cuộn đến % trang"
            required
            value={String(form.scrollPercent ?? 50)}
            onChange={(e) => set("scrollPercent", Number(e.target.value))}
            min="0" max="100"
            helperText="Popup hiện khi người dùng cuộn qua điểm này (0–100%)"
          />
        )}

        {/* Nội dung */}
        <Input
          label="Tiêu đề popup"
          value={form.title ?? ""}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Tiêu đề lớn hiển thị trong popup"
        />

        {/* Ảnh tiêu đề */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-secondary-700">
            Ảnh tiêu đề popup
            <span className="ml-1.5 text-xs font-normal text-secondary-400">(tuỳ chọn)</span>
          </label>
          <Dropzone
            key={popup?.id ?? "new"}
            initialUrl={form.imageUrl ?? ""}
            onPreviewChange={(url) => set("imageUrl", url || undefined)}
            aspectRatioHint="4:3 – Kích thước đề nghị 400 × 300 px"
            maxSizeMB={2}
          />
          <p className="text-xs text-secondary-400">
            Ảnh hiển thị phía trên tiêu đề trong popup. Để trống nếu không cần ảnh.
          </p>
        </div>

        <RichTextEditor
          label="Nội dung popup"
          required
          value={form.body}
          onChange={(html) => set("body", html)}
          placeholder="Nhập nội dung popup..."
          minHeight={200}
          errorMessage={errors.body}
        />

        {/* CTA */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Nhãn nút CTA"
            value={form.ctaLabel ?? ""}
            onChange={(e) => set("ctaLabel", e.target.value)}
            placeholder="Đăng ký ngay"
          />
          <Input
            label="URL nút CTA"
            value={form.ctaUrl ?? ""}
            onChange={(e) => set("ctaUrl", e.target.value)}
            placeholder="/newsletter"
          />
        </div>

        {/* Lên lịch */}
        <div className="grid grid-cols-2 gap-3">
          <DateInput
            label="Ngày bắt đầu"
            value={form.startDate ?? ""}
            onChange={(v) => set("startDate", v || null)}
            placeholder="Chọn ngày bắt đầu"
          />
          <DateInput
            label="Ngày kết thúc"
            value={form.endDate ?? ""}
            onChange={(v) => set("endDate", v || null)}
            placeholder="Chọn ngày kết thúc"
          />
        </div>

        {/* Trạng thái */}
        <Select
          label="Trạng thái"
          required
          value={form.status}
          onChange={(v) => set("status", v as PopupStatus)}
          options={STATUS_OPTIONS}
        />

        {/* Live preview */}
        <PopupPreview
          data={{
            position: form.position,
            title: form.title,
            body: form.body,
            imageUrl: form.imageUrl,
            ctaLabel: form.ctaLabel,
            showCloseButton: form.showCloseButton,
          }}
        />

        {/* Toggles */}
        <div className="flex flex-col gap-2.5 rounded-lg border border-secondary-100 bg-secondary-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <Toggle
              checked={form.showCloseButton}
              onChange={(e) => set("showCloseButton", e.target.checked)}
            />
            <div>
              <p className="text-sm font-medium text-secondary-700">Hiển thị nút đóng</p>
              <p className="text-xs text-secondary-400">Cho phép người dùng đóng popup</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Toggle
              checked={form.showOnce}
              onChange={(e) => set("showOnce", e.target.checked)}
            />
            <div>
              <p className="text-sm font-medium text-secondary-700">Chỉ hiện một lần mỗi phiên</p>
              <p className="text-xs text-secondary-400">Không hiện lại nếu người dùng đã thấy trong phiên này</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-secondary-100 px-5 py-4">
        <Button variant="ghost" onClick={onClose}>Hủy</Button>
        <Button onClick={handleSave} isLoading={isSaving}>
          {popup ? "Lưu thay đổi" : "Tạo popup"}
        </Button>
      </div>
    </Modal>
  );
}
