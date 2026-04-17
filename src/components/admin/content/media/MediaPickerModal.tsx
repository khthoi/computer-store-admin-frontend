"use client";

import { useCallback, useEffect, useState } from "react";
import { MagnifyingGlassIcon, CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { Modal } from "@/src/components/ui/Modal";
import { Button } from "@/src/components/ui/Button";
import { FolderSidebar } from "./FolderSidebar";
import { MediaGrid } from "./MediaGrid";
import { MediaUploadModal } from "./MediaUploadModal";
import { getMediaFiles } from "@/src/services/content.service";
import type { MediaFile, MediaFolder, MediaFileType } from "@/src/types/content.types";

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
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getMediaFiles({
        q: search,
        folderId: selectedFolderId,
        fileType: allowedTypes,
        pageSize: 48,
      });
      setFiles(result.data);
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
                        {file.fileType === "image" ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={file.thumbnailUrl ?? file.url}
                            alt={file.altText ?? file.filename}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-2xl">
                            {file.fileType === "video" ? "🎬" : file.fileType === "audio" ? "🎵" : "📄"}
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
                      </div>
                    ))}
              </div>

              {!isLoading && !files.length && (
                <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
                  <p className="text-sm text-secondary-500">Không tìm thấy file nào</p>
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
        onUploaded={handleUploaded}
      />
    </>
  );
}
