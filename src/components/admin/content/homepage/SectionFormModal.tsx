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
import { Badge } from "@/src/components/ui/Badge";
import { SourceConfigEditor } from "./SourceConfigEditor";
import { ManualItemsEditor } from "./ManualItemsEditor";
import { SectionPreviewPane } from "./SectionPreviewPane";
import type {
  HomepageSection,
  HomepageSectionFormData,
  HomepageSectionType,
  SectionLayout,
  SourceConfig,
  SectionSortBy,
  SectionItem,
  CategorySourceConfig,
  BrandSourceConfig,
} from "@/src/types/homepage.types";

// ─── Badge color presets (bg + text combos) ───────────────────────────────────

const BADGE_COLOR_PRESETS = [
  { bg: "#ef4444", text: "#ffffff", name: "Đỏ" },
  { bg: "#f97316", text: "#ffffff", name: "Cam" },
  { bg: "#f59e0b", text: "#000000", name: "Vàng" },
  { bg: "#22c55e", text: "#ffffff", name: "Xanh lá" },
  { bg: "#3b82f6", text: "#ffffff", name: "Xanh" },
  { bg: "#8b5cf6", text: "#ffffff", name: "Tím" },
  { bg: "#ec4899", text: "#ffffff", name: "Hồng" },
  { bg: "#1f2937", text: "#ffffff", name: "Đen" },
  { bg: "#fef3c7", text: "#92400e", name: "Vàng nhạt" },
  { bg: "#dbeafe", text: "#1d4ed8", name: "Xanh nhạt" },
  { bg: "#ffffff", text: "#ef4444", name: "Trắng" },
  { bg: "#fee2e2", text: "#991b1b", name: "Hồng nhạt" },
] as const;

// ─── Default form ─────────────────────────────────────────────────────────────

/** Extract "YYYY-MM-DD" from ISO datetime or ISO date string */
function toDatePart(iso: string | undefined): string {
  if (!iso) return "";
  return iso.includes("T") ? iso.split("T")[0] : iso;
}

function defaultForm(section?: HomepageSection | null): HomepageSectionFormData {
  const sourceSortBy =
    section?.type === "category" || section?.type === "brand"
      ? (section.sourceConfig as CategorySourceConfig | BrandSourceConfig | null)?.sortBy
      : undefined;

  if (section) {
    return {
      title: section.title,
      subtitle: section.subtitle ?? "",
      viewAllUrl: section.viewAllUrl ?? "",
      type: section.type,
      sourceConfig: section.sourceConfig,
      sortBy: sourceSortBy ?? section.sortBy,
      maxProducts: section.maxProducts,
      layout: section.layout,
      badgeLabel: section.badgeLabel ?? "",
      badgeColor: section.badgeColor ?? "#ef4444",
      badgeTextColor: section.badgeTextColor ?? "#ffffff",
      isVisible: section.isVisible,
      ngayBatDau: toDatePart(section.ngayBatDau),
      ngayKetThuc: toDatePart(section.ngayKetThuc),
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
    badgeTextColor: "#ffffff",
    isVisible: true,
    ngayBatDau: "",
    ngayKetThuc: "",
    manualItems: [],
  };
}

function getTopLevelSortBy(
  type: HomepageSectionType,
  sourceConfig: SourceConfig,
  fallback: SectionSortBy,
): SectionSortBy {
  if (type === "category" || type === "brand") {
    const configWithSort = sourceConfig as CategorySourceConfig | BrandSourceConfig | null;
    return configWithSort?.sortBy ?? fallback;
  }
  return fallback;
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
    setForm((prev) => {
      const nextSourceConfig = defaultConfigs[type];
      return {
        ...prev,
        type,
        sourceConfig: nextSourceConfig,
        sortBy: getTopLevelSortBy(type, nextSourceConfig, prev.sortBy),
        manualItems: [],
      };
    });
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
      closeOnBackdrop={false}
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
                {/* Left: inputs */}
                <div className="flex flex-1 flex-col gap-3">
                  <Input
                    label="Nhãn badge"
                    value={form.badgeLabel}
                    onChange={(e) => set("badgeLabel", e.target.value.slice(0, 12))}
                    placeholder="HOT / MỚI / SALE…"
                    helperText="Tối đa 12 ký tự"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <ColorSelect
                      label="Màu nền"
                      presets={[]}
                      value={form.badgeColor}
                      onChange={(v) => set("badgeColor", v)}
                    />
                    <ColorSelect
                      label="Màu chữ"
                      presets={[]}
                      value={form.badgeTextColor}
                      onChange={(v) => set("badgeTextColor", v)}
                    />
                  </div>
                  {/* Preset combinations */}
                  <div>
                    <p className="mb-1.5 select-none text-xs font-medium text-secondary-500">Mẫu có sẵn — nhấn để áp dụng</p>
                    <div className="flex flex-wrap gap-1.5">
                      {BADGE_COLOR_PRESETS.map((preset) => {
                        const isActive =
                          form.badgeColor === preset.bg &&
                          form.badgeTextColor === preset.text;
                        return (
                          <button
                            key={`${preset.bg}-${preset.text}`}
                            type="button"
                            title={preset.name}
                            onClick={() => {
                              set("badgeColor", preset.bg);
                              set("badgeTextColor", preset.text);
                            }}
                            className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase transition-all focus:outline-none focus-visible:outline-none"
                            style={{
                              backgroundColor: preset.bg,
                              color: preset.text,
                              boxShadow: isActive
                                ? "0 0 0 1.5px white, 0 0 0 3px #6366f1"
                                : preset.bg === "#ffffff"
                                  ? "0 0 0 1px #e2e8f0"
                                  : "none",
                            }}
                          >
                            {form.badgeLabel || "HOT"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right: live preview */}
                <div className="flex w-48 shrink-0 flex-col items-center justify-center gap-2 rounded-xl border border-secondary-100 bg-secondary-50 px-3">
                  <p className="select-none text-[10px] text-secondary-400">Xem trước</p>
                  {form.badgeLabel ? (
                    <Badge
                      shape="tag"
                      size="lg"
                      backgroundColor={form.badgeColor || "#ef4444"}
                      textColor={form.badgeTextColor || "#ffffff"}
                      className="uppercase tracking-wide"
                    >
                      {form.badgeLabel}
                    </Badge>
                  ) : (
                    <Badge shape="tag" size="lg" variant="default" className="uppercase tracking-wide opacity-30">
                      HOT
                    </Badge>
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
                onChange={(cfg) => {
                  setForm((prev) => ({
                    ...prev,
                    sourceConfig: cfg,
                    sortBy: getTopLevelSortBy(prev.type, cfg, prev.sortBy),
                  }));
                }}
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
              badgeTextColor={form.badgeTextColor}
              viewAllUrl={form.viewAllUrl}
              manualItems={form.manualItems}
            />
          </TabPanel>
        </Tabs>
      </div>
    </Modal>
  );
}
