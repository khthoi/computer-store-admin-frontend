"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PhotoIcon,
  MapPinIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Select } from "@/src/components/ui/Select";
import { DateInput } from "@/src/components/ui/DateInput";
import { Toggle } from "@/src/components/ui/Toggle";
import { ColorSelect } from "@/src/components/ui/ColorSelect";
import { BannerPositionSelector } from "./BannerPositionSelector";
import { BannerPreviewPanel } from "./BannerPreviewPanel";
import { MediaPickerModal } from "@/src/components/admin/content/media/MediaPickerModal";
import { getBannerById, createBanner, updateBanner } from "@/src/services/content.service";
import type { Banner, BannerFormData } from "@/src/types/content.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BannerFormClientProps {
  bannerId?: string;
}

// ─── Default ─────────────────────────────────────────────────────────────────

const DEFAULT_FORM: BannerFormData = {
  title: "",
  position: "homepage_hero",
  status: "draft",
  imageUrl: "",
  linkTarget: "_self",
  altText: "",
  sortOrder: 1,
  startDate: null,
  endDate: null,
  badgeColor: "#ef4444",
  badgeTextColor: "#ffffff",
};

// ─── Image picker button ───────────────────────────────────────────────────────

function ImagePickerButton({
  url, label, aspectClass, onClick, onClear, error,
}: {
  url?: string; label: string; aspectClass: string;
  onClick: () => void; onClear: () => void; error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-secondary-700">{label}</label>
      <div
        role="button" tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => e.key === "Enter" && onClick()}
        className={[
          "relative flex cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors",
          aspectClass,
          error ? "border-error-400" : "border-secondary-200 hover:border-primary-400 hover:bg-primary-50",
          url ? "bg-secondary-50" : "",
        ].join(" ")}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-secondary-400">
            <PhotoIcon className="h-8 w-8" />
            <span className="text-xs">Chọn ảnh từ thư viện</span>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-error-600">{error}</p>}
      {url && (
        <button type="button" onClick={onClear} className="self-start text-xs text-error-500 hover:text-error-700">
          Xóa ảnh
        </button>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BannerFormClient({ bannerId }: BannerFormClientProps) {
  const router = useRouter();
  const isEdit = Boolean(bannerId);

  const [form, setForm] = useState<BannerFormData>(DEFAULT_FORM);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof BannerFormData, string>>>({});
  const [pickerTarget, setPickerTarget] = useState<"imageUrl" | "mobileImageUrl" | null>(null);

  // Position context booleans
  const isSmall = form.position === "homepage_small";
  const isSide = form.position === "side_banner";
  const isPromo = form.position === "promotions_banner";
  const hasOverlay = !isSmall && !isSide;
  const hasCta = !isSmall && !isSide;

  useEffect(() => {
    if (!bannerId) return;
    getBannerById(bannerId).then((banner) => {
      if (banner) {
        setForm({
          title: banner.title, position: banner.position, status: banner.status,
          imageUrl: banner.imageUrl, mobileImageUrl: banner.mobileImageUrl,
          linkUrl: banner.linkUrl, linkTarget: banner.linkTarget, altText: banner.altText,
          overlayText: banner.overlayText, overlaySubtext: banner.overlaySubtext,
          ctaLabel: banner.ctaLabel, ctaUrl: banner.ctaUrl,
          badge: banner.badge, badgeColor: banner.badgeColor ?? "#ef4444",
          badgeTextColor: banner.badgeTextColor ?? "#ffffff",
          sortOrder: banner.sortOrder, startDate: banner.startDate, endDate: banner.endDate,
        });
      }
      setIsLoading(false);
    });
  }, [bannerId]);

  function set<K extends keyof BannerFormData>(key: K, value: BannerFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const errs: typeof errors = {};
    if (!form.title.trim()) errs.title = "Tiêu đề không được để trống";
    if (!form.imageUrl) errs.imageUrl = "Vui lòng chọn ảnh banner";
    if (!form.altText.trim()) errs.altText = "Alt text không được để trống";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  const handleSave = useCallback(async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      if (isEdit && bannerId) { await updateBanner(bannerId, form); }
      else { await createBanner(form); }
      router.push("/content/banners");
    } finally { setIsSaving(false); }
  }, [form, isEdit, bannerId, router]);

  const aspectPickerClass =
    form.position === "side_banner" ? "h-32" :
    form.position === "homepage_small" ? "aspect-video max-h-28" :
    "aspect-[32/10] max-h-40";

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" /></div>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* ── Main form ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-5 lg:col-span-2">

        {/* 1. Basic info */}
        <section className="rounded-xl border border-secondary-200 bg-white p-5 space-y-4">
          <h2 className="text-sm font-semibold text-secondary-700">Thông tin cơ bản</h2>
          <Input
            label="Tiêu đề banner *"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Tên nội bộ để phân biệt các banner"
            errorMessage={errors.title}
          />
          <div>
            <p className="mb-2 text-sm font-medium text-secondary-700">Vị trí hiển thị *</p>
            <BannerPositionSelector value={form.position} onChange={(pos) => set("position", pos)} />
          </div>
        </section>

        {/* 2. Images */}
        <section className="rounded-xl border border-secondary-200 bg-white p-5 space-y-4">
          <h2 className="text-sm font-semibold text-secondary-700">Hình ảnh</h2>
          <ImagePickerButton
            url={form.imageUrl}
            label="Ảnh chính *"
            aspectClass={aspectPickerClass}
            onClick={() => setPickerTarget("imageUrl")}
            onClear={() => set("imageUrl", "")}
            error={errors.imageUrl}
          />
          {!isSide && (
            <ImagePickerButton
              url={form.mobileImageUrl}
              label="Ảnh mobile (tuỳ chọn)"
              aspectClass="h-20"
              onClick={() => setPickerTarget("mobileImageUrl")}
              onClear={() => set("mobileImageUrl", undefined)}
            />
          )}
          <Input
            label="Alt text *"
            value={form.altText}
            onChange={(e) => set("altText", e.target.value)}
            placeholder="Mô tả ảnh cho SEO và accessibility"
            errorMessage={errors.altText}
          />
        </section>

        {/* 3. Overlay content (hero, slider, promotions) */}
        {hasOverlay && (
          <section className="rounded-xl border border-secondary-200 bg-white p-5 space-y-4">
            <h2 className="text-sm font-semibold text-secondary-700">Nội dung overlay</h2>
            <Input
              label="Tiêu đề lớn"
              value={form.overlayText ?? ""}
              onChange={(e) => set("overlayText", e.target.value)}
              placeholder="Dòng text chính hiển thị trên ảnh"
            />
            <Input
              label="Mô tả phụ"
              value={form.overlaySubtext ?? ""}
              onChange={(e) => set("overlaySubtext", e.target.value)}
              placeholder="Dòng phụ bên dưới tiêu đề"
            />
          </section>
        )}

        {/* 4. CTA (hero, slider, promotions) */}
        {hasCta && (
          <section className="rounded-xl border border-secondary-200 bg-white p-5 space-y-4">
            <h2 className="text-sm font-semibold text-secondary-700">Nút CTA</h2>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Nhãn nút"
                value={form.ctaLabel ?? ""}
                onChange={(e) => set("ctaLabel", e.target.value)}
                placeholder="Mua ngay, Xem thêm..."
              />
              <Input
                label="URL nút CTA"
                value={form.ctaUrl ?? ""}
                onChange={(e) => set("ctaUrl", e.target.value)}
                placeholder="/promotions hoặc URL đầy đủ"
              />
            </div>
          </section>
        )}

        {/* 5. Badge + Layout span (promotions only) */}
        {isPromo && (
          <section className="rounded-xl border border-secondary-200 bg-white p-5 space-y-4">
            <h2 className="text-sm font-semibold text-secondary-700">Badge & Layout</h2>

            {/* Badge */}
            <div className="space-y-3">
              <Input
                label="Nội dung badge"
                value={form.badge ?? ""}
                onChange={(e) => set("badge", e.target.value)}
                placeholder="HOT, SALE 50%, NEW, ⚡ FLASH..."
                helperText="Để trống nếu không cần badge"
              />
              {form.badge && (
                <div className="grid grid-cols-2 gap-4">
                  <ColorSelect
                    label="Màu nền badge"
                    value={form.badgeColor ?? "#ef4444"}
                    onChange={(c) => set("badgeColor", c)}
                    previewText={form.badge}
                  />
                  <ColorSelect
                    label="Màu chữ badge"
                    value={form.badgeTextColor ?? "#ffffff"}
                    onChange={(c) => set("badgeTextColor", c)}
                    previewText={form.badge}
                    presets={[
                      "#ffffff", "#f8fafc", "#f1f5f9",
                      "#1f2937", "#374151", "#000000",
                      "#fef9c3", "#dbeafe", "#fce7f3",
                      "#fef3c7", "#dcfce7", "#ede9fe",
                    ]}
                  />
                </div>
              )}
            </div>

          </section>
        )}

        {/* 6. Link (all except promotions which has ctaUrl) */}
        {!isPromo && (
          <section className="rounded-xl border border-secondary-200 bg-white p-5 space-y-3">
            <h2 className="text-sm font-semibold text-secondary-700">Liên kết</h2>
            <Input
              label="URL khi nhấn banner"
              value={form.linkUrl ?? ""}
              onChange={(e) => set("linkUrl", e.target.value)}
              placeholder="/products hoặc https://example.com"
            />
            <div className="flex items-center gap-3">
              <Toggle
                checked={form.linkTarget === "_blank"}
                onChange={(e) => set("linkTarget", e.target.checked ? "_blank" : "_self")}
              />
              <span className="text-sm text-secondary-700">Mở trong tab mới</span>
            </div>
          </section>
        )}

        {/* 6b. Link for promotions (separate from CTA) */}
        {isPromo && (
          <section className="rounded-xl border border-secondary-200 bg-white p-5 space-y-3">
            <h2 className="text-sm font-semibold text-secondary-700">Liên kết banner</h2>
            <p className="text-xs text-secondary-400">Link khi click vào vùng ảnh (ngoài nút CTA)</p>
            <Input
              label="URL banner"
              value={form.linkUrl ?? ""}
              onChange={(e) => set("linkUrl", e.target.value)}
              placeholder="/promotions/campaign"
            />
            <div className="flex items-center gap-3">
              <Toggle
                checked={form.linkTarget === "_blank"}
                onChange={(e) => set("linkTarget", e.target.checked ? "_blank" : "_self")}
              />
              <span className="text-sm text-secondary-700">Mở trong tab mới</span>
            </div>
          </section>
        )}

        {/* 7. Schedule & status */}
        <section className="rounded-xl border border-secondary-200 bg-white p-5 space-y-4">
          <h2 className="text-sm font-semibold text-secondary-700">Lên lịch & trạng thái</h2>
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
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Trạng thái"
              value={form.status}
              onChange={(v) => set("status", v as BannerFormData["status"])}
              options={[
                { value: "draft",     label: "Nháp" },
                { value: "active",    label: "Đang hiển thị" },
                { value: "scheduled", label: "Lên lịch" },
                { value: "ended",     label: "Kết thúc" },
              ]}
            />
            <Input
              type="number"
              label="Thứ tự hiển thị"
              value={String(form.sortOrder)}
              onChange={(e) => set("sortOrder", Number(e.target.value))}
              min="1"
              helperText={isSmall ? "Vị trí 1–4 trong hàng 4 ô" : undefined}
            />
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={() => router.push("/content/banners")}>Hủy</Button>
          <Button onClick={handleSave} isLoading={isSaving}>
            {isEdit ? "Lưu thay đổi" : "Tạo banner"}
          </Button>
        </div>
      </div>

      {/* ── Sidebar preview ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-secondary-200 bg-white p-5">
          <BannerPreviewPanel data={form} />
        </div>

        {/* Small banner position note */}
        {isSmall && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 space-y-1">
            <p className="flex items-center gap-1.5 font-semibold">
              <MapPinIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Banner nhỏ trang chủ
            </p>
            <p>4 banner được xếp ngang theo <strong>thứ tự (1→4)</strong>. Ảnh không có overlay hay nút CTA.</p>
          </div>
        )}

        {isPromo && (
          <div className="rounded-xl border border-primary-200 bg-primary-50 p-4 text-xs text-primary-800 space-y-1">
            <p className="flex items-center gap-1.5 font-semibold">
              <SparklesIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Banner trang Khuyến mãi
            </p>
            <p>Có thể kéo thả để sắp xếp thứ tự và layout tại trang danh sách banners.</p>
          </div>
        )}
      </div>

      {/* Media picker */}
      <MediaPickerModal
        open={Boolean(pickerTarget)}
        onClose={() => setPickerTarget(null)}
        allowedTypes={["image"]}
        title="Chọn ảnh banner"
        onPick={(file) => {
          if (pickerTarget) { set(pickerTarget, file.url); }
          setPickerTarget(null);
        }}
      />
    </div>
  );
}
