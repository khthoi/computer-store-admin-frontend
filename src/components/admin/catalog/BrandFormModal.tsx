"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { Select } from "@/src/components/ui/Select";
import { Toggle } from "@/src/components/ui/Toggle";
import { Button } from "@/src/components/ui/Button";
import { ImageField, emptyImageField, imageFieldFromUrl } from "@/src/components/ui/ImageField";
import type { ImageFieldValue } from "@/src/components/ui/ImageField";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BrandFormData {
  name: string;
  slug: string;
  description: string;
  websiteUrl: string;
  countryOfOrigin: string;
  active: boolean;
  logoUrl?: string;
}

interface BrandFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BrandFormData) => void | Promise<void>;
  initialData?: Partial<BrandFormData>;
  isSaving?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COUNTRY_OPTIONS = [
  { value: "VN", label: "Việt Nam" },
  // Đông Á
  { value: "CN", label: "Trung Quốc" },
  { value: "TW", label: "Đài Loan" },
  { value: "JP", label: "Nhật Bản" },
  { value: "KR", label: "Hàn Quốc" },
  { value: "HK", label: "Hồng Kông" },
  // Đông Nam Á
  { value: "SG", label: "Singapore" },
  { value: "MY", label: "Malaysia" },
  { value: "TH", label: "Thái Lan" },
  { value: "ID", label: "Indonesia" },
  { value: "PH", label: "Philippines" },
  // Bắc Mỹ
  { value: "US", label: "Hoa Kỳ" },
  { value: "CA", label: "Canada" },
  // Châu Âu
  { value: "DE", label: "Đức" },
  { value: "NL", label: "Hà Lan" },
  { value: "GB", label: "Anh" },
  { value: "FR", label: "Pháp" },
  { value: "SE", label: "Thụy Điển" },
  { value: "FI", label: "Phần Lan" },
  { value: "IT", label: "Ý" },
  { value: "CH", label: "Thụy Sĩ" },
  { value: "CZ", label: "Cộng hoà Séc" },
  { value: "PL", label: "Ba Lan" },
  // Nam Á & Châu Đại Dương
  { value: "IN", label: "Ấn Độ" },
  { value: "AU", label: "Australia" },
  { value: "OTHER", label: "Khác" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const KNOWN_CODES = new Set(
  COUNTRY_OPTIONS.filter((o) => o.value !== "OTHER").map((o) => o.value),
);

function parseCountry(value: string): { code: string; custom: string } {
  if (!value) return { code: "", custom: "" };
  if (KNOWN_CODES.has(value)) return { code: value, custom: "" };
  return { code: "OTHER", custom: value };
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BrandFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  isSaving = false,
}: BrandFormModalProps) {
  const isEdit = Boolean(initialData && Object.keys(initialData).length > 0);

  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(initialData?.websiteUrl ?? "");
  const initialCountry = parseCountry(initialData?.countryOfOrigin ?? "");
  const [countryCode, setCountryCode] = useState(initialCountry.code);
  const [customCountry, setCustomCountry] = useState(initialCountry.custom);
  const [active, setActive] = useState(initialData?.active ?? true);
  const [logoImage, setLogoImage] = useState<ImageFieldValue>(
    initialData?.logoUrl ? imageFieldFromUrl(initialData.logoUrl) : emptyImageField()
  );

  // Sync form when initialData changes
  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name ?? "");
      setSlug(initialData?.slug ?? "");
      setDescription(initialData?.description ?? "");
      setWebsiteUrl(initialData?.websiteUrl ?? "");
      const parsed = parseCountry(initialData?.countryOfOrigin ?? "");
      setCountryCode(parsed.code);
      setCustomCountry(parsed.custom);
      setActive(initialData?.active ?? true);
      setLogoImage(initialData?.logoUrl ? imageFieldFromUrl(initialData.logoUrl) : emptyImageField());
    }
  }, [isOpen, initialData]);

  function handleAutoSlug() {
    setSlug(generateSlug(name));
  }

  async function handleSubmit() {
    await onSave({
      name,
      slug,
      description,
      websiteUrl,
      countryOfOrigin: countryCode === "OTHER" ? customCountry.trim() : countryCode,
      active,
      logoUrl: logoImage.displayUrl ?? undefined,
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
      title={isEdit ? "Sửa thương hiệu" : "Thêm thương hiệu"}
      size="2xl"
      footer={footer}
      animated
    >
      <div className="flex flex-col gap-4">
        {/* Name */}
        <Input
          label="Tên thương hiệu"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ví dụ: ASUS, MSI, Corsair…"
        />

        {/* Slug */}
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              label="Đường dẫn (slug)"
              className="font-mono"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="asus"
            />
          </div>
          <button
            type="button"
            onClick={handleAutoSlug}
            className="mb-0.5 h-10 shrink-0 rounded-lg border border-secondary-200 bg-secondary-50 px-3 text-xs font-medium text-secondary-600 hover:bg-secondary-100 transition-colors whitespace-nowrap"
          >
            Tự động tạo
          </button>
        </div>

        {/* Logo upload */}
        <ImageField
          label="Logo thương hiệu"
          value={logoImage}
          onChange={setLogoImage}
          aspectRatioHint="1:1 — Kích thước đề nghị 200 × 200 px (PNG/SVG nền trong)"
          allowedTypes={["image"]}
        />

        {/* Description */}
        <Textarea
          label="Mô tả"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mô tả ngắn về thương hiệu…"
          maxCharCount={250}
          showCharCount
        />

        {/* Website URL */}
        <Input
          label="Website"
          type="url"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="https://example.com"
        />

        {/* Country of origin */}
        <Select
          label="Quốc gia xuất xứ"
          options={COUNTRY_OPTIONS}
          value={countryCode}
          onChange={(v) => {
            const code = v as string;
            setCountryCode(code);
            if (code !== "OTHER") setCustomCountry("");
          }}
          placeholder="Chọn quốc gia…"
          searchable
          clearable
        />
        {countryCode === "OTHER" && (
          <Input
            label="Tên quốc gia"
            required
            value={customCountry}
            onChange={(e) => setCustomCountry(e.target.value)}
            placeholder="Nhập tên quốc gia…"
            autoFocus
          />
        )}

        {/* Active toggle */}
        <div className="pt-1">
          <Toggle
            label="Kích hoạt"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
        </div>
      </div>
    </Modal>
  );
}
