"use client";

import { useEffect, useState } from "react";
import { PlusIcon, TrashIcon, TagIcon } from "@heroicons/react/24/outline";
import { Modal } from "@/src/components/ui/Modal";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { Select } from "@/src/components/ui/Select";
import { Toggle } from "@/src/components/ui/Toggle";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { ColorSelect } from "@/src/components/ui/ColorSelect";
import { ImageField, emptyImageField, imageFieldFromUrl } from "@/src/components/ui/ImageField";
import type { ImageFieldValue } from "@/src/components/ui/ImageField";
import type { CategoryFormData } from "@/src/services/category.service";
import type { DanhMucNodeType, FilterParams } from "@/src/types/category.types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CategoryFormData) => void | Promise<void>;
  initialData?: Partial<CategoryFormData>;
  parentOptions?: { value: string; label: string }[];
  isSaving?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const NODE_TYPE_OPTIONS = [
  {
    value: "category",
    label: "Danh mục sản phẩm",
    description: "Link tới trang danh mục, URL tự sinh theo cây slug",
  },
  {
    value: "filter",
    label: "Bộ lọc nhanh (filter shortcut)",
    description: "Link tới danh mục cha kèm query params (brand, giá…)",
  },
  {
    value: "label",
    label: "Nhãn nhóm (label)",
    description: "Tiêu đề phân nhóm trong megamenu, không có link",
  },
];

/** Predefined filter keys with labels and input type */
const FILTER_KEYS = [
  { value: "brand",     label: "brand",     hint: "Slug thương hiệu, VD: asus",           inputType: "text"   },
  { value: "price_min", label: "price_min", hint: "Giá tối thiểu (VND), VD: 10000000",    inputType: "number" },
  { value: "price_max", label: "price_max", hint: "Giá tối đa (VND), VD: 20000000",       inputType: "number" },
];

/** Options for the key picker Select */
const FILTER_KEY_OPTIONS = [
  { value: "brand",     label: "brand",     description: "Slug thương hiệu" },
  { value: "price_min", label: "price_min", description: "Giá tối thiểu (VND)" },
  { value: "price_max", label: "price_max", description: "Giá tối đa (VND)" },
  { value: "__custom",  label: "Tùy chỉnh…", description: "Nhập tên tham số tùy ý" },
];

/** Helper – generate a colored letter-avatar SVG data URI for brand logos */
function mkBrandImg(letter: string, bg: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" fill="${bg}" rx="4"/><text x="16" y="21" text-anchor="middle" font-size="14" font-weight="700" font-family="Arial,sans-serif" fill="white">${letter}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** Mock brand list — replace with GET /admin/brands in production */
const MOCK_BRANDS = [
  { value: "asus",            label: "ASUS",             imageUrl: mkBrandImg("A", "#004082") },
  { value: "msi",             label: "MSI",              imageUrl: mkBrandImg("M", "#bd1220") },
  { value: "gigabyte",        label: "Gigabyte",         imageUrl: mkBrandImg("G", "#e67e22") },
  { value: "nvidia",          label: "NVIDIA",           imageUrl: mkBrandImg("N", "#76b900") },
  { value: "amd",             label: "AMD",              imageUrl: mkBrandImg("A", "#ed1c24") },
  { value: "intel",           label: "Intel",            imageUrl: mkBrandImg("I", "#0071c5") },
  { value: "corsair",         label: "Corsair",          imageUrl: mkBrandImg("C", "#1a1a1a") },
  { value: "kingston",        label: "Kingston",         imageUrl: mkBrandImg("K", "#c8102e") },
  { value: "samsung",         label: "Samsung",          imageUrl: mkBrandImg("S", "#1428a0") },
  { value: "western-digital", label: "Western Digital",  imageUrl: mkBrandImg("W", "#02a08d") },
  { value: "seagate",         label: "Seagate",          imageUrl: mkBrandImg("S", "#00ae42") },
  { value: "lg",              label: "LG",               imageUrl: mkBrandImg("L", "#a50034") },
  { value: "logitech",        label: "Logitech",         imageUrl: mkBrandImg("L", "#00b2ff") },
  { value: "razer",           label: "Razer",            imageUrl: mkBrandImg("R", "#00d000") },
];

const BADGE_PRESETS = [
  { label: "HOT",      bg: "#ef4444", fg: "#ffffff" },
  { label: "SALE",     bg: "#f97316", fg: "#ffffff" },
  { label: "MỚI",      bg: "#22c55e", fg: "#ffffff" },
  { label: "HOT DEAL", bg: "#7c3aed", fg: "#ffffff" },
  { label: "DEAL",     bg: "#0ea5e9", fg: "#ffffff" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function paramsToRows(params: FilterParams | null): { key: string; value: string }[] {
  if (!params) return [];
  return Object.entries(params).map(([key, value]) => ({ key, value }));
}

function rowsToParams(rows: { key: string; value: string }[]): FilterParams | null {
  const valid = rows.filter((r) => r.key.trim() && r.value.trim());
  if (!valid.length) return null;
  return Object.fromEntries(valid.map((r) => [r.key.trim(), r.value.trim()]));
}

function buildPreviewQuery(rows: { key: string; value: string }[]): string {
  const valid = rows.filter((r) => r.key.trim() && r.value.trim());
  if (!valid.length) return "";
  return "?" + valid.map((r) => `${r.key}=${encodeURIComponent(r.value)}`).join("&");
}

// ─── Sub-component: Filter params builder ─────────────────────────────────────

function FilterParamsBuilder({
  rows,
  onChange,
}: {
  rows: { key: string; value: string }[];
  onChange: (rows: { key: string; value: string }[]) => void;
}) {
  function setRow(index: number, field: "key" | "value", val: string) {
    const next = rows.map((r, i) => (i === index ? { ...r, [field]: val } : r));
    onChange(next);
  }

  function addRow() {
    onChange([...rows, { key: "brand", value: "" }]);
  }

  function removeRow(index: number) {
    onChange(rows.filter((_, i) => i !== index));
  }

  const previewQuery = buildPreviewQuery(rows);

  return (
    <div className="flex flex-col gap-3">
      {rows.length === 0 ? (
        <p className="text-xs text-secondary-400 italic">
          Chưa có tham số nào. Thêm ít nhất một tham số để tạo filter shortcut.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((row, i) => {
            const isKnownKey = FILTER_KEYS.some((k) => k.value === row.key);
            const keySelectValue = isKnownKey ? row.key : "__custom";
            const knownKey = FILTER_KEYS.find((k) => k.value === row.key);

            return (
              <div key={i} className="flex items-center gap-2">
                {/* ── Key picker (UI Select) ─────────────────────────── */}
                <div className="w-44 shrink-0">
                  <Select
                    options={FILTER_KEY_OPTIONS}
                    value={keySelectValue}
                    onChange={(v) => {
                      const picked = v as string;
                      if (picked !== "__custom") {
                        // switching to known key → also clear value to avoid stale data
                        onChange(
                          rows.map((r, idx) =>
                            idx === i ? { key: picked, value: "" } : r
                          )
                        );
                      } else {
                        setRow(i, "key", "");
                      }
                    }}
                    size="sm"
                    dropdownWidth="220px"
                  />
                  {/* Custom key text input */}
                  {!isKnownKey && (
                    <input
                      className="mt-1 w-full rounded-lg border border-secondary-200 bg-white px-3 py-2 text-sm font-mono focus:border-primary-400 focus:outline-none"
                      placeholder="tên_param"
                      value={row.key}
                      onChange={(e) => setRow(i, "key", e.target.value)}
                    />
                  )}
                </div>

                {/* ── Value ─────────────────────────────────────────── */}
                <div className="flex-1 min-w-0 flex flex-col">
                  {row.key === "brand" ? (
                    /* Brand picker — Select with logo images */
                    <Select
                      options={MOCK_BRANDS}
                      value={row.value}
                      onChange={(v) => setRow(i, "value", v as string)}
                      placeholder="Chọn thương hiệu…"
                      searchable
                      clearable
                      size="sm"
                    />
                  ) : (
                    <input
                      type={knownKey?.inputType ?? "text"}
                      className="w-full rounded-lg border border-secondary-200 bg-white px-3 py-2 text-sm focus:border-primary-400 focus:outline-none"
                      placeholder={knownKey?.hint ?? "Giá trị"}
                      value={row.value}
                      onChange={(e) => setRow(i, "value", e.target.value)}
                    />
                  )}
                </div>

                {/* ── Remove ────────────────────────────────────────── */}
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  className="mt-1 shrink-0 rounded-lg p-2 text-secondary-400 hover:bg-error-50 hover:text-error-600 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Button
        size="sm"
        variant="outline"
        leftIcon={<PlusIcon className="h-3.5 w-3.5" />}
        onClick={addRow}
        type="button"
      >
        Thêm tham số
      </Button>

      {/* URL preview */}
      {previewQuery && (
        <div className="rounded-lg border border-secondary-100 bg-secondary-50 px-3 py-2">
          <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary-400">
            Xem trước query string
          </p>
          <code className="break-all text-xs text-primary-700">
            /products/…/{"{slug-danh-muc-cha}"}{previewQuery}
          </code>
        </div>
      )}
    </div>
  );
}

// ─── Sub-component: Badge configurator ────────────────────────────────────────

function BadgeConfigurator({
  text, bg, fg,
  onTextChange, onBgChange, onFgChange,
}: {
  text: string;
  bg: string;
  fg: string;
  onTextChange: (v: string) => void;
  onBgChange: (v: string) => void;
  onFgChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Presets */}
      <div>
        <p className="mb-2 text-xs font-medium text-secondary-600">Mẫu nhanh</p>
        <div className="flex flex-wrap gap-2">
          {BADGE_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => { onTextChange(p.label); onBgChange(p.bg); onFgChange(p.fg); }}
              className="rounded-full px-3 py-1 text-xs font-bold transition-transform hover:scale-105 active:scale-95 focus:outline-none"
              style={{ backgroundColor: p.bg, color: p.fg }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Text input */}
      <Input
        label="Chữ badge"
        value={text}
        onChange={(e) => onTextChange(e.target.value.toUpperCase())}
        placeholder="HOT, SALE, MỚI…"
        maxLength={12}
        helperText="Tối đa 12 ký tự, tự động viết hoa"
      />

      {/* Colors */}
      <div className="grid grid-cols-2 gap-4">
        <ColorSelect
          label="Màu nền"
          value={bg}
          onChange={onBgChange}
          previewText={text || "BADGE"}
        />
        <ColorSelect
          label="Màu chữ"
          value={fg}
          onChange={onFgChange}
          presets={[
            "#ffffff", "#f8fafc", "#f1f5f9",
            "#1f2937", "#374151", "#000000",
            "#fef9c3", "#dbeafe", "#fce7f3",
          ]}
          previewText={text || "BADGE"}
        />
      </div>

      {/* Live preview */}
      {text.trim() && (
        <div className="flex items-center gap-3 rounded-lg border border-secondary-100 bg-secondary-50 px-4 py-3">
          <TagIcon className="h-4 w-4 text-secondary-400" />
          <span className="text-sm text-secondary-600">Xem trước:</span>
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold"
            style={{ backgroundColor: bg, color: fg }}
          >
            {text}
          </span>
          <span className="text-xs text-secondary-400">
            Hiển thị kế bên tên danh mục trong menu
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function CategoryFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  parentOptions = [],
  isSaving = false,
}: CategoryFormModalProps) {
  const isEdit = Boolean(initialData && Object.keys(initialData).length > 0);

  // ── Basic info ──────────────────────────────────────────────────────────────
  const [name, setName]               = useState(initialData?.name ?? "");
  const [slug, setSlug]               = useState(initialData?.slug ?? "");
  const [parentId, setParentId]       = useState(initialData?.parentId ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [displayOrder, setDisplayOrder] = useState<number>(initialData?.displayOrder ?? 0);
  const [active, setActive]           = useState(initialData?.active ?? true);

  // ── Node type + filter params ───────────────────────────────────────────────
  const [nodeType, setNodeType]       = useState<DanhMucNodeType>(initialData?.nodeType ?? "category");
  const [filterRows, setFilterRows]   = useState<{ key: string; value: string }[]>(
    paramsToRows(initialData?.filterParams ?? null)
  );

  // ── Badge ───────────────────────────────────────────────────────────────────
  const [badgeText, setBadgeText]     = useState(initialData?.badgeText ?? "");
  const [badgeBg, setBadgeBg]         = useState(initialData?.badgeBg ?? "#ef4444");
  const [badgeFg, setBadgeFg]         = useState(initialData?.badgeFg ?? "#ffffff");
  const hasBadge = badgeText.trim().length > 0;

  // ── Image ────────────────────────────────────────────────────────────────────
  const [categoryImage, setCategoryImage] = useState<ImageFieldValue>(
    initialData?.imageUrl ? imageFieldFromUrl(initialData.imageUrl) : emptyImageField()
  );

  // Sync form when modal opens or initialData changes
  useEffect(() => {
    if (!isOpen) return;
    setName(initialData?.name ?? "");
    setSlug(initialData?.slug ?? "");
    setParentId(initialData?.parentId ?? "");
    setDescription(initialData?.description ?? "");
    setDisplayOrder(initialData?.displayOrder ?? 0);
    setActive(initialData?.active ?? true);
    setNodeType(initialData?.nodeType ?? "category");
    setFilterRows(paramsToRows(initialData?.filterParams ?? null));
    setBadgeText(initialData?.badgeText ?? "");
    setBadgeBg(initialData?.badgeBg ?? "#ef4444");
    setBadgeFg(initialData?.badgeFg ?? "#ffffff");
    setCategoryImage(initialData?.imageUrl ? imageFieldFromUrl(initialData.imageUrl) : emptyImageField());
  }, [isOpen, initialData]);

  async function handleSubmit() {
    await onSave({
      name,
      slug,
      parentId: parentId || undefined,
      description,
      displayOrder,
      active,
      nodeType,
      filterParams: nodeType === "filter" ? rowsToParams(filterRows) : null,
      badgeText: hasBadge ? badgeText.trim() : null,
      badgeBg: hasBadge ? badgeBg : null,
      badgeFg: hasBadge ? badgeFg : null,
      imageUrl: categoryImage.urlFallback ?? null,
      imageAssetId: categoryImage.assetId ?? null,
    });
  }

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={isSaving}>
        Hủy
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        disabled={isSaving || !name.trim()}
        isLoading={isSaving}
      >
        {isSaving ? "Đang lưu…" : "Lưu"}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Sửa danh mục" : "Thêm danh mục"}
      size="2xl"
      footer={footer}
      animated
    >
      <div className="max-h-[72vh] overflow-y-auto px-1">
        <div className="flex flex-col gap-6 p-1">

          {/* ── Section 1: Thông tin cơ bản ──────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <SectionHeading index={1} title="Thông tin cơ bản" />

            <Input
              label="Tên danh mục"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Linh kiện máy tính"
            />

            {/* Slug */}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Input
                  label="Đường dẫn (slug)"
                  className="font-mono"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="vi-du-linh-kien-may-tinh"
                />
              </div>
              <button
                type="button"
                onClick={() => setSlug(generateSlug(name))}
                className="mb-0.5 h-10 shrink-0 rounded-lg border border-secondary-200 bg-secondary-50 px-3 text-xs font-medium text-secondary-600 hover:bg-secondary-100 transition-colors whitespace-nowrap"
              >
                Tự động tạo
              </button>
            </div>

            <Select
              label="Danh mục cha"
              options={parentOptions}
              value={parentId}
              onChange={(v) => setParentId(v as string)}
              placeholder="(Không có — danh mục gốc)"
              clearable
            />

            <Textarea
              label="Mô tả"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn về danh mục này…"
              showCharCount
              maxCharCount={120}
            />

            <ImageField
              label="Ảnh đại diện danh mục"
              value={categoryImage}
              onChange={setCategoryImage}
              aspectRatioHint="1:1 — Kích thước đề nghị 200 × 200 px"
              allowedTypes={["image"]}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Thứ tự hiển thị"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                min={0}
              />
              <div className="flex flex-col justify-end pb-1">
                <Toggle
                  label="Kích hoạt"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                />
              </div>
            </div>
          </div>

          <Divider />

          {/* ── Section 2: Loại node trong megamenu ──────────────────────────── */}
          <div className="flex flex-col gap-4">
            <SectionHeading index={2} title="Loại trong mega menu" />

            <Select
              label="Loại node"
              required
              value={nodeType}
              onChange={(v) => setNodeType(v as DanhMucNodeType)}
              options={NODE_TYPE_OPTIONS}
            />

            {/* Info box for label type */}
            {nodeType === "label" && (
              <div className="rounded-lg border border-secondary-200 bg-secondary-50 px-4 py-3 text-xs text-secondary-500">
                Node nhãn chỉ hiển thị như tiêu đề phân nhóm trong megamenu —
                không có link, người dùng không click được.
              </div>
            )}

            {/* Filter params builder — only for filter type */}
            {nodeType === "filter" && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-secondary-700">
                    Tham số bộ lọc{" "}
                    <span className="font-normal text-secondary-400">(filter_params)</span>
                  </label>
                  {filterRows.length > 0 && (
                    <Badge variant="info" size="sm">{filterRows.length} tham số</Badge>
                  )}
                </div>
                <FilterParamsBuilder rows={filterRows} onChange={setFilterRows} />
              </div>
            )}
          </div>

          <Divider />

          {/* ── Section 3: Badge ──────────────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <SectionHeading index={3} title="Badge danh mục" />
              {hasBadge && (
                <button
                  type="button"
                  onClick={() => setBadgeText("")}
                  className="text-xs text-secondary-400 hover:text-error-500 transition-colors"
                >
                  Xóa badge
                </button>
              )}
            </div>

            <p className="text-xs text-secondary-500">
              Badge hiển thị kế bên tên danh mục (VD: <strong>HOT</strong>, <strong>SALE</strong>).
              Để trống ô "Chữ badge" nếu không muốn dùng badge.
            </p>

            <BadgeConfigurator
              text={badgeText}
              bg={badgeBg}
              fg={badgeFg}
              onTextChange={setBadgeText}
              onBgChange={setBadgeBg}
              onFgChange={setBadgeFg}
            />
          </div>

          {/* Bottom padding */}
          <div className="h-2" />
        </div>
      </div>
    </Modal>
  );
}

// ─── Utility sub-components ───────────────────────────────────────────────────

function SectionHeading({ index, title }: { index: number; title: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-[11px] font-bold text-primary-700">
        {index}
      </span>
      <h4 className="text-sm font-semibold text-secondary-800">{title}</h4>
    </div>
  );
}

function Divider() {
  return <hr className="border-secondary-100" />;
}
