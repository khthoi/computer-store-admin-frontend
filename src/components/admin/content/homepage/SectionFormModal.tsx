"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Toggle } from "@/src/components/ui/Toggle";
import { ColorSelect } from "@/src/components/ui/ColorSelect";
import { DateInput } from "@/src/components/ui/DateInput";
import { Tabs, TabPanel } from "@/src/components/ui/Tabs";
import { LayoutPicker } from "@/src/components/ui/LayoutPicker";
import { SectionTypePicker } from "@/src/components/ui/SectionTypePicker";
import { SourceConfigEditor } from "./SourceConfigEditor";
import { ManualItemsEditor } from "./ManualItemsEditor";
import { SectionPreviewPane } from "./SectionPreviewPane";
import type {
  HomepageSection,
  HomepageSectionFormData,
  HomepageSectionType,
  SectionLayout,
  SourceConfig,
  SectionItem,
} from "@/src/types/homepage.types";

// ─── Default form ─────────────────────────────────────────────────────────────

function defaultForm(section?: HomepageSection | null): HomepageSectionFormData {
  if (section) {
    return {
      title: section.title,
      subtitle: section.subtitle ?? "",
      viewAllUrl: section.viewAllUrl ?? "",
      type: section.type,
      sourceConfig: section.sourceConfig,
      sortBy: section.sortBy,
      maxProducts: section.maxProducts,
      layout: section.layout,
      badgeLabel: section.badgeLabel ?? "",
      badgeColor: section.badgeColor ?? "#ef4444",
      isVisible: section.isVisible,
      ngayBatDau: section.ngayBatDau ?? "",
      ngayKetThuc: section.ngayKetThuc ?? "",
      manualItems: section.items ?? [],
    };
  }
  return {
    title: "",
    subtitle: "",
    viewAllUrl: "",
    type: "category",
    sourceConfig: { danhMucIds: [], sortBy: "newest" },
    sortBy: "newest",
    maxProducts: 6,
    layout: "carousel",
    badgeLabel: "",
    badgeColor: "#ef4444",
    isVisible: true,
    ngayBatDau: "",
    ngayKetThuc: "",
    manualItems: [],
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export interface SectionFormModalProps {
  section: HomepageSection | null;
  onClose: () => void;
  onSave: (data: HomepageSectionFormData) => Promise<void>;
}

export function SectionFormModal({ section, onClose, onSave }: SectionFormModalProps) {
  const [form, setForm] = useState<HomepageSectionFormData>(() => defaultForm(section));
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  useEffect(() => {
    setForm(defaultForm(section));
    setErrors({});
  }, [section]);

  function set<K extends keyof HomepageSectionFormData>(
    key: K,
    value: HomepageSectionFormData[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleTypeChange(type: HomepageSectionType) {
    // Reset sourceConfig when type changes
    const defaultConfigs: Record<HomepageSectionType, SourceConfig> = {
      category:     { danhMucIds: [], sortBy: "newest" },
      promotion:    { khuyenMaiId: 0 },
      brand:        { thuongHieuIds: [], sortBy: "newest" },
      manual:       null,
      new_arrivals: { danhMucIds: [] },
      best_selling: { danhMucIds: [] },
    };
    setForm((prev) => ({ ...prev, type, sourceConfig: defaultConfigs[type], manualItems: [] }));
  }

  function validate(): boolean {
    const errs: typeof errors = {};
    if (!form.title.trim()) errs.title = "Tiêu đề không được để trống";
    if (form.maxProducts < 1 || form.maxProducts > 24)
      errs.maxProducts = "Số sản phẩm phải từ 1 đến 24";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setIsSaving(true);
    try {
      await onSave(form);
    } finally {
      setIsSaving(false);
    }
  }

  const isEditing = Boolean(section);

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEditing ? `Sửa: ${section!.title}` : "Thêm khối sản phẩm mới"}
      size="4xl"
      animated
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Hủy</Button>
          <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
            {isEditing ? "Lưu thay đổi" : "Tạo khối"}
          </Button>
        </>
      }
    >
      <div className="max-h-[75vh] overflow-y-auto">
        <Tabs
          variant="line"
          defaultValue="display"
          tabs={[
            { value: "display",  label: "Hiển thị" },
            { value: "source",   label: "Nguồn sản phẩm" },
            { value: "preview",  label: "Xem trước" },
          ]}
        >
          {/* ══════════════════════════════════════════════════════════════
              TAB 1 — Hiển thị
          ══════════════════════════════════════════════════════════════ */}
          <TabPanel value="display" className="space-y-5 p-1 pt-5">
            {/* Title + Subtitle */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Tiêu đề"
                required
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="VD: Laptop Gaming Mới Nhất"
                errorMessage={errors.title}
              />
              <Input
                label="Phụ đề"
                value={form.subtitle}
                onChange={(e) => set("subtitle", e.target.value)}
                placeholder="VD: Cập nhật hàng tuần"
              />
            </div>

            {/* View all URL */}
            <Input
              label="Đường dẫn «Xem tất cả»"
              value={form.viewAllUrl}
              onChange={(e) => set("viewAllUrl", e.target.value)}
              placeholder="/products/laptop-gaming"
              helperText="Bắt đầu bằng / — ví dụ: /products/laptop-gaming. Để trống để ẩn link."
            />

            {/* Badge */}
            <div>
              <p className="mb-2 select-none text-sm font-medium text-secondary-700">
                Badge <span className="font-normal text-secondary-400">(tuỳ chọn)</span>
              </p>
              <div className="flex items-stretch gap-4">
                {/* Left: inputs stacked */}
                <div className="flex w-120 shrink-0 flex-col gap-3">
                  <Input
                    label="Nhãn badge"
                    value={form.badgeLabel}
                    onChange={(e) => set("badgeLabel", e.target.value.slice(0, 12))}
                    placeholder="HOT / MỚI / SALE…"
                    helperText="Tối đa 12 ký tự"
                  />
                  <div>
                    <p className="mb-1.5 select-none text-sm font-medium text-secondary-700">Màu nền</p>
                    <ColorSelect
                      value={form.badgeColor}
                      onChange={(v) => set("badgeColor", v)}
                    />
                  </div>
                </div>

                {/* Right: live preview — fixed width, không flex-1 */}
                <div className="flex w-60 shrink-0 items-center justify-center rounded-xl border border-secondary-100 bg-secondary-50">
                  {form.badgeLabel ? (
                    <span
                      className="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-bold tracking-wide text-white"
                      style={{ backgroundColor: form.badgeColor || "#ef4444" }}
                    >
                      {form.badgeLabel}
                    </span>
                  ) : (
                    <p className="select-none text-center text-xs text-secondary-400">Xem trước</p>
                  )}
                </div>
              </div>
            </div>

            {/* Layout + Max products */}
            <LayoutPicker
              value={form.layout as SectionLayout}
              onChange={(l) => set("layout", l)}
            />

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Số SP tối đa"
                type="number"
                value={String(form.maxProducts)}
                onChange={(e) => set("maxProducts", Math.max(1, Math.min(24, Number(e.target.value))))}
                helperText="Từ 1 đến 24"
                errorMessage={errors.maxProducts}
              />
              <div>
                <DateInput
                  label="Hiển thị từ ngày"
                  value={form.ngayBatDau}
                  onChange={(v) => set("ngayBatDau", v)}
                  placeholder="Không giới hạn"
                />
              </div>
              <div>
                <DateInput
                  label="Đến ngày"
                  value={form.ngayKetThuc}
                  onChange={(v) => set("ngayKetThuc", v)}
                  placeholder="Không giới hạn"
                />
              </div>
            </div>

            <Toggle
              label="Hiển thị trên trang chủ"
              checked={form.isVisible}
              onChange={(e) => set("isVisible", e.target.checked)}
            />
          </TabPanel>

          {/* ══════════════════════════════════════════════════════════════
              TAB 2 — Nguồn sản phẩm
          ══════════════════════════════════════════════════════════════ */}
          <TabPanel value="source" className="space-y-5 p-1 pt-5">
            <SectionTypePicker
              value={form.type}
              onChange={handleTypeChange}
            />

            <div className="rounded-xl border border-secondary-100 bg-secondary-50 p-4">
              <SourceConfigEditor
                type={form.type}
                config={form.sourceConfig}
                onChange={(cfg) => set("sourceConfig", cfg)}
              />
            </div>

            {form.type === "manual" && (
              <ManualItemsEditor
                items={form.manualItems}
                onChange={(items) => set("manualItems", items as SectionItem[])}
              />
            )}
          </TabPanel>

          {/* ══════════════════════════════════════════════════════════════
              TAB 3 — Xem trước
          ══════════════════════════════════════════════════════════════ */}
          <TabPanel value="preview" className="p-1 pt-5">
            <SectionPreviewPane
              type={form.type}
              sourceConfig={form.sourceConfig}
              layout={form.layout as SectionLayout}
              maxProducts={form.maxProducts}
              title={form.title}
              badgeLabel={form.badgeLabel}
              badgeColor={form.badgeColor}
              viewAllUrl={form.viewAllUrl}
              manualItems={form.manualItems}
            />
          </TabPanel>
        </Tabs>
      </div>
    </Modal>
  );
}
