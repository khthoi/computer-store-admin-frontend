"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Select } from "@/src/components/ui/Select";
import { RichTextEditor } from "@/src/components/editor/DynamicRichTextEditor";
import { DateInput } from "@/src/components/ui/DateInput";
import { Toggle } from "@/src/components/ui/Toggle";
import { ColorSelect } from "@/src/components/ui/ColorSelect";
import { AnnouncementBarPreview } from "./AnnouncementBarPreview";
import { createAnnouncementBar, updateAnnouncementBar } from "@/src/services/content.service";
import type { AnnouncementBar, AnnouncementBarFormData, BarPosition, BarStatus } from "@/src/types/content.types";

// ─── Option lists ─────────────────────────────────────────────────────────────

const POSITION_OPTIONS = [
  { value: "top",    label: "Đầu trang", description: "Thanh nằm trên cùng, trước header" },
  { value: "bottom", label: "Cuối trang", description: "Thanh nằm dưới cùng, sau footer" },
];

const STATUS_OPTIONS = [
  { value: "draft",     label: "Nháp" },
  { value: "active",    label: "Đang hoạt động" },
  { value: "scheduled", label: "Lên lịch" },
  { value: "ended",     label: "Kết thúc" },
];

// ─── Default ──────────────────────────────────────────────────────────────────

const DEFAULT: AnnouncementBarFormData = {
  name: "", status: "draft", position: "top", content: "",
  backgroundColor: "#1d4ed8", textColor: "#ffffff",
  showCloseButton: true, isScrolling: false, priority: 10,
};

// ─── Component ────────────────────────────────────────────────────────────────

export function AnnouncementBarFormModal({ bar, onClose, onSaved }: {
  bar?: AnnouncementBar | null;
  onClose: () => void;
  onSaved: (bar: AnnouncementBar) => void;
}) {
  const [form, setForm] = useState<AnnouncementBarFormData>(DEFAULT);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof AnnouncementBarFormData, string>>>({});

  useEffect(() => {
    if (bar) {
      setForm({
        name: bar.name, status: bar.status, position: bar.position,
        content: bar.content, backgroundColor: bar.backgroundColor,
        textColor: bar.textColor, showCloseButton: bar.showCloseButton,
        isScrolling: bar.isScrolling, linkUrl: bar.linkUrl,
        linkLabel: bar.linkLabel, startDate: bar.startDate,
        endDate: bar.endDate, priority: bar.priority,
      });
    } else {
      setForm(DEFAULT);
    }
    setErrors({});
  }, [bar]);

  function set<K extends keyof AnnouncementBarFormData>(key: K, value: AnnouncementBarFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate() {
    const errs: typeof errors = {};
    if (!form.name.trim()) errs.name = "Tên không được để trống";
    if (!form.content.trim()) errs.content = "Nội dung không được để trống";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setIsSaving(true);
    try {
      const saved = bar
        ? await updateAnnouncementBar(bar.id, form)
        : await createAnnouncementBar(form);
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
      title={bar ? "Chỉnh sửa thanh thông báo" : "Tạo thanh thông báo mới"}
      size="4xl"
      animated
    >
      <div className="max-h-[70vh] overflow-y-auto p-5 space-y-4">

        {/* Tên nội bộ */}
        <Input
          label="Tên (nội bộ)"
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          errorMessage={errors.name}
          placeholder="Ví dụ: Thông báo miễn phí vận chuyển"
        />

        {/* Nội dung */}
        <RichTextEditor
          label="Nội dung thông báo"
          required
          value={form.content}
          onChange={(html) => set("content", html)}
          placeholder="Miễn phí vận chuyển cho đơn hàng từ 500.000đ"
          errorMessage={errors.content}
          minHeight={120}
        />

        {/* Live preview */}
        <AnnouncementBarPreview data={form} />

        {/* Màu sắc */}
        <div className="grid grid-cols-2 gap-4">
          <ColorSelect
            label="Màu nền"
            value={form.backgroundColor}
            onChange={(c) => set("backgroundColor", c)}
            previewText="Xem trước"
          />
          <ColorSelect
            label="Màu chữ"
            value={form.textColor}
            onChange={(c) => set("textColor", c)}
            previewText="Xem trước"
            presets={[
              "#ffffff", "#f8fafc", "#f1f5f9",
              "#1f2937", "#374151", "#000000",
              "#fef9c3", "#dbeafe", "#fce7f3",
              "#fef3c7", "#dcfce7", "#ede9fe",
            ]}
          />
        </div>

        {/* Vị trí + Trạng thái */}
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Vị trí"
            required
            value={form.position}
            onChange={(v) => set("position", v as BarPosition)}
            options={POSITION_OPTIONS}
          />
          <Select
            label="Trạng thái"
            required
            value={form.status}
            onChange={(v) => set("status", v as BarStatus)}
            options={STATUS_OPTIONS}
          />
        </div>

        {/* Liên kết */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="URL liên kết"
            value={form.linkUrl ?? ""}
            onChange={(e) => set("linkUrl", e.target.value)}
            placeholder="/promotions"
          />
          <Input
            label="Nhãn liên kết"
            value={form.linkLabel ?? ""}
            onChange={(e) => set("linkLabel", e.target.value)}
            placeholder="Xem ngay"
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

        {/* Toggles */}
        <div className="flex flex-col gap-2.5 rounded-lg border border-secondary-100 bg-secondary-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <Toggle
              checked={form.showCloseButton}
              onChange={(e) => set("showCloseButton", e.target.checked)}
            />
            <div>
              <p className="text-sm font-medium text-secondary-700">Hiển thị nút đóng</p>
              <p className="text-xs text-secondary-400">Cho phép người dùng ẩn thanh thông báo</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Toggle
              checked={form.isScrolling}
              onChange={(e) => set("isScrolling", e.target.checked)}
            />
            <div>
              <p className="text-sm font-medium text-secondary-700">Chạy chữ (marquee)</p>
              <p className="text-xs text-secondary-400">Nội dung cuộn liên tục từ phải sang trái</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-secondary-100 px-5 py-4">
        <Button variant="ghost" onClick={onClose}>Hủy</Button>
        <Button onClick={handleSave} isLoading={isSaving}>
          {bar ? "Lưu thay đổi" : "Tạo thanh thông báo"}
        </Button>
      </div>
    </Modal>
  );
}
