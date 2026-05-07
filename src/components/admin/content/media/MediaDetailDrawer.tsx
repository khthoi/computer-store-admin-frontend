"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
import { Tooltip } from "@/src/components/ui/Tooltip";
import { useToast } from "@/src/components/ui/Toast";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
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

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Info row ─────────────────────────────────────────────────────────────────

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 border-b border-secondary-50 last:border-0">
      <span className="shrink-0 text-xs text-secondary-500 pt-0.5">{label}</span>
      <span className="text-xs text-secondary-800 text-right break-all">{children}</span>
    </div>
  );
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
  const [originalName, setOriginalName] = useState(file?.originalName ?? "");
  const [altText, setAltText] = useState(file?.altText ?? "");
  const [caption, setCaption] = useState(file?.caption ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  // Reset editable fields only when a different file is selected
  useEffect(() => {
    if (file) {
      setOriginalName(file.originalName ?? "");
      setAltText(file.altText ?? "");
      setCaption(file.caption ?? "");
    }
  }, [file?.id]);

  async function handleSave() {
    if (!file) return;
    setIsSaving(true);
    try {
      const updated = await updateMediaFile(file.id, { originalName, altText, caption });
      onUpdated?.(updated);
      showToast("Đã lưu thông tin file.", "success");
    } catch {
      showToast("Lưu thông tin thất bại.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!file) return;
    setIsDeleting(true);
    try {
      await deleteMediaFile(file.id);
      onDeleted?.(file.id);
      onClose();
      showToast("Đã xóa file thành công.", "success");
    } catch {
      showToast("Xóa file thất bại.", "error");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  function handleCopyUrl() {
    if (!file) return;
    navigator.clipboard.writeText(file.url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleDownload() {
    if (!file) return;
    try {
      const res = await fetch(file.url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = file.originalName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch {
      showToast("Tải về thất bại.", "error");
    }
  }

  const statusVariant: Record<string, "success" | "default"> = {
    active: "success",
    unused: "default",
  };

  const statusLabel: Record<string, string> = {
    active: "Đang dùng",
    unused: "Chưa dùng",
  };

  const typeLabel: Record<string, string> = {
    image: "Hình ảnh",
    video: "Video",
    document: "Tài liệu",
    audio: "Âm thanh",
  };

  return (
    <Drawer
      isOpen={Boolean(file)}
      onClose={onClose}
      title={file?.originalName ?? ""}
      size="xl"
    >
      {file && (
        <div className="flex flex-col gap-5 p-4">
          {/* Preview */}
          {file.fileType === "image" ? (
            <Image
              src={file.url}
              alt={file.altText ?? file.originalName}
              fill
              fit="contain"
              rounded="lg"
              containerClassName="bg-secondary-100 h-48"
            />
          ) : (
            <FileTypePreview file={file} />
          )}

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
              {copied ? "Đã sao chép" : "Copy URL"}
            </button>
          </div>

          {/* File metadata */}
          <div className="rounded-lg border border-secondary-100 bg-secondary-50 px-3 py-1">
            <InfoRow label="Thư mục">
              {file.folderName
                ? file.folderSlug
                  ? (
                    <Tooltip content={<span className="font-mono">/{file.folderSlug}</span>} placement="left">
                      <span className="cursor-default">{file.folderName}</span>
                    </Tooltip>
                  )
                  : file.folderName
                : <span className="italic text-secondary-400">Không có</span>
              }
            </InfoRow>
            <InfoRow label="MIME type">
              <code className="rounded bg-secondary-100 px-1 py-0.5 text-[10px]">{file.mimeType}</code>
            </InfoRow>
            <InfoRow label="Loại file">
              <Badge variant="default" size="sm">{typeLabel[file.fileType] ?? file.fileType}</Badge>
            </InfoRow>
            <InfoRow label="Trạng thái">
              <Badge variant={statusVariant[file.status] ?? "default"} size="sm">
                {statusLabel[file.status] ?? file.status}
              </Badge>
            </InfoRow>
            <InfoRow label="Kích thước file">{formatBytes(file.size)}</InfoRow>
            {file.width != null && file.height != null && (
              <InfoRow label="Kích thước ảnh">{file.width} × {file.height} px</InfoRow>
            )}
            {file.duration != null && (
              <InfoRow label="Thời lượng">{formatDuration(file.duration)}</InfoRow>
            )}
            <InfoRow label="Lượt sử dụng">{file.usageCount} lần</InfoRow>
            <InfoRow label="Người tải lên">
              <Tooltip content="Xem hồ sơ nhân viên" placement="left">
                <Link
                  href={`/employees/${file.uploadedById}`}
                  className="font-medium text-primary-600 underline-offset-2 hover:underline"
                >
                  {file.uploadedBy}
                </Link>
              </Tooltip>
            </InfoRow>
            <InfoRow label="Tải lên lúc">{formatDate(file.uploadedAt)}</InfoRow>
            <InfoRow label="Cập nhật lúc">{formatDate(file.updatedAt)}</InfoRow>
          </div>

          {/* Edit fields */}
          <div className="space-y-3">
            <Input
              label="Tên file gốc"
              size="sm"
              value={originalName}
              onChange={(e) => setOriginalName(e.target.value)}
              placeholder="Tên file hiển thị trong thư viện"
              helperText="Chỉ thay đổi tên hiển thị trong hệ thống — URL Cloudinary không đổi"
            />
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
              variant="outline"
              color="danger"
              size="sm"
              leftIcon={<TrashIcon className="h-4 w-4" />}
              onClick={() => setShowDeleteConfirm(true)}
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

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Xóa file"
        description={`Xóa file "${file?.originalName}"? Thao tác này không thể hoàn tác.`}
        confirmLabel="Xóa"
        variant="danger"
        isConfirming={isDeleting}
      />
    </Drawer>
  );
}
