"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { Select } from "@/src/components/ui/Select";
import { Toggle } from "@/src/components/ui/Toggle";
import { Button } from "@/src/components/ui/Button";
import { MediaUploadPanel, type MediaImage } from "@/src/components/admin/shared/MediaUploadPanel";

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
  { value: "US", label: "Hoa Kỳ" },
  { value: "TW", label: "Đài Loan" },
  { value: "KR", label: "Hàn Quốc" },
  { value: "JP", label: "Nhật Bản" },
  { value: "CN", label: "Trung Quốc" },
  { value: "DE", label: "Đức" },
  { value: "OTHER", label: "Khác" },
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
  const [countryOfOrigin, setCountryOfOrigin] = useState(initialData?.countryOfOrigin ?? "");
  const [active, setActive] = useState(initialData?.active ?? true);
  const [logoImages, setLogoImages] = useState<MediaImage[]>(
    initialData?.logoUrl
      ? [{ id: "logo-existing", url: initialData.logoUrl, alt: initialData.name ?? "Logo" }]
      : []
  );

  // Sync form when initialData changes
  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name ?? "");
      setSlug(initialData?.slug ?? "");
      setDescription(initialData?.description ?? "");
      setWebsiteUrl(initialData?.websiteUrl ?? "");
      setCountryOfOrigin(initialData?.countryOfOrigin ?? "");
      setActive(initialData?.active ?? true);
      setLogoImages(
        initialData?.logoUrl
          ? [{ id: "logo-existing", url: initialData.logoUrl, alt: initialData.name ?? "Logo" }]
          : []
      );
    }
  }, [isOpen, initialData]);

  function handleAutoSlug() {
    setSlug(generateSlug(name));
  }

  function handleLogoAdd(files: File[]) {
    const file = files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLogoImages([{ id: `logo-${Date.now()}`, url, alt: name || "Logo" }]);
  }

  function handleLogoRemove(_id: string) {
    setLogoImages([]);
  }

  async function handleSubmit() {
    await onSave({
      name,
      slug,
      description,
      websiteUrl,
      countryOfOrigin,
      active,
      logoUrl: logoImages[0]?.url,
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
      size="lg"
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
        <div>
          <p className="mb-2 block text-sm font-medium text-secondary-700">Logo thương hiệu</p>
          <MediaUploadPanel
            images={logoImages}
            onAdd={handleLogoAdd}
            onRemove={handleLogoRemove}
            maxImages={1}
          />
        </div>

        {/* Description */}
        <Textarea
          label="Mô tả"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mô tả ngắn về thương hiệu…"
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
          value={countryOfOrigin}
          onChange={(v) => setCountryOfOrigin(v as string)}
          placeholder="Chọn quốc gia…"
          clearable
        />

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
