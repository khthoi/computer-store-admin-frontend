"use client";

import { useCallback, useEffect, useState } from "react";
import { MagnifyingGlassIcon, CloudArrowUpIcon, PencilIcon } from "@heroicons/react/24/outline";
import { Modal } from "@/src/components/ui/Modal";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { useToast } from "@/src/components/ui/Toast";
import { FolderSidebar } from "./FolderSidebar";
import { MediaUploadModal } from "./MediaUploadModal";
import { getMediaFiles, updateMediaFile } from "@/src/services/content.service";
import { getMediaPreviewUrl, isRenderableImageFile, shouldContainImage } from "@/src/lib/media-file";
import type { MediaFile, MediaFolder, MediaFileType } from "@/src/types/content.types";

// ─── Media Edit Modal ─────────────────────────────────────────────────────────

function MediaEditModal({
  file,
  onClose,
  onUpdated,
}: {
  file: MediaFile;
  onClose: () => void;
  onUpdated: (updated: MediaFile) => void;
}) {
  const { showToast } = useToast();
  const [originalName, setOriginalName] = useState(file.originalName ?? "");
  const [altText, setAltText] = useState(file.altText ?? "");
  const [caption, setCaption] = useState(file.caption ?? "");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      const updated = await updateMediaFile(file.id, { originalName, altText, caption });
      onUpdated(updated);
      onClose();
      showToast("Đã lưu thông tin file.", "success");
    } catch {
      showToast("Lưu thông tin thất bại.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose}>Hủy</Button>
      <Button variant="primary" onClick={handleSave} isLoading={isSaving}>Lưu</Button>
    </>
  );

  return (
    <Modal isOpen onClose={onClose} title="Chỉnh sửa thông tin file" size="md" footer={footer} animated>
      <div className="flex flex-col gap-4 p-1">
        {/* Preview */}
        {isRenderableImageFile(file) && (
          <div className="flex h-36 items-center justify-center overflow-hidden rounded-lg bg-secondary-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getMediaPreviewUrl(file)}
              alt={file.altText ?? file.filename}
              className={`h-full w-full ${shouldContainImage(file) ? "object-contain p-2" : "object-cover"}`}
            />
          </div>
        )}

        <Input
          label="Tên file"
          size="sm"
          value={originalName}
          onChange={(e) => setOriginalName(e.target.value)}
          placeholder="Tên file hiển thị trong thư viện"
          helperText="Chỉ thay đổi tên hiển thị — URL không đổi"
        />
        <Input
          label="Alt text"
          size="sm"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          placeholder="Mô tả ngắn về ảnh (SEO & accessibility)"
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
    </Modal>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MediaPickerModalProps {
  open: boolean;
  onClose: () => void;
  /** Called with the picked file URL (single select mode) */
  onPick: (file: MediaFile) => void;
  /** Only show files of these types */
  allowedTypes?: MediaFileType[];
  title?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * MediaPickerModal — full media library browser in a modal for inline picking.
 *
 * Used by Banner form (image field), Article form (thumbnail, banner),
 * RichTextEditor (insert image), Static Page form, etc.
 *
 * ```tsx
 * <MediaPickerModal
 *   open={pickerOpen}
 *   onClose={() => setPickerOpen(false)}
 *   onPick={(file) => setImageUrl(file.url)}
 *   allowedTypes={["image"]}
 * />
 * ```
 */
export function MediaPickerModal({
  open,
  onClose,
  onPick,
  allowedTypes,
  title = "Chọn media",
}: MediaPickerModalProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<MediaFile | null>(null);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  const PAGE_SIZE = 48;

  const load = useCallback(async () => {
    setIsLoading(true);
    setPage(1);
    try {
      const result = await getMediaFiles({
        q: search,
        folderId: selectedFolderId,
        fileType: allowedTypes,
        page: 1,
        pageSize: PAGE_SIZE,
      });
      setFiles(result.data);
      setTotal(result.total);
      setFolders(result.folders);
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedFolderId, allowedTypes]);

  useEffect(() => {
    if (!open) return;
    load();
  }, [open, load]);

  function handlePick(file: MediaFile) {
    onPick(file);
    onClose();
  }

  function handleUploaded(newFiles: MediaFile[]) {
    setFiles((prev) => [...newFiles, ...prev]);
    setTotal((prev) => prev + newFiles.length);
  }

  function handleFileUpdated(updated: MediaFile) {
    setFiles((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  }

  function handleImgError(id: string) {
    setImgErrors((prev) => new Set(prev).add(id));
  }

  async function handleLoadMore() {
    const nextPage = page + 1;
    setIsLoadingMore(true);
    try {
      const result = await getMediaFiles({
        q: search,
        folderId: selectedFolderId,
        fileType: allowedTypes,
        page: nextPage,
        pageSize: PAGE_SIZE,
      });
      setFiles((prev) => [...prev, ...result.data]);
      setTotal(result.total);
      setPage(nextPage);
    } finally {
      setIsLoadingMore(false);
    }
  }

  return (
    <>
      <Modal isOpen={open} onClose={onClose} title={title} size="3xl" animated>
        <div className="flex h-[600px] overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 shrink-0 border-r border-secondary-100 overflow-y-auto">
            <FolderSidebar
              folders={folders}
              selectedFolderId={selectedFolderId}
              onSelect={setSelectedFolderId}
            />
          </div>

          {/* Main content */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-2 border-b border-secondary-100 px-4 py-2.5">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm file..."
                  className="w-full rounded-lg border border-secondary-200 bg-secondary-50 py-1.5 pl-8 pr-3 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/15"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<CloudArrowUpIcon className="h-4 w-4" />}
                onClick={() => setUploadOpen(true)}
              >
                Tải lên
              </Button>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {isLoading
                  ? Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="aspect-square animate-pulse rounded-lg bg-secondary-200" />
                    ))
                  : files.map((file) => (
                      <div
                        key={file.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handlePick(file)}
                        onMouseEnter={() => setHoveredId(file.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handlePick(file);
                          }
                        }}
                        className={[
                          "relative aspect-square flex items-center justify-center rounded-lg border overflow-hidden cursor-pointer transition-all",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                          hoveredId === file.id
                            ? "border-primary-400 ring-2 ring-primary-500/20"
                            : "border-secondary-200 bg-secondary-100",
                        ].join(" ")}
                      >
                        {isRenderableImageFile(file) && !imgErrors.has(file.id) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={getMediaPreviewUrl(file)}
                            alt={file.altText ?? file.filename}
                            className={`h-full w-full ${shouldContainImage(file) ? "object-contain p-1" : "object-cover"}`}
                            loading="lazy"
                            onError={() => handleImgError(file.id)}
                          />
                        ) : (
                          <span className="text-2xl">
                            {file.fileType === "video" ? "🎬" : file.fileType === "audio" ? "🎵" : file.fileType === "image" ? "🖼️" : "📄"}
                          </span>
                        )}
                        {/* Hover overlay */}
                        {hoveredId === file.id && (
                          <div className="absolute inset-0 bg-primary-600/10 flex items-end">
                            <p className="w-full truncate bg-primary-600/80 px-2 py-1 text-[10px] text-white">
                              {file.filename}
                            </p>
                          </div>
                        )}
                        {/* Edit button — top-right on hover */}
                        {hoveredId === file.id && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditTarget(file);
                            }}
                            className="absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-md bg-white/90 text-secondary-600 shadow-sm transition-colors hover:bg-white hover:text-primary-600"
                            title="Chỉnh sửa thông tin"
                          >
                            <PencilIcon className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
              </div>

              {!isLoading && !files.length && (
                <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
                  <p className="text-sm text-secondary-500">Không tìm thấy file nào</p>
                </div>
              )}

              {!isLoading && files.length < total && (
                <div className="flex justify-center pt-4 pb-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLoadMore}
                    isLoading={isLoadingMore}
                  >
                    {isLoadingMore ? "Đang tải..." : `Tải thêm (còn ${total - files.length})`}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Upload sub-modal */}
      <MediaUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        folderId={selectedFolderId}
        folderName={folders.find((f) => f.id === selectedFolderId)?.name}
        onUploaded={handleUploaded}
      />

      {/* Edit sub-modal */}
      {editTarget && (
        <MediaEditModal
          file={editTarget}
          onClose={() => setEditTarget(null)}
          onUpdated={handleFileUpdated}
        />
      )}
    </>
  );
}
