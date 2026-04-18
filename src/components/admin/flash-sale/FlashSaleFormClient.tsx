"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { Button }    from "@/src/components/ui/Button";
import { Input }     from "@/src/components/ui/Input";
import { Textarea }  from "@/src/components/ui/Textarea";
import { Select }    from "@/src/components/ui/Select";
import { DateInput } from "@/src/components/ui/DateInput";
import { ImageField, emptyImageField, imageFieldFromUrl } from "@/src/components/ui/ImageField";
import type { ImageFieldValue } from "@/src/components/ui/ImageField";
import { useToast }  from "@/src/components/ui/Toast";
import { createFlashSale, updateFlashSale } from "@/src/services/flash-sale.service";
import { FlashSaleItemsEditor } from "./FlashSaleItemsEditor";
import { FlashSaleStatusBadge } from "./FlashSaleStatusBadge";
import { formatDateTime } from "@/src/lib/format";
import type {
  FlashSale,
  FlashSaleStatus,
  FlashSaleItemPayload,
} from "@/src/types/flash-sale.types";

// ─── Constants ────────────────────────────────────────────────────────────────

const ONE_HOUR_MS = 60 * 60 * 1000;
const MAX_DURATION_MS = 72 * ONE_HOUR_MS;

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "nhap",        label: "Nháp" },
  { value: "sap_dien_ra", label: "Sắp diễn ra" },
  { value: "da_ket_thuc", label: "Đã kết thúc" },
  { value: "huy",         label: "Đã hủy" },
];

// Which statuses can be selected when editing, based on current status
function getAllowedStatuses(current?: FlashSaleStatus): string[] {
  if (!current || current === "nhap")       return ["nhap", "sap_dien_ra"];
  if (current === "sap_dien_ra")            return ["nhap", "sap_dien_ra", "huy"];
  return [current]; // dang_dien_ra / da_ket_thuc / huy — readonly
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm space-y-4">
      <h2 className="text-sm font-semibold text-secondary-900">{title}</h2>
      {children}
    </div>
  );
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-secondary-400">{label}</p>
      <p className="mt-0.5 text-xs text-secondary-700">{children}</p>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface FlashSaleFormClientProps {
  initialData?: FlashSale;
}

// ─── Validation ───────────────────────────────────────────────────────────────

interface FormErrors {
  ten?:       string;
  batDau?:    string;
  ketThuc?:   string;
  items?:     string;
  itemFlash?: Record<number, string>;
}

function validate(
  ten: string,
  batDau: string,
  ketThuc: string,
  items: FlashSaleItemPayload[]
): FormErrors {
  const errs: FormErrors = {};

  if (!ten.trim())                     errs.ten = "Tên sự kiện không được để trống.";
  else if (ten.trim().length < 3)      errs.ten = "Tên phải có ít nhất 3 ký tự.";
  else if (ten.trim().length > 300)    errs.ten = "Tên không được vượt quá 300 ký tự.";

  if (!batDau)  errs.batDau  = "Vui lòng chọn thời gian bắt đầu.";
  if (!ketThuc) errs.ketThuc = "Vui lòng chọn thời gian kết thúc.";

  if (batDau && ketThuc) {
    const start = new Date(batDau).getTime();
    const end   = new Date(ketThuc).getTime();
    if (!isNaN(start) && !isNaN(end) && end - start < ONE_HOUR_MS) {
      errs.ketThuc = "Thời gian kết thúc phải sau thời gian bắt đầu ít nhất 1 giờ.";
    }
  }

  if (items.length === 0) errs.items = "Cần ít nhất 1 phiên bản sản phẩm.";

  const itemFlashErrors: Record<number, string> = {};
  items.forEach((item, idx) => {
    if (item.giaFlash <= 0)                        itemFlashErrors[idx] = "Giá flash phải lớn hơn 0.";
    else if (item.giaFlash >= item.giaGocSnapshot) itemFlashErrors[idx] = "Giá flash phải nhỏ hơn giá gốc.";
  });
  if (Object.keys(itemFlashErrors).length > 0) errs.itemFlash = itemFlashErrors;

  return errs;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FlashSaleFormClient({ initialData }: FlashSaleFormClientProps) {
  const router        = useRouter();
  const { showToast } = useToast();
  const isEdit        = !!initialData;

  const isReadonlyStatus =
    initialData?.trangThai === "dang_dien_ra" ||
    initialData?.trangThai === "da_ket_thuc"  ||
    initialData?.trangThai === "huy";

  const allowedStatuses = getAllowedStatuses(initialData?.trangThai);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [ten,            setTen]            = useState(initialData?.ten ?? "");
  const [moTa,           setMoTa]           = useState(initialData?.moTa ?? "");
  const [trangThai,      setTrangThai]      = useState<FlashSaleStatus>(
    initialData?.trangThai ?? "nhap"
  );
  const [batDau,         setBatDau]         = useState(
    initialData?.batDau
      ? new Date(initialData.batDau).toISOString().slice(0, 16)
      : ""
  );
  const [ketThuc,        setKetThuc]        = useState(
    initialData?.ketThuc
      ? new Date(initialData.ketThuc).toISOString().slice(0, 16)
      : ""
  );
  const [bannerTitle, setBannerTitle] = useState(initialData?.bannerTitle ?? "");
  const [bannerAlt,   setBannerAlt]   = useState(initialData?.bannerAlt ?? "");
  const [bannerImage, setBannerImage] = useState<ImageFieldValue>(
    initialData?.bannerImageUrl
      ? imageFieldFromUrl(initialData.bannerImageUrl)
      : emptyImageField()
  );
  const [items,          setItems]          = useState<FlashSaleItemPayload[]>(
    initialData?.items.map((i) => ({
      phienBanId:     i.phienBanId,
      sanPhamId:      i.sanPhamId,
      giaFlash:       i.giaFlash,
      giaGocSnapshot: i.giaGocSnapshot,
      giaGoc:         i.giaGoc,
      soLuongGioiHan: i.soLuongGioiHan,
      thuTuHienThi:   i.thuTuHienThi,
      tenPhienBan:    i.tenPhienBan,
      skuSnapshot:    i.skuSnapshot,
      sanPhamTen:     i.sanPhamTen,
      hinhAnh:        i.hinhAnh,
    })) ?? []
  );

  const [errors,    setErrors]    = useState<FormErrors>({});
  const [isSaving,  setIsSaving]  = useState(false);

  // ── Derived warnings ───────────────────────────────────────────────────────
  const longDuration = useMemo(() => {
    if (!batDau || !ketThuc) return false;
    const diff = new Date(ketThuc).getTime() - new Date(batDau).getTime();
    return diff > MAX_DURATION_MS;
  }, [batDau, ketThuc]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const errs = validate(ten, batDau, ketThuc, items);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});

    setIsSaving(true);
    try {
      const payload = {
        ten:            ten.trim(),
        moTa:           moTa.trim() || undefined,
        trangThai,
        batDau,
        ketThuc,
        bannerTitle:    bannerTitle.trim()               || undefined,
        bannerImageUrl: bannerImage.displayUrl?.trim()   || undefined,
        bannerAssetId:  bannerImage.assetId              ?? undefined,
        bannerAlt:      bannerAlt.trim()                 || undefined,
        items,
      };

      if (isEdit && initialData) {
        await updateFlashSale(initialData.flashSaleId, payload);
        showToast("Flash sale đã được cập nhật.", "success");
      } else {
        await createFlashSale(payload);
        showToast("Flash sale đã được tạo thành công.", "success");
      }
      router.push("/promotions/flash-sales");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Có lỗi xảy ra.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col lg:flex-row gap-6 p-6">

        {/* ── Left column ───────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2">
            <Link
              href="/promotions/flash-sales"
              className="inline-flex items-center gap-1.5 text-sm text-secondary-500 hover:text-secondary-800 transition-colors"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5" />
              Flash Sales
            </Link>
            <span className="text-secondary-300">/</span>
            <span className="text-sm text-secondary-700">
              {isEdit ? initialData.ten : "Tạo mới"}
            </span>
          </div>

          {/* Readonly warning */}
          {isReadonlyStatus && (
            <div className="flex items-start gap-3 rounded-xl border border-warning-200 bg-warning-50 px-4 py-3">
              <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-warning-600 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-warning-800">
                Flash sale đang ở trạng thái <strong>{initialData?.trangThai}</strong> — không thể chỉnh sửa.
              </p>
            </div>
          )}

          {/* Section 1: Basic info */}
          <Section title="Thông tin cơ bản">
            <Input
              label="Tên sự kiện"
              placeholder="VD: Flash Sale Cuối Tuần — Giảm đến 40%"
              value={ten}
              onChange={(e) => { setTen(e.target.value); setErrors((p) => ({ ...p, ten: undefined })); }}
              errorMessage={errors.ten}
              disabled={isReadonlyStatus}
            />
            <Textarea
              label="Mô tả (tuỳ chọn)"
              placeholder="Mô tả nội bộ về sự kiện này…"
              rows={3}
              value={moTa}
              onChange={(e) => setMoTa(e.target.value)}
              disabled={isReadonlyStatus}
            />
          </Section>

          {/* Section 2: Schedule */}
          <Section title="Lịch flash sale">
            <div className="grid grid-cols-2 gap-4">
              <DateInput
                label="Bắt đầu"
                required
                showTime
                value={batDau}
                onChange={(v) => {
                  setBatDau(v);
                  setErrors((p) => ({ ...p, batDau: undefined, ketThuc: undefined }));
                }}
                errorMessage={errors.batDau}
                disabled={isReadonlyStatus}
              />
              <DateInput
                label="Kết thúc"
                required
                showTime
                value={ketThuc}
                onChange={(v) => {
                  setKetThuc(v);
                  setErrors((p) => ({ ...p, ketThuc: undefined }));
                }}
                errorMessage={errors.ketThuc}
                disabled={isReadonlyStatus}
              />
            </div>

            {longDuration && !errors.ketThuc && (
              <div className="flex items-center gap-2 text-xs text-warning-700 bg-warning-50 border border-warning-200 rounded-lg px-3 py-2">
                <ExclamationTriangleIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                Thời gian flash sale vượt quá 72 giờ — hãy kiểm tra lại.
              </div>
            )}
          </Section>

          {/* Section 3: Banner */}
          <Section title="Banner (tuỳ chọn)">
            <ImageField
              label="Hình ảnh banner"
              value={bannerImage}
              onChange={setBannerImage}
              aspectRatioHint="16:5 – Kích thước đề nghị 1600 × 500 px"
              allowedTypes={["image"]}
              disabled={isReadonlyStatus}
            />

            {/* Title + alt text — shown once an image is present or when editing */}
            <Input
              label="Tiêu đề banner"
              placeholder="VD: FLASH SALE — Chỉ hôm nay!"
              value={bannerTitle}
              onChange={(e) => setBannerTitle(e.target.value)}
              disabled={isReadonlyStatus}
            />
            <Input
              label="Alt text (tuỳ chọn)"
              placeholder="Mô tả ngắn về hình ảnh để hỗ trợ accessibility / SEO"
              value={bannerAlt}
              onChange={(e) => setBannerAlt(e.target.value)}
              disabled={isReadonlyStatus}
            />
          </Section>

          {/* Section 4: Items */}
          <Section title="Phiên bản sản phẩm flash sale">
            <FlashSaleItemsEditor
              items={items}
              onChange={(updated) => {
                setItems(updated);
                setErrors((p) => ({ ...p, items: undefined, itemFlash: undefined }));
              }}
              errors={errors.itemFlash
                ? Object.fromEntries(
                    Object.entries(errors.itemFlash).map(([k, v]) => [k, { giaFlash: v }])
                  )
                : {}
              }
              showSold={isEdit}
              soldMap={
                initialData
                  ? Object.fromEntries(
                      initialData.items.map((i) => [i.phienBanId, i.soLuongDaBan])
                    )
                  : {}
              }
            />
            {errors.items && (
              <p className="text-xs text-error-600 mt-1">{errors.items}</p>
            )}
          </Section>
        </div>

        {/* ── Right column ──────────────────────────────────────────────── */}
        <div className="w-full lg:w-72 shrink-0 space-y-4">

          {/* Status panel */}
          <div className="rounded-2xl border border-secondary-100 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-secondary-900">Trạng thái</h3>

            {isReadonlyStatus ? (
              <div className="flex items-center gap-2">
                <FlashSaleStatusBadge status={trangThai} size="md" />
                <span className="text-xs text-secondary-400">(chỉ đọc)</span>
              </div>
            ) : (
              <Select
                options={STATUS_OPTIONS.filter((o) => allowedStatuses.includes(o.value))}
                value={trangThai}
                onChange={(v) => setTrangThai(v as FlashSaleStatus)}
              />
            )}

            {/* Metadata */}
            {isEdit && initialData && (
              <div className="space-y-2 pt-2 border-t border-secondary-100">
                <MetaRow label="Người tạo">{initialData.createdBy}</MetaRow>
                <MetaRow label="Ngày tạo">{formatDateTime(initialData.createdAt)}</MetaRow>
                <MetaRow label="Cập nhật">{formatDateTime(initialData.updatedAt)}</MetaRow>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="space-y-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              isLoading={isSaving}
              disabled={isReadonlyStatus}
            >
              {isEdit ? "Lưu thay đổi" : "Tạo Flash Sale"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="md"
              className="w-full"
              onClick={() => router.push("/promotions/flash-sales")}
              disabled={isSaving}
            >
              Hủy
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
