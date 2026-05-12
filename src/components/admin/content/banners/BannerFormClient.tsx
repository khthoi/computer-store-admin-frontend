"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LinkIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { useToast } from "@/src/components/ui/Toast";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Toggle } from "@/src/components/ui/Toggle";
import { ColorSelect } from "@/src/components/ui/ColorSelect";
import { Textarea } from "@/src/components/ui/Textarea";
import { BannerPositionSelector } from "./BannerPositionSelector";
import { BannerPreviewPanel } from "./BannerPreviewPanel";
import { MediaPickerModal } from "@/src/components/admin/content/media/MediaPickerModal";
import {
  createBanner,
  getBannerById,
  getBanners,
  updateBanner,
} from "@/src/services/content.service";
import type {
  BannerFormData,
  BannerPosition,
  BannerSidePlacement,
  MediaFile,
} from "@/src/types/content.types";

type ImageSourceMode = "library" | "url";

export interface BannerFormClientProps {
  bannerId?: string;
  initialPosition?: BannerPosition;
}

const DEFAULT_FORM: BannerFormData = {
  title: "",
  position: "homepage_hero",
  status: "draft",
  isEnabled: false,
  imageUrl: "",
  linkTarget: "_self",
  altText: "",
  caption: "",
  sortOrder: 1,
  badgeColor: "#ef4444",
  badgeTextColor: "#ffffff",
};

const POSITION_LIMIT_HINTS: Partial<Record<BannerPosition, string>> = {
  homepage_hero: "Tối đa 1 banner được kích hoạt trên storefront.",
  homepage_small: "Tối đa 4 banner được kích hoạt trên storefront.",
  side_banner: "Tối đa 2 banner được kích hoạt trên storefront, mỗi bên trái/phải chỉ 1 banner.",
};

function deriveBannerAltText(file: MediaFile, fallbackTitle?: string): string {
  return (
    file.altText?.trim() ||
    file.caption?.trim() ||
    file.originalName?.trim() ||
    file.filename?.trim() ||
    fallbackTitle?.trim() ||
    ""
  );
}

function deriveBannerCaption(file: MediaFile): string {
  return file.caption?.trim() || "";
}

function SourceModeTabs({
  label,
  mode,
  onChange,
}: {
  label: string;
  mode: ImageSourceMode;
  onChange: (mode: ImageSourceMode) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-secondary-700">{label}</span>
      <div className="inline-flex w-fit rounded-xl border border-secondary-200 bg-secondary-50 p-1">
        <button
          type="button"
          onClick={() => onChange("library")}
          className={[
            "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            mode === "library" ? "bg-white text-primary-600 shadow-sm" : "text-secondary-600 hover:bg-white/80",
          ].join(" ")}
        >
          Chọn từ thư viện
        </button>
        <button
          type="button"
          onClick={() => onChange("url")}
          className={[
            "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            mode === "url" ? "bg-white text-primary-600 shadow-sm" : "text-secondary-600 hover:bg-white/80",
          ].join(" ")}
        >
          Dán URL thủ công
        </button>
      </div>
    </div>
  );
}

function ImagePickerButton({
  url,
  label,
  required,
  aspectClass,
  onClick,
  onClear,
  error,
}: {
  url?: string;
  label: string;
  required?: boolean;
  aspectClass: string;
  onClick: () => void;
  onClear: () => void;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-secondary-700">
        {label}
        {required ? <span aria-hidden="true" className="ml-0.5 select-none text-error-600">*</span> : null}
      </label>
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onClick();
          }
        }}
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
      {error ? <p className="text-xs text-error-600">{error}</p> : null}
      {url ? (
        <button type="button" onClick={onClear} className="self-start text-xs text-error-500 hover:text-error-700">
          Xóa ảnh
        </button>
      ) : null}
    </div>
  );
}

function SidePlacementSelector({
  value,
  onChange,
  error,
  occupiedPlacements,
}: {
  value?: BannerSidePlacement;
  onChange: (value: BannerSidePlacement) => void;
  error?: string;
  occupiedPlacements: BannerSidePlacement[];
}) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium text-secondary-700">
          Vị trí side banner
          <span aria-hidden="true" className="ml-0.5 select-none text-error-600">*</span>
        </p>
        <p className="mt-1 text-xs text-secondary-500">
          Chọn rõ banner này hiển thị ở cột trái hay cột phải trên storefront.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { id: "left", label: "Trái" },
          { id: "right", label: "Phải" },
        ].map((option) => {
          const isDisabled =
            occupiedPlacements.includes(option.id as BannerSidePlacement) && value !== option.id;

          return (
            <label
              key={option.id}
              className={[
                "flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
                isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                value === option.id
                  ? "border-primary-500 bg-primary-50"
                  : "border-secondary-200 bg-white hover:border-secondary-300",
              ].join(" ")}
            >
              <input
                type="radio"
                name="sidePlacement"
                value={option.id}
                checked={value === option.id}
                disabled={isDisabled}
                onChange={() => onChange(option.id as BannerSidePlacement)}
                className="h-4 w-4 border-secondary-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-secondary-800">{option.label}</span>
              {isDisabled ? (
                <span className="ml-auto text-xs text-secondary-500">Đã có banner</span>
              ) : null}
            </label>
          );
        })}
      </div>

      {occupiedPlacements.length > 0 ? (
        <p className="text-xs text-secondary-500">
          Bên đã có side banner sẽ bị khóa để tránh trùng vị trí hiển thị trên storefront.
        </p>
      ) : null}

      {error ? <p className="text-xs text-error-600">{error}</p> : null}
    </div>
  );
}

export function BannerFormClient({ bannerId, initialPosition }: BannerFormClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const isEdit = Boolean(bannerId);

  const [form, setForm] = useState<BannerFormData>(() => ({
    ...DEFAULT_FORM,
    position: initialPosition ?? DEFAULT_FORM.position,
  }));
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof BannerFormData, string>>>({});
  const [pickerTarget, setPickerTarget] = useState<"imageUrl" | "mobileImageUrl" | null>(null);
  const [mainImageMode, setMainImageMode] = useState<ImageSourceMode>("library");
  const [mobileImageMode, setMobileImageMode] = useState<ImageSourceMode>("library");
  const [occupiedPlacements, setOccupiedPlacements] = useState<BannerSidePlacement[]>([]);

  const isSmall = form.position === "homepage_small";
  const isSide = form.position === "side_banner";
  const isPromo = form.position === "promotions_banner";
  const hasOverlay = !isSmall && !isSide;
  const hasCta = !isSmall && !isSide;
  const canEnable = form.status === "active";

  useEffect(() => {
    if (!bannerId) return;

    getBannerById(bannerId).then((banner) => {
      if (!banner) return;

      setForm({
        title: banner.title,
        position: banner.position,
        status: banner.status,
        isEnabled: banner.isEnabled,
        imageUrl: banner.imageUrl,
        mobileImageUrl: banner.mobileImageUrl,
        sidePlacement: banner.sidePlacement,
        linkUrl: banner.linkUrl,
        linkTarget: banner.linkTarget,
        altText: banner.altText,
        caption: banner.caption ?? "",
        overlayText: banner.overlayText,
        overlaySubtext: banner.overlaySubtext,
        ctaLabel: banner.ctaLabel,
        ctaUrl: banner.ctaUrl,
        badge: banner.badge,
        badgeColor: banner.badgeColor ?? "#ef4444",
        badgeTextColor: banner.badgeTextColor ?? "#ffffff",
        sortOrder: banner.sortOrder,
      });
      setIsLoading(false);
    });
  }, [bannerId]);

  useEffect(() => {
    if (isEdit || !initialPosition) {
      return;
    }

    setForm((prev) => (
      prev.position === initialPosition
        ? prev
        : { ...prev, position: initialPosition }
    ));
  }, [initialPosition, isEdit]);

  useEffect(() => {
    let cancelled = false;

    if (form.position !== "side_banner") {
      setOccupiedPlacements([]);
      return;
    }

    getBanners({
      position: ["side_banner"],
      pageSize: 50,
    }).then((result) => {
      if (cancelled) {
        return;
      }

      const placements = result.data
        .filter((banner) => banner.id !== bannerId)
        .map((banner) => banner.sidePlacement)
        .filter((placement): placement is BannerSidePlacement => placement === "left" || placement === "right");

      setOccupiedPlacements(Array.from(new Set(placements)));
    }).catch(() => {
      if (!cancelled) {
        setOccupiedPlacements([]);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [bannerId, form.position]);

  useEffect(() => {
    if (form.position === "side_banner" || !form.sidePlacement) {
      return;
    }

    const timer = window.setTimeout(() => {
      setForm((prev) => ({ ...prev, sidePlacement: undefined }));
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [form.position, form.sidePlacement]);

  useEffect(() => {
    if (form.status === "active" || !form.isEnabled) {
      return;
    }

    const timer = window.setTimeout(() => {
      setForm((prev) => ({ ...prev, isEnabled: false }));
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [form.isEnabled, form.status]);

  function setField<K extends keyof BannerFormData>(key: K, value: BannerFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  const activationHint = useMemo(() => {
    const limitHint = POSITION_LIMIT_HINTS[form.position];
    const base = canEnable
      ? "Banner được bật sẽ lên storefront nếu vẫn còn trong giới hạn của vị trí này."
      : "Cần chuyển trạng thái sang Hoạt động trước khi kích hoạt banner.";
    return limitHint ? `${base} ${limitHint}` : base;
  }, [canEnable, form.position]);

  const handleSave = useCallback(async () => {
    const nextErrors: typeof errors = {};

    if (!form.title.trim()) nextErrors.title = "Tiêu đề không được để trống";
    if (!form.imageUrl.trim()) nextErrors.imageUrl = "Vui lòng chọn ảnh hoặc nhập URL ảnh chính";
    if (mainImageMode === "url" && !form.altText.trim()) {
      nextErrors.altText = "Ảnh dùng URL thủ công cần có alt text";
    }
    if (form.position === "side_banner" && !form.sidePlacement) {
      nextErrors.sidePlacement = "Vui lòng chọn bên trái hoặc bên phải";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload: BannerFormData = {
      ...form,
      sidePlacement: form.position === "side_banner" ? form.sidePlacement : undefined,
    };

    setIsSaving(true);
    try {
      if (isEdit && bannerId) {
        await updateBanner(bannerId, payload);
        showToast("Đã lưu thay đổi banner", "success");
      } else {
        await createBanner(payload);
        showToast("Tạo banner thành công", "success");
        router.push("/content/banners");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Có lỗi xảy ra, vui lòng thử lại";
      showToast(message, "error");
    } finally {
      setIsSaving(false);
    }
  }, [bannerId, form, isEdit, mainImageMode, router, showToast]);

  const aspectPickerClass =
    form.position === "side_banner" ? "h-32" :
    form.position === "homepage_small" ? "aspect-video max-h-28" :
    "aspect-[32/10] max-h-40";

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-5 lg:col-span-2">
        <section className="space-y-4 rounded-xl border border-secondary-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-secondary-700">Thông tin cơ bản</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-secondary-500">Thứ tự:</span>
            <Badge variant="primary" size="sm">{form.sortOrder}</Badge>
          </div>
          <Input
            label="Tiêu đề banner"
            required
            value={form.title}
            onChange={(event) => setField("title", event.target.value)}
            placeholder="Tên nội bộ để phân biệt các banner"
            errorMessage={errors.title}
          />
          <div>
            <p className="mb-2 text-sm font-medium text-secondary-700">
              Vị trí hiển thị
              <span aria-hidden="true" className="ml-0.5 select-none text-error-600">*</span>
            </p>
            <BannerPositionSelector value={form.position} onChange={(position) => setField("position", position)} />
          </div>
          {isSide ? (
            <SidePlacementSelector
              value={form.sidePlacement}
              onChange={(value) => setField("sidePlacement", value)}
              error={errors.sidePlacement}
              occupiedPlacements={occupiedPlacements}
            />
          ) : null}
        </section>

        <section className="space-y-5 rounded-xl border border-secondary-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-secondary-700">Hình ảnh</h2>

          <SourceModeTabs label="Ảnh chính" mode={mainImageMode} onChange={setMainImageMode} />
          {mainImageMode === "library" ? (
            <>
              <ImagePickerButton
                url={form.imageUrl}
                label="Ảnh chính"
                required
                aspectClass={aspectPickerClass}
                onClick={() => setPickerTarget("imageUrl")}
                onClear={() => setField("imageUrl", "")}
                error={errors.imageUrl}
              />
              <p className="text-xs text-secondary-500">
                Khi chọn từ media library, banner sẽ tự dùng alt text và caption của asset đã chọn.
              </p>
            </>
          ) : (
            <div className="space-y-4 rounded-xl border border-dashed border-secondary-200 bg-secondary-50 p-4">
              <Input
                label="URL ảnh chính"
                required
                value={form.imageUrl}
                onChange={(event) => setField("imageUrl", event.target.value)}
                placeholder="https://example.com/banner-desktop.jpg"
                prefixIcon={<LinkIcon className="h-4 w-4" />}
                errorMessage={errors.imageUrl}
              />
            </div>
          )}

          {!isSide ? (
            <>
              <SourceModeTabs label="Ảnh mobile" mode={mobileImageMode} onChange={setMobileImageMode} />
              {mobileImageMode === "library" ? (
                <ImagePickerButton
                  url={form.mobileImageUrl}
                  label="Ảnh mobile (tùy chọn)"
                  aspectClass="h-20"
                  onClick={() => setPickerTarget("mobileImageUrl")}
                  onClear={() => setField("mobileImageUrl", undefined)}
                />
              ) : (
                <div className="rounded-xl border border-dashed border-secondary-200 bg-secondary-50 p-4">
                  <Input
                    label="URL ảnh mobile"
                    value={form.mobileImageUrl ?? ""}
                    onChange={(event) => setField("mobileImageUrl", event.target.value || undefined)}
                    placeholder="https://example.com/banner-mobile.jpg"
                    prefixIcon={<LinkIcon className="h-4 w-4" />}
                  />
                  <p className="mt-2 text-xs text-secondary-500">
                    Ảnh mobile dùng chung alt text và caption với ảnh chính của banner này.
                  </p>
                </div>
              )}
            </>
          ) : null}

          <div className="space-y-4 rounded-xl border border-secondary-200 bg-white p-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-secondary-700">Metadata dùng chung cho desktop và mobile</h3>
              <p className="text-xs text-secondary-500">
                Alt text và caption bên dưới được áp dụng chung cho cả ảnh desktop và ảnh mobile của banner này.
              </p>
            </div>
            <Input
              label="Alt text"
              required={mainImageMode === "url"}
              value={form.altText}
              onChange={(event) => setField("altText", event.target.value)}
              placeholder="Mô tả ngắn cho ảnh banner"
              helperText={
                mainImageMode === "library"
                  ? "Nếu chọn từ media library, giá trị này được tự điền từ metadata của asset và bạn vẫn có thể sửa lại."
                  : "Bắt buộc khi dùng URL thủ công cho ảnh chính."
              }
              errorMessage={errors.altText}
            />
            <Textarea
              label="Caption"
              value={form.caption ?? ""}
              onChange={(event) => setField("caption", event.target.value)}
              placeholder="Chú thích hoặc mô tả bổ sung cho ảnh"
              rows={3}
              autoResize
              showCharCount
              maxCharCount={300}

            />
          </div>
        </section>

        {hasOverlay ? (
          <section className="space-y-4 rounded-xl border border-secondary-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-secondary-700">Nội dung overlay</h2>
            <Input
              label="Tiêu đề lớn"
              value={form.overlayText ?? ""}
              onChange={(event) => setField("overlayText", event.target.value)}
              placeholder="Dòng text chính hiển thị trên ảnh"
            />
            <Input
              label="Mô tả phụ"
              value={form.overlaySubtext ?? ""}
              onChange={(event) => setField("overlaySubtext", event.target.value)}
              placeholder="Dòng phụ bên dưới tiêu đề"
            />
          </section>
        ) : null}

        {hasCta ? (
          <section className="space-y-4 rounded-xl border border-secondary-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-secondary-700">Nút CTA</h2>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Nhãn nút"
                value={form.ctaLabel ?? ""}
                onChange={(event) => setField("ctaLabel", event.target.value)}
                placeholder="Mua ngay, Xem thêm..."
              />
              <Input
                label="URL nút CTA"
                value={form.ctaUrl ?? ""}
                onChange={(event) => setField("ctaUrl", event.target.value)}
                placeholder="/promotions hoặc URL đầy đủ"
              />
            </div>
          </section>
        ) : null}

        {isPromo ? (
          <section className="space-y-4 rounded-xl border border-secondary-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-secondary-700">Badge và layout</h2>
            <div className="space-y-3">
              <Input
                label="Nội dung badge"
                value={form.badge ?? ""}
                onChange={(event) => setField("badge", event.target.value)}
                placeholder="HOT, SALE 50%, NEW, FLASH..."
                helperText="Để trống nếu không cần badge"
              />
              {form.badge ? (
                <div className="grid grid-cols-2 gap-4">
                  <ColorSelect
                    label="Màu nền badge"
                    value={form.badgeColor ?? "#ef4444"}
                    onChange={(color) => setField("badgeColor", color)}
                    previewText={form.badge}
                  />
                  <ColorSelect
                    label="Màu chữ badge"
                    value={form.badgeTextColor ?? "#ffffff"}
                    onChange={(color) => setField("badgeTextColor", color)}
                    previewText={form.badge}
                    presets={[
                      "#ffffff", "#f8fafc", "#f1f5f9",
                      "#1f2937", "#374151", "#000000",
                      "#fef9c3", "#dbeafe", "#fce7f3",
                      "#fef3c7", "#dcfce7", "#ede9fe",
                    ]}
                  />
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        <section className="space-y-3 rounded-xl border border-secondary-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-secondary-700">
            {isPromo ? "Liên kết banner" : "Liên kết"}
          </h2>
          {isPromo ? (
            <p className="text-xs text-secondary-400">
              Link khi click vào vùng ảnh, tách riêng với nút CTA nếu có.
            </p>
          ) : null}
          <Input
            label={isPromo ? "URL banner" : "URL khi nhấn banner"}
            value={form.linkUrl ?? ""}
            onChange={(event) => setField("linkUrl", event.target.value)}
            placeholder={isPromo ? "/promotions/campaign" : "/products hoặc https://example.com"}
          />
          <div className="flex items-center gap-3">
            <Toggle
              checked={form.linkTarget === "_blank"}
              onChange={(event) => setField("linkTarget", event.target.checked ? "_blank" : "_self")}
            />
            <span className="text-sm text-secondary-700">Mở trong tab mới</span>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-secondary-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-secondary-700">Trạng thái hiển thị</h2>
          <Toggle
            checked={form.status === "active"}
            onChange={(event) => setField("status", event.target.checked ? "active" : "draft")}
            label="Trạng thái hoạt động"
            description={
              form.status === "active"
                ? "Banner đang ở trạng thái hoạt động và có thể được bật lên storefront."
                : "Banner đang ở trạng thái nháp và sẽ không thể kích hoạt trên storefront."
            }
          />
          <Toggle
            checked={form.isEnabled}
            disabled={!canEnable}
            onChange={(event) => setField("isEnabled", event.target.checked)}
            label="Kích hoạt trên storefront"
            description={activationHint}
          />
        </section>

        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={() => router.push("/content/banners")}>Hủy</Button>
          <Button onClick={handleSave} isLoading={isSaving}>
            {isEdit ? "Lưu thay đổi" : "Tạo banner"}
          </Button>
        </div>
      </div>

      <BannerPreviewPanel data={form} />

      <MediaPickerModal
        open={Boolean(pickerTarget)}
        onClose={() => setPickerTarget(null)}
        allowedTypes={["image"]}
        title="Chọn ảnh banner"
        onPick={(file) => {
          if (pickerTarget) {
            setField(pickerTarget, file.url);
            if (pickerTarget === "imageUrl") {
              setMainImageMode("library");
              setField("altText", deriveBannerAltText(file, form.title));
              setField("caption", deriveBannerCaption(file));
            } else {
              setMobileImageMode("library");
            }
          }
          setPickerTarget(null);
        }}
      />
    </div>
  );
}
