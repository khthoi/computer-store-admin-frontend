"use client";

import { useState } from "react";
import {
  TrashIcon,
  ArrowDownTrayIcon,
  ClipboardDocumentIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { Drawer } from "@/src/components/ui/Drawer";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { Image } from "@/src/components/ui/Image";
import { Badge } from "@/src/components/ui/Badge";
import type { MediaFile } from "@/src/types/content.types";
import { updateMediaFile, deleteMediaFile } from "@/src/services/content.service";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Non-image preview ────────────────────────────────────────────────────────

function FileTypePreview({ file }: { file: MediaFile }) {
  const emoji =
    file.fileType === "video" ? "🎬"
    : file.fileType === "audio" ? "🎵"
    : "📄";
  return (
    <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-lg bg-secondary-100 text-secondary-500">
      <span className="text-4xl">{emoji}</span>
      <p className="text-sm">{file.mimeType}</p>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MediaDetailDrawerProps {
  file: MediaFile | null;
  onClose: () => void;
  onDeleted?: (id: string) => void;
  onUpdated?: (file: MediaFile) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MediaDetailDrawer({ file, onClose, onDeleted, onUpdated }: MediaDetailDrawerProps) {
  const [altText, setAltText] = useState(file?.altText ?? "");
  const [caption, setCaption] = useState(file?.caption ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync local fields when the selected file changes
  if (file && altText !== (file.altText ?? "") && !isSaving) {
    setAltText(file.altText ?? "");
    setCaption(file.caption ?? "");
  }

  async function handleSave() {
    if (!file) return;
    setIsSaving(true);
    try {
      const updated = await updateMediaFile(file.id, { altText, caption });
      onUpdated?.(updated);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!file) return;
    if (!confirm(`Xóa file "${file.filename}"? Thao tác này không thể hoàn tác.`)) return;
    setIsDeleting(true);
    try {
      await deleteMediaFile(file.id);
      onDeleted?.(file.id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  }

  function handleCopyUrl() {
    if (!file) return;
    navigator.clipboard.writeText(file.url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownload() {
    if (!file) return;
    const a = document.createElement("a");
    a.href = file.url;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <Drawer
      isOpen={Boolean(file)}
      onClose={onClose}
      title={file?.filename ?? ""}
      size="md"
    >
      {file && (
        <div className="flex flex-col gap-5 p-4">
          {/* Preview */}
          {file.fileType === "image" ? (
            <Image
              src={file.url}
              alt={file.altText ?? file.filename}
              fill
              fit="contain"
              rounded="lg"
              containerClassName="bg-secondary-100 h-48"
            />
          ) : (
            <FileTypePreview file={file} />
          )}

          {/* File info */}
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-secondary-500">Loại:</span>
              <Badge variant="default" size="sm">{file.fileType}</Badge>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-secondary-500">Kích thước file:</span>
              <span className="text-secondary-800">{formatBytes(file.size)}</span>
            </div>
            {file.width && file.height && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-secondary-500">Kích thước ảnh:</span>
                <span className="text-secondary-800">{file.width} × {file.height}px</span>
              </div>
            )}
            <div className="flex items-center justify-between gap-2">
              <span className="text-secondary-500">Được dùng:</span>
              <span className="text-secondary-800">{file.usageCount} lần</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-secondary-500">Tải lên lúc:</span>
              <span className="text-secondary-800">{formatDate(file.uploadedAt)}</span>
            </div>
          </div>

          {/* URL copy */}
          <div className="flex gap-2">
            <input
              readOnly
              value={file.url}
              className="flex-1 truncate rounded-lg border border-secondary-200 bg-secondary-50 px-3 py-1.5 text-xs text-secondary-600"
            />
            <button
              type="button"
              onClick={handleCopyUrl}
              className="flex items-center gap-1 rounded-lg border border-secondary-200 px-2.5 py-1.5 text-xs text-secondary-600 hover:bg-secondary-100 transition-colors"
            >
              {copied
                ? <CheckIcon className="h-3.5 w-3.5 text-success-600" />
                : <ClipboardDocumentIcon className="h-3.5 w-3.5" />}
              {copied ? "Đã sao chép" : "Copy"}
            </button>
          </div>

          {/* Edit fields */}
          <div className="space-y-3">
            <Input
              label="Alt text"
              size="sm"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Mô tả ngắn về ảnh (SEO & accessibility)"
              helperText="Mô tả ngắn gọn nội dung ảnh cho SEO và trình đọc màn hình"
            />
            <Textarea
              label="Caption"
              size="sm"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Chú thích hiển thị bên dưới ảnh..."
              rows={2}
              autoResize
              maxCharCount={150}
              showCharCount
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-secondary-100">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<TrashIcon className="h-4 w-4" />}
              onClick={handleDelete}
              isLoading={isDeleting}
              className="text-error-600 hover:bg-error-50"
            >
              Xóa
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ArrowDownTrayIcon className="h-4 w-4" />}
                onClick={handleDownload}
              >
                Tải về
              </Button>
              <Button size="sm" onClick={handleSave} isLoading={isSaving}>
                Lưu
              </Button>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}
