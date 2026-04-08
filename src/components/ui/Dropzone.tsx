"use client";

import { useCallback, useRef, useState } from "react";
import {
  PhotoIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";

// ─── Public types ──────────────────────────────────────────────────────────────

export interface DropzoneProps {
  /**
   * Initial image URL shown as preview (e.g. existing banner when editing).
   * Once the user drops / selects a file the local object URL takes over.
   */
  initialUrl?: string;
  /**
   * Called with the selected `File` object, or `null` when the user removes
   * the image. Use this to upload the file to your backend.
   */
  onFileChange?: (file: File | null) => void;
  /**
   * Called with the preview URL — either a fresh `URL.createObjectURL(…)`
   * for newly selected files or an empty string when removed.
   * Use this to keep URL-based state in sync.
   */
  onPreviewChange?: (url: string) => void;
  /**
   * Aspect-ratio hint displayed to guide the user toward the correct image
   * dimensions. Shown both in the empty dropzone and as an overlay on the preview.
   * @default "16:5 – Kích thước đề nghị 1600 × 500 px"
   */
  aspectRatioHint?: string;
  /** Maximum file size in MB (default 2). */
  maxSizeMB?: number;
  disabled?: boolean;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Dropzone — drag-and-drop / click-to-select image upload with live preview.
 *
 * - Accepts any image file (PNG, JPG, WEBP, GIF, …) up to `maxSizeMB`.
 * - Validates file type and size; shows an inline error on rejection.
 * - On acceptance creates a local object URL for immediate preview.
 * - Preview mode shows hover buttons to **replace** or **remove** the image.
 * - `onFileChange` + `onPreviewChange` callbacks let the parent manage state.
 *
 * ```tsx
 * const [bannerFile,    setBannerFile]    = useState<File | null>(null);
 * const [bannerPreview, setBannerPreview] = useState(existingUrl);
 *
 * <Dropzone
 *   initialUrl={existingUrl}
 *   onFileChange={setBannerFile}
 *   onPreviewChange={setBannerPreview}
 *   aspectRatioHint="16:5 – 1600 × 500 px"
 * />
 * ```
 */
export function Dropzone({
  initialUrl,
  onFileChange,
  onPreviewChange,
  aspectRatioHint = "16:5 – Kích thước đề nghị 1600 × 500 px",
  maxSizeMB       = 2,
  disabled,
  className,
}: DropzoneProps) {
  const [preview,    setPreview]    = useState<string>(initialUrl ?? "");
  const [isDragging, setIsDragging] = useState(false);
  const [fileError,  setFileError]  = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── File processor ────────────────────────────────────────────────────────
  const processFile = useCallback((file: File) => {
    setFileError(null);
    if (!file.type.startsWith("image/")) {
      setFileError("Chỉ chấp nhận file hình ảnh (PNG, JPG, WEBP…).");
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setFileError(`Kích thước file không được vượt quá ${maxSizeMB} MB.`);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    onFileChange?.(file);
    onPreviewChange?.(url);
  }, [maxSizeMB, onFileChange, onPreviewChange]);

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const handleDragOver  = (e: React.DragEvent) => { e.preventDefault(); if (!disabled) setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop      = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  // ── Input change ──────────────────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset so the same file can be re-selected
    e.target.value = "";
  };

  // ── Remove ────────────────────────────────────────────────────────────────
  const handleRemove = () => {
    setPreview("");
    setFileError(null);
    onFileChange?.(null);
    onPreviewChange?.("");
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={className}>
      {preview ? (
        /* ── Preview mode ──────────────────────────────────────────────────── */
        <div className="relative overflow-hidden rounded-xl border border-secondary-200 bg-secondary-50 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Banner preview"
            className="w-full max-h-52 object-cover"
          />

          {/* Hover overlay — replace / remove buttons */}
          {!disabled && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-secondary-800 shadow-sm hover:bg-secondary-50 transition-colors"
              >
                <ArrowUpTrayIcon className="h-3.5 w-3.5" aria-hidden />
                Thay ảnh
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

          {/* Aspect-ratio badge overlay */}
          <div className="absolute bottom-2 right-2 rounded-md bg-black/50 px-2 py-0.5 pointer-events-none">
            <span className="text-[10px] font-medium text-white/80">{aspectRatioHint}</span>
          </div>
        </div>
      ) : (
        /* ── Drop zone ────────────────────────────────────────────────────── */
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label="Tải lên hình ảnh banner"
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={(e) => ["Enter", " "].includes(e.key) && !disabled && inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={[
            "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed",
            "px-6 py-10 text-center transition-colors select-none outline-none",
            "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1",
            disabled
              ? "cursor-not-allowed opacity-60 border-secondary-200 bg-secondary-50"
              : isDragging
                ? "cursor-copy border-primary-400 bg-primary-50"
                : "cursor-pointer border-secondary-300 bg-secondary-50 hover:border-primary-400 hover:bg-primary-50/40",
          ].join(" ")}
        >
          {/* Icon */}
          <div className={[
            "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
            isDragging ? "bg-primary-100" : "bg-secondary-100",
          ].join(" ")}>
            <PhotoIcon className={["h-6 w-6", isDragging ? "text-primary-500" : "text-secondary-400"].join(" ")} />
          </div>

          {/* Labels */}
          <div>
            <p className="text-sm font-medium text-secondary-700">
              Kéo thả hoặc{" "}
              <span className={isDragging ? "text-primary-700" : "text-primary-600"}>
                nhấn để chọn ảnh
              </span>
            </p>
            <p className="mt-0.5 text-xs text-secondary-400">
              PNG, JPG, WEBP — Tối đa {maxSizeMB} MB
            </p>
          </div>

          {/* Aspect ratio hint pill */}
          <div className="flex items-center gap-1.5 rounded-lg border border-primary-200 bg-primary-50 px-3 py-1.5">
            <span className="text-[11px] font-semibold text-primary-700">Tỉ lệ đề nghị:</span>
            <span className="text-[11px] text-primary-600">{aspectRatioHint}</span>
          </div>
        </div>
      )}

      {/* File error */}
      {fileError && (
        <p className="mt-1.5 text-xs text-error-600" role="alert">{fileError}</p>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="sr-only"
        disabled={disabled}
        tabIndex={-1}
      />
    </div>
  );
}
