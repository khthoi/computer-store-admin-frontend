"use client";

import { useState } from "react";
import {
  PlusIcon,
  FolderOpenIcon,
  ArrowUpTrayIcon,
  LinkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { Select } from "@/src/components/ui/Select";
import { Input } from "@/src/components/ui/Input";
import { MediaPickerModal } from "@/src/components/admin/content/media/MediaPickerModal";
import { MediaUploadModal } from "@/src/components/admin/content/media/MediaUploadModal";
import type { MediaFile } from "@/src/types/content.types";
import type { MediaType, VariantMedia } from "@/src/types/product.types";

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_OPTIONS: { value: MediaType; label: string }[] = [
  { value: "main",    label: "Main"    },
  { value: "gallery", label: "Gallery" },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface MediaUploaderProps {
  onAdd: (item: Omit<VariantMedia, "id" | "variantId">) => void;
  /** Folder ID pre-selected in the upload/picker modals. */
  folderId?: string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MediaUploader({ onAdd, folderId = null }: MediaUploaderProps) {
  const [type,       setType]       = useState<MediaType>("gallery");
  const [altText,    setAltText]    = useState("");
  const [urlMode,    setUrlMode]    = useState(false);
  const [urlDraft,   setUrlDraft]   = useState("");
  const [urlError,   setUrlError]   = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  // ── Commit helpers ────────────────────────────────────────────────────────

  function commitFromLibrary(file: MediaFile) {
    onAdd({
      url:     file.url,
      assetId: file.id,
      type,
      altText: altText.trim() || file.altText || file.filename,
      order:   0,
    });
    setAltText("");
    setPickerOpen(false);
  }

  function commitFromUpload(files: MediaFile[]) {
    files.forEach((file) =>
      onAdd({
        url:     file.url,
        assetId: file.id,
        type,
        altText: altText.trim() || file.altText || file.filename,
        order:   0,
      })
    );
    setAltText("");
    setUploadOpen(false);
  }

  function commitFromUrl() {
    const trimmed = urlDraft.trim();
    if (!trimmed) { setUrlError("URL không được để trống."); return; }
    setUrlError("");
    onAdd({ url: trimmed, assetId: null, type, altText: altText.trim() || undefined, order: 0 });
    setUrlDraft("");
    setAltText("");
    setUrlMode(false);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="rounded-xl border border-dashed border-secondary-300 bg-secondary-50 p-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-secondary-500">
        Thêm ảnh
      </p>

      {/* ── Source buttons ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => { setUrlMode(false); setPickerOpen(true); }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-secondary-200 bg-white px-3 py-1.5 text-xs font-medium text-secondary-700 shadow-sm transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
        >
          <FolderOpenIcon className="h-3.5 w-3.5" aria-hidden />
          Chọn từ thư viện
        </button>

        <button
          type="button"
          onClick={() => { setUrlMode(false); setUploadOpen(true); }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-secondary-200 bg-white px-3 py-1.5 text-xs font-medium text-secondary-700 shadow-sm transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
        >
          <ArrowUpTrayIcon className="h-3.5 w-3.5" aria-hidden />
          Tải ảnh lên mới
        </button>

        <button
          type="button"
          onClick={() => setUrlMode((v) => !v)}
          className={[
            "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium shadow-sm transition-colors",
            urlMode
              ? "border-primary-300 bg-primary-50 text-primary-700"
              : "border-secondary-200 bg-white text-secondary-700 hover:border-secondary-300 hover:bg-secondary-50",
          ].join(" ")}
        >
          <LinkIcon className="h-3.5 w-3.5" aria-hidden />
          Dán URL
        </button>
      </div>

      {/* ── URL input (collapsible) ───────────────────────────────────────── */}
      {urlMode && (
        <div className="flex items-start gap-2 pt-1">
          <div className="flex-1">
            <Input
              label="URL ảnh"
              value={urlDraft}
              onChange={(e) => { setUrlDraft(e.target.value); setUrlError(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commitFromUrl(); } }}
              placeholder="https://example.com/image.jpg"
              errorMessage={urlError}
              size="sm"
            />
          </div>
          <button
            type="button"
            onClick={commitFromUrl}
            disabled={!urlDraft.trim()}
            className="mt-6 inline-flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-40"
          >
            <CheckIcon className="h-3.5 w-3.5" aria-hidden />
            Thêm
          </button>
        </div>
      )}

      {/* ── Type + Alt text ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Loại ảnh"
          options={TYPE_OPTIONS}
          value={type}
          onChange={(v) => setType(v as MediaType)}
          size="sm"
        />
        <Input
          label="Alt text"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          placeholder="Mô tả ảnh…"
          size="sm"
        />
      </div>

      {/* Hint */}
      <p className="text-[11px] text-secondary-400">
        Alt text và loại ảnh sẽ được áp dụng cho ảnh tiếp theo bạn chọn.
      </p>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        allowedTypes={["image"]}
        title="Chọn ảnh sản phẩm"
        onPick={commitFromLibrary}
      />

      <MediaUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        folderId={folderId}
        onUploaded={commitFromUpload}
      />
    </div>
  );
}
