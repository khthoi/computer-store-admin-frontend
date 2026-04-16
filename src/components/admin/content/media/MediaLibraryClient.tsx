"use client";

import { useCallback, useEffect, useState } from "react";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { FolderSidebar } from "./FolderSidebar";
import { MediaGrid } from "./MediaGrid";
import { MediaDetailDrawer } from "./MediaDetailDrawer";
import { MediaUploadModal } from "./MediaUploadModal";
import { getMediaFiles } from "@/src/services/content.service";
import type { MediaFile, MediaFolder, MediaFileType } from "@/src/types/content.types";

// ─── Filter options ───────────────────────────────────────────────────────────

const FILE_TYPE_FILTERS: { value: MediaFileType | "all"; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "image", label: "Ảnh" },
  { value: "video", label: "Video" },
  { value: "document", label: "Tài liệu" },
  { value: "audio", label: "Âm thanh" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function MediaLibraryClient() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<MediaFileType | "all">("all");
  const [detailFile, setDetailFile] = useState<MediaFile | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getMediaFiles({
        q: search,
        folderId: selectedFolderId ?? undefined,
        fileType: typeFilter === "all" ? undefined : [typeFilter],
        pageSize: 48,
      });
      setFiles(result.data);
      setTotal(result.total);
      setFolders(result.folders);
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedFolderId, typeFilter]);

  useEffect(() => { load(); }, [load]);

  function handleFileDeleted(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setTotal((prev) => prev - 1);
  }

  function handleFileUpdated(updated: MediaFile) {
    setFiles((prev) => prev.map((f) => f.id === updated.id ? updated : f));
    if (detailFile?.id === updated.id) setDetailFile(updated);
  }

  function handleUploaded(newFiles: MediaFile[]) {
    setFiles((prev) => [...newFiles, ...prev]);
    setTotal((prev) => prev + newFiles.length);
  }

  return (
    <div className="flex h-full gap-0 overflow-hidden rounded-xl border border-secondary-200 bg-white">
      {/* Folder sidebar */}
      <div className="w-52 shrink-0 border-r border-secondary-100 overflow-y-auto">
        <FolderSidebar
          folders={folders}
          selectedFolderId={selectedFolderId}
          onSelect={setSelectedFolderId}
        />
      </div>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-secondary-100 px-4 py-3">
          {/* Search */}
          <div className="relative">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm..."
              className="w-56 rounded-lg border border-secondary-200 bg-secondary-50 py-1.5 pl-3 pr-3 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/15"
            />
          </div>

          {/* Type filters */}
          <div className="flex items-center gap-1">
            {FILE_TYPE_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setTypeFilter(f.value)}
                className={[
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  typeFilter === f.value
                    ? "bg-primary-600 text-white"
                    : "bg-secondary-100 text-secondary-600 hover:bg-secondary-200",
                ].join(" ")}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-secondary-400">{total} file</span>
            <Button
              size="sm"
              leftIcon={<CloudArrowUpIcon className="h-4 w-4" />}
              onClick={() => setUploadOpen(true)}
            >
              Tải lên
            </Button>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <MediaGrid
            files={files}
            isLoading={isLoading}
            onOpen={setDetailFile}
          />
        </div>
      </div>

      {/* Detail drawer */}
      <MediaDetailDrawer
        file={detailFile}
        onClose={() => setDetailFile(null)}
        onDeleted={handleFileDeleted}
        onUpdated={handleFileUpdated}
      />

      {/* Upload modal */}
      <MediaUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        folderId={selectedFolderId}
        onUploaded={handleUploaded}
      />
    </div>
  );
}
