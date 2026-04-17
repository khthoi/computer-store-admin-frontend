"use client";

import { useState, useRef } from "react";
import {
  PhotoIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
  FolderOpenIcon,
  LinkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { MediaPickerModal } from "@/src/components/admin/content/media/MediaPickerModal";
import { MediaUploadModal } from "@/src/components/admin/content/media/MediaUploadModal";
import type { MediaFile, MediaFileType } from "@/src/types/content.types";

// ─── Value type ───────────────────────────────────────────────────────────────

/**
 * Dual-field value — mirrors the ERD dual-field pattern:
 * - `assetId`    → FK to media_asset (managed via Cloudinary)
 * - `urlFallback`→ raw URL string (external link / paste)
 *
 * Display priority: assetId.url → urlFallback → nothing
 */
export interface ImageFieldValue {
  /** ID of the MediaFile / media_asset record. null = no managed asset. */
  assetId: string | null;
  /** Direct URL string used as fallback when assetId is null. */
  urlFallback: string | null;
  /** Resolved display URL — kept in sync automatically. */
  displayUrl: string | null;
}

export function emptyImageField(): ImageFieldValue {
  return { assetId: null, urlFallback: null, displayUrl: null };
}

export function imageFieldFromUrl(url: string): ImageFieldValue {
  return { assetId: null, urlFallback: url, displayUrl: url };
}

export function imageFieldFromAsset(file: MediaFile): ImageFieldValue {
  return { assetId: file.id, urlFallback: null, displayUrl: file.url };
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ImageFieldProps {
  label?: string;
  value: ImageFieldValue;
  onChange: (value: ImageFieldValue) => void;
  /** Aspect-ratio hint shown in placeholder and preview badge. */
  aspectRatioHint?: string;
  /** Restrict media picker to these file types. Default: ["image"]. */
  allowedTypes?: MediaFileType[];
  /** Folder ID pre-selected in MediaPickerModal. */
  folderId?: string | null;
  required?: boolean;
  helperText?: string;
  errorMessage?: string;
  disabled?: boolean;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ImageField — dual-field image input following the ERD dual-field pattern.
 *
 * Three ways to set an image:
 * 1. **Thư viện** — opens MediaPickerModal → sets `assetId` + `displayUrl`
 * 2. **Tải lên**  — opens MediaUploadModal → after upload sets `assetId`
 * 3. **Dán URL**  — text input → sets `urlFallback` (assetId stays null)
 *
 * ```tsx
 * const [cover, setCover] = useState<ImageFieldValue>(
 *   existingUrl ? imageFieldFromUrl(existingUrl) : emptyImageField()
 * );
 *
 * <ImageField
 *   label="Ảnh bìa"
 *   value={cover}
 *   onChange={setCover}
 *   aspectRatioHint="16:9 – 1600 × 900 px"
 * />
 * ```
 */
export function ImageField({
  label,
  value,
  onChange,
  aspectRatioHint = "Kích thước đề nghị 1600 × 900 px",
  allowedTypes = ["image"],
  folderId = null,
  required,
  helperText,
  errorMessage,
  disabled = false,
  className = "",
}: ImageFieldProps) {
  const [pickerOpen, setPickerOpen]   = useState(false);
  const [uploadOpen, setUploadOpen]   = useState(false);
  const [urlDraft,   setUrlDraft]     = useState(value.urlFallback ?? "");
  const [urlMode,    setUrlMode]      = useState(false);
  const urlInputRef = useRef<HTMLInputElement>(null);

  const hasError = Boolean(errorMessage);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handlePickFromLibrary(file: MediaFile) {
    onChange(imageFieldFromAsset(file));
    setUrlDraft("");
    setUrlMode(false);
  }

  function handleUploaded(files: MediaFile[]) {
    if (files.length === 0) return;
    onChange(imageFieldFromAsset(files[0]));
    setUrlDraft("");
    setUrlMode(false);
  }

  function handleApplyUrl() {
    const trimmed = urlDraft.trim();
    if (!trimmed) return;
    onChange({ assetId: null, urlFallback: trimmed, displayUrl: trimmed });
    setUrlMode(false);
  }

  function handleRemove() {
    onChange(emptyImageField());
    setUrlDraft("");
    setUrlMode(false);
  }

  function openUrlMode() {
    setUrlMode(true);
    setUrlDraft(value.urlFallback ?? "");
    setTimeout(() => urlInputRef.current?.focus(), 50);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={["w-full", className].filter(Boolean).join(" ")}>
      {/* Label */}
      {label && (
        <p className="mb-1.5 select-none text-sm font-medium text-secondary-700">
          {label}
          {required && (
            <span aria-hidden="true" className="ml-0.5 select-none text-error-600">*</span>
          )}
        </p>
      )}

      {/* ── Preview / Placeholder ────────────────────────────────────────── */}
      {value.displayUrl ? (
        <div className="relative overflow-hidden rounded-xl border border-secondary-200 bg-secondary-50 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value.displayUrl}
            alt="Xem trước ảnh"
            className="w-full max-h-52 object-cover"
          />

          {/* Source badge */}
          <div className="absolute top-2 left-2 pointer-events-none">
            {value.assetId ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-primary-600/90 px-2 py-0.5 text-[10px] font-semibold text-white">
                <FolderOpenIcon className="h-3 w-3" aria-hidden />
                Thư viện
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md bg-secondary-700/80 px-2 py-0.5 text-[10px] font-semibold text-white">
                <LinkIcon className="h-3 w-3" aria-hidden />
                URL
              </span>
            )}
          </div>

          {/* Aspect ratio badge */}
          <div className="absolute bottom-2 right-2 pointer-events-none">
            <span className="rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white/80">
              {aspectRatioHint}
            </span>
          </div>

          {/* Hover actions */}
          {!disabled && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-secondary-800 shadow-sm hover:bg-secondary-50 transition-colors"
              >
                <FolderOpenIcon className="h-3.5 w-3.5" aria-hidden />
                Thư viện
              </button>
              <button
                type="button"
                onClick={openUrlMode}
                className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-secondary-800 shadow-sm hover:bg-secondary-50 transition-colors"
              >
                <LinkIcon className="h-3.5 w-3.5" aria-hidden />
                Dán URL
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="flex items-center gap-1.5 rounded-lg bg-error-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-error-700 transition-colors"
              >
                <XMarkIcon className="h-3.5 w-3.5" aria-hidden />
                Xóa
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ── Empty placeholder ────────────────────────────────────────────── */
        <div className={[
          "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-8 text-center",
          hasError
            ? "border-error-300 bg-error-50"
            : "border-secondary-300 bg-secondary-50",
        ].join(" ")}>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-100">
            <PhotoIcon className="h-6 w-6 text-secondary-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-secondary-600">Chưa có ảnh</p>
            <p className="mt-0.5 text-xs text-secondary-400">{aspectRatioHint}</p>
          </div>
        </div>
      )}

      {/* ── Action buttons ───────────────────────────────────────────────── */}
      {!disabled && (
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-secondary-200 bg-white px-3 py-1.5 text-xs font-medium text-secondary-700 shadow-sm transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
          >
            <FolderOpenIcon className="h-3.5 w-3.5" aria-hidden />
            Chọn từ thư viện
          </button>

          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-secondary-200 bg-white px-3 py-1.5 text-xs font-medium text-secondary-700 shadow-sm transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
          >
            <ArrowUpTrayIcon className="h-3.5 w-3.5" aria-hidden />
            Tải ảnh lên mới
          </button>

          <button
            type="button"
            onClick={openUrlMode}
            className="inline-flex items-center gap-1.5 rounded-lg border border-secondary-200 bg-white px-3 py-1.5 text-xs font-medium text-secondary-700 shadow-sm transition-colors hover:border-secondary-300 hover:bg-secondary-50"
          >
            <LinkIcon className="h-3.5 w-3.5" aria-hidden />
            Dán URL
          </button>

          {value.displayUrl && (
            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex items-center gap-1.5 rounded-lg border border-error-200 bg-white px-3 py-1.5 text-xs font-medium text-error-600 shadow-sm transition-colors hover:bg-error-50"
            >
              <XMarkIcon className="h-3.5 w-3.5" aria-hidden />
              Xóa ảnh
            </button>
          )}
        </div>
      )}

      {/* ── URL paste input ──────────────────────────────────────────────── */}
      {urlMode && (
        <div className="mt-2.5 flex items-center gap-2">
          <div className="relative flex-1">
            <LinkIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-secondary-400" />
            <input
              ref={urlInputRef}
              type="url"
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); handleApplyUrl(); }
                if (e.key === "Escape") setUrlMode(false);
              }}
              placeholder="https://example.com/image.jpg"
              className="w-full rounded-lg border border-secondary-200 bg-white py-1.5 pl-8 pr-3 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/15"
            />
          </div>
          <button
            type="button"
            onClick={handleApplyUrl}
            disabled={!urlDraft.trim()}
            className="inline-flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-40"
          >
            <CheckIcon className="h-3.5 w-3.5" aria-hidden />
            Áp dụng
          </button>
          <button
            type="button"
            onClick={() => setUrlMode(false)}
            className="rounded-lg border border-secondary-200 bg-white px-3 py-1.5 text-xs font-medium text-secondary-600 transition-colors hover:bg-secondary-50"
          >
            Huỷ
          </button>
        </div>
      )}

      {/* Helper / Error */}
      {hasError && (
        <p role="alert" className="mt-1.5 text-xs text-error-600">{errorMessage}</p>
      )}
      {!hasError && helperText && (
        <p className="mt-1.5 text-xs text-secondary-500">{helperText}</p>
      )}

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        allowedTypes={allowedTypes}
        title="Chọn ảnh từ thư viện"
        onPick={handlePickFromLibrary}
      />

      <MediaUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        folderId={folderId}
        onUploaded={handleUploaded}
      />
    </div>
  );
}
