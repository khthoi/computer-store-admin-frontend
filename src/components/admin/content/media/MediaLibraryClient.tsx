"use client";

import { useCallback, useEffect, useState } from "react";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { FolderSidebar } from "./FolderSidebar";
import { MediaGrid } from "./MediaGrid";
import { MediaDetailDrawer } from "./MediaDetailDrawer";
import { MediaUploadModal } from "./MediaUploadModal";
import { FolderFormModal } from "./FolderFormModal";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import {
  getMediaFiles,
  getMediaFolders,
  createMediaFolder,
  updateMediaFolder,
  deleteMediaFolder,
} from "@/src/services/content.service";
import { useAuth } from "@/src/store/auth.store";
import { useToast } from "@/src/components/ui/Toast";
import type { MediaFile, MediaFolder, MediaFileType } from "@/src/types/content.types";

// ─── Filter options ───────────────────────────────────────────────────────────

const FILE_TYPE_FILTERS: { value: MediaFileType | "all"; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "image", label: "Ảnh" },
  { value: "video", label: "Video" },
  { value: "document", label: "Tài liệu" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function MediaLibraryClient() {
  const { state: authState } = useAuth();
  const isAdmin = authState.user?.roles?.includes("admin") ?? false;
  const { showToast } = useToast();

  const [files, setFiles] = useState<MediaFile[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<MediaFileType | "all">("all");
  const [detailFile, setDetailFile] = useState<MediaFile | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  // Folder CRUD state
  const [folderFormOpen, setFolderFormOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<MediaFolder | undefined>();
  const [deletingFolder, setDeletingFolder] = useState<MediaFolder | null>(null);
  const [isFolderDeleting, setIsFolderDeleting] = useState(false);

  const PAGE_SIZE = 48;

  const loadFiles = useCallback(async () => {
    setIsLoading(true);
    setPage(1);
    try {
      const result = await getMediaFiles({
        q: search,
        folderId: selectedFolderId ?? undefined,
        fileType: typeFilter === "all" ? undefined : [typeFilter],
        page: 1,
        pageSize: PAGE_SIZE,
      });
      setFiles(result.data);
      setTotal(result.total);
      setFolders(result.folders);
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedFolderId, typeFilter]);

  useEffect(() => { loadFiles(); }, [loadFiles]);

  async function handleLoadMore() {
    const nextPage = page + 1;
    setIsLoadingMore(true);
    try {
      const result = await getMediaFiles({
        q: search,
        folderId: selectedFolderId ?? undefined,
        fileType: typeFilter === "all" ? undefined : [typeFilter],
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

  async function reloadFolders() {
    const updated = await getMediaFolders();
    setFolders(updated);
  }

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

  function handleAddFolder() {
    setEditingFolder(undefined);
    setFolderFormOpen(true);
  }

  function handleEditFolder(folder: MediaFolder) {
    setEditingFolder(folder);
    setFolderFormOpen(true);
  }

  async function handleFolderFormSubmit(values: {
    tenHienThi: string;
    duongDan: string;
    moTa?: string;
    loaiChoPhep?: "all" | "image" | "video" | "raw";
    isActive?: boolean;
  }) {
    try {
      if (editingFolder) {
        await updateMediaFolder(editingFolder.id, values);
        showToast(`Đã cập nhật thư mục "${values.tenHienThi}"`, "success");
      } else {
        await createMediaFolder(values);
        showToast(`Đã tạo thư mục "${values.tenHienThi}"`, "success");
      }
      await reloadFolders();
    } catch {
      showToast(editingFolder ? "Cập nhật thư mục thất bại." : "Tạo thư mục thất bại.", "error");
      throw new Error();
    }
  }

  async function handleFolderDelete() {
    if (!deletingFolder) return;
    setIsFolderDeleting(true);
    try {
      await deleteMediaFolder(deletingFolder.id);
      if (selectedFolderId === deletingFolder.id) setSelectedFolderId(null);
      await reloadFolders();
      showToast(`Đã xoá thư mục "${deletingFolder.name}"`, "success");
    } catch {
      showToast("Xoá thư mục thất bại.", "error");
    } finally {
      setIsFolderDeleting(false);
      setDeletingFolder(null);
    }
  }

  return (
    <div className="flex h-full gap-0 overflow-hidden rounded-xl border border-secondary-200 bg-white">
      {/* Folder sidebar */}
      <div className="w-52 shrink-0 border-r border-secondary-100 overflow-y-auto">
        <FolderSidebar
          folders={folders}
          selectedFolderId={selectedFolderId}
          onSelect={setSelectedFolderId}
          onAddFolder={isAdmin ? handleAddFolder : undefined}
          onEditFolder={isAdmin ? handleEditFolder : undefined}
          onDeleteFolder={isAdmin ? (folder) => setDeletingFolder(folder) : undefined}
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
          {!isLoading && files.length < total && (
            <div className="flex justify-center pt-4 pb-2">
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
        folderName={folders.find((f) => f.id === selectedFolderId)?.name}
        onUploaded={handleUploaded}
      />

      {/* Folder form modal — admin only */}
      {isAdmin && (
        <FolderFormModal
          isOpen={folderFormOpen}
          onClose={() => setFolderFormOpen(false)}
          folder={editingFolder}
          existingPaths={folders.map((f) => f.slug)}
          onSubmit={handleFolderFormSubmit}
        />
      )}

      {/* Confirm delete folder — admin only */}
      {isAdmin && (
        <ConfirmDialog
          isOpen={deletingFolder != null}
          onClose={() => setDeletingFolder(null)}
          onConfirm={handleFolderDelete}
          title="Xoá thư mục"
          description={`Bạn có chắc chắn muốn xoá thư mục "${deletingFolder?.name}"? Hành động này không thể hoàn tác.`}
          confirmLabel="Xoá thư mục"
          variant="danger"
          isConfirming={isFolderDeleting}
        />
      )}
    </div>
  );
}
