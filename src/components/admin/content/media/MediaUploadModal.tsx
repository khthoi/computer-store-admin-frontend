"use client";

import { useState, useCallback } from "react";
import { CloudArrowUpIcon, XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, ChevronDownIcon, FolderIcon } from "@heroicons/react/24/outline";
import { Modal } from "@/src/components/ui/Modal";
import { Button } from "@/src/components/ui/Button";
import { Spinner } from "@/src/components/ui/Spinner";
import { uploadMediaFile } from "@/src/services/content.service";
import type { MediaFile } from "@/src/types/content.types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UploadItem {
  id: string;
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  errorMessage?: string;
  preview?: string;
  result?: MediaFile;
  altText: string;
  caption: string;
  metaExpanded: boolean;
}

export interface MediaUploadModalProps {
  open: boolean;
  onClose: () => void;
  folderId?: string | null;
  folderName?: string;
  onUploaded?: (files: MediaFile[]) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

const ACCEPTED_TYPES = "image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx";
const MAX_SIZE_MB = 50;

// ─── Component ────────────────────────────────────────────────────────────────

export function MediaUploadModal({ open, onClose, folderId, folderName, onUploaded }: MediaUploadModalProps) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  function addFiles(fileList: FileList | File[]) {
    const newItems: UploadItem[] = Array.from(fileList).map((file) => {
      const item: UploadItem = {
        id: `${Date.now()}-${Math.random()}`,
        file,
        status: "pending",
        altText: "",
        caption: "",
        metaExpanded: false,
      };
      if (file.type.startsWith("image/")) {
        item.preview = URL.createObjectURL(file);
      }
      return item;
    });
    setItems((prev) => [...prev, ...newItems]);
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    addFiles(e.dataTransfer.files);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files);
    e.target.value = "";
  }, []);

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateItem<K extends keyof UploadItem>(id: string, key: K, value: UploadItem[K]) {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, [key]: value } : i));
  }

  async function handleUploadAll() {
    const pending = items.filter((i) => i.status === "pending");
    if (!pending.length) return;

    const results: MediaFile[] = [];

    for (const item of pending) {
      if (item.file.size > MAX_SIZE_MB * 1024 * 1024) {
        setItems((prev) => prev.map((i) => i.id === item.id
          ? { ...i, status: "error", errorMessage: `File quá lớn (tối đa ${MAX_SIZE_MB}MB)` }
          : i));
        continue;
      }

      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, status: "uploading" } : i));
      try {
        const result = await uploadMediaFile(item.file, {
          folderId,
          altText: item.altText.trim() || undefined,
          caption: item.caption.trim() || undefined,
        });
        results.push(result);
        setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, status: "success", result } : i));
      } catch {
        setItems((prev) => prev.map((i) => i.id === item.id
          ? { ...i, status: "error", errorMessage: "Tải lên thất bại" }
          : i));
      }
    }

    if (results.length) onUploaded?.(results);
  }

  function handleClose() {
    setItems([]);
    onClose();
  }

  const pendingCount = items.filter((i) => i.status === "pending").length;
  const isUploading = items.some((i) => i.status === "uploading");
  const allDone = items.length > 0 && items.every((i) => i.status === "success" || i.status === "error");

  return (
    <Modal isOpen={open} onClose={handleClose} title="Tải lên media" size="2xl" animated>
      <div className="flex flex-col gap-4 p-5">
        {/* Folder indicator */}
        <div className="flex items-center gap-2 rounded-lg border border-secondary-200 bg-secondary-50 px-3 py-2">
          <FolderIcon className="h-4 w-4 shrink-0 text-secondary-400" />
          <span className="text-xs text-secondary-500">Tải lên vào:</span>
          <span className="text-xs font-medium text-secondary-800">
            {folderName ?? "Thư mục mặc định"}
          </span>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={[
            "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors",
            isDragOver
              ? "border-primary-400 bg-primary-50"
              : "border-secondary-200 hover:border-secondary-300 bg-secondary-50",
          ].join(" ")}
        >
          <CloudArrowUpIcon className={`h-10 w-10 ${isDragOver ? "text-primary-500" : "text-secondary-400"}`} />
          <div>
            <p className="text-sm font-medium text-secondary-700">
              Kéo thả file vào đây hoặc{" "}
              <label className="cursor-pointer text-primary-600 hover:text-primary-700 underline">
                chọn file
                <input
                  type="file"
                  multiple
                  accept={ACCEPTED_TYPES}
                  className="sr-only"
                  onChange={handleFileInput}
                />
              </label>
            </p>
            <p className="mt-1 text-xs text-secondary-400">
              Hỗ trợ: ảnh, video, PDF, Word, Excel · Tối đa {MAX_SIZE_MB}MB/file
            </p>
          </div>
        </div>

        {/* File list */}
        {items.length > 0 && (
          <ul className="max-h-[420px] overflow-y-auto space-y-2">
            {items.map((item) => (
              <li key={item.id} className="rounded-lg border border-secondary-100 bg-white overflow-hidden">
                {/* File row */}
                <div className="flex items-center gap-3 px-3 py-2.5">
                  {/* Thumbnail */}
                  <div className="h-10 w-10 shrink-0 rounded overflow-hidden bg-secondary-100 flex items-center justify-center">
                    {item.preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.preview} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-lg">{item.file.type.startsWith("video/") ? "🎬" : "📄"}</span>
                    )}
                  </div>

                  {/* Name + size */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-secondary-700">{item.file.name}</p>
                    <p className="text-xs text-secondary-400">{formatBytes(item.file.size)}</p>
                    {item.errorMessage && (
                      <p className="text-xs text-error-600">{item.errorMessage}</p>
                    )}
                  </div>

                  {/* Expand meta / status / remove */}
                  <div className="flex items-center gap-1 shrink-0">
                    {item.status === "pending" && (
                      <button
                        type="button"
                        title={item.metaExpanded ? "Ẩn thông tin" : "Thêm alt text & caption"}
                        onClick={() => updateItem(item.id, "metaExpanded", !item.metaExpanded)}
                        className={[
                          "rounded p-1 text-secondary-400 hover:text-secondary-600 transition-colors",
                          item.metaExpanded ? "text-primary-500" : "",
                        ].join(" ")}
                      >
                        <ChevronDownIcon className={`h-4 w-4 transition-transform ${item.metaExpanded ? "rotate-180" : ""}`} />
                      </button>
                    )}
                    {item.status === "uploading" && <Spinner size="sm" />}
                    {item.status === "success" && <CheckCircleIcon className="h-5 w-5 text-success-600" />}
                    {item.status === "error" && <ExclamationCircleIcon className="h-5 w-5 text-error-500" />}
                    {item.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="rounded p-1 text-secondary-400 hover:text-error-500 transition-colors"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expandable meta inputs */}
                {item.status === "pending" && item.metaExpanded && (
                  <div className="border-t border-secondary-100 bg-secondary-50 px-3 py-3 space-y-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-secondary-600">
                        Alt text <span className="text-secondary-400 font-normal">(SEO & accessibility)</span>
                      </label>
                      <input
                        type="text"
                        value={item.altText}
                        onChange={(e) => updateItem(item.id, "altText", e.target.value)}
                        placeholder="Mô tả ngắn gọn nội dung ảnh..."
                        className="w-full rounded-lg border border-secondary-200 bg-white px-2.5 py-1.5 text-sm focus:border-primary-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-secondary-600">Caption</label>
                      <input
                        type="text"
                        value={item.caption}
                        onChange={(e) => updateItem(item.id, "caption", e.target.value)}
                        placeholder="Chú thích hiển thị bên dưới ảnh..."
                        className="w-full rounded-lg border border-secondary-200 bg-white px-2.5 py-1.5 text-sm focus:border-primary-400 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Success alt text preview */}
                {item.status === "success" && item.altText && (
                  <div className="border-t border-success-100 bg-success-50 px-3 py-1.5">
                    <p className="text-xs text-success-700">Alt: {item.altText}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-1 border-t border-secondary-100">
          <Button variant="ghost" size="sm" onClick={handleClose}>
            {allDone ? "Đóng" : "Hủy"}
          </Button>
          {!allDone && (
            <Button
              size="sm"
              onClick={handleUploadAll}
              disabled={pendingCount === 0 || isUploading}
              isLoading={isUploading}
              leftIcon={<CloudArrowUpIcon className="h-4 w-4" />}
            >
              Tải lên {pendingCount > 0 ? `(${pendingCount})` : ""}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
