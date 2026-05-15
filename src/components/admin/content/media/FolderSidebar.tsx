"use client";

import { FolderIcon, FolderOpenIcon, PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Tooltip } from "@/src/components/ui/Tooltip";
import type { MediaFolder } from "@/src/types/content.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FolderSidebarProps {
  folders: MediaFolder[];
  selectedFolderId: string | null | undefined;
  onSelect: (folderId: string | null) => void;
  onAddFolder?: () => void;
  onEditFolder?: (folder: MediaFolder) => void;
  onDeleteFolder?: (folder: MediaFolder) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FolderSidebar({
  folders,
  selectedFolderId,
  onSelect,
  onAddFolder,
  onEditFolder,
  onDeleteFolder,
}: FolderSidebarProps) {
  const rootFolders = folders.filter((f) => f.parentId === null);

  function FolderItem({ folder, depth = 0 }: { folder: MediaFolder; depth?: number }) {
    const children = folders.filter((f) => f.parentId === folder.id);
    const isSelected = selectedFolderId === folder.id;
    const Icon = isSelected ? FolderOpenIcon : FolderIcon;

    return (
      <>
        <div className="group relative flex w-full min-w-0 items-center">
          <Tooltip
            content={
              <div className="flex flex-col gap-0.5">
                <p className="font-semibold">{folder.name}</p>
                <p className="font-mono text-xs opacity-80">/{folder.slug}</p>
              </div>
            }
            placement="right"
          >
            <button
              type="button"
              onClick={() => onSelect(folder.id)}
              style={{ paddingLeft: `${8 + depth * 12}px` }}
              className={[
                "flex w-full min-w-0 items-center gap-2 rounded-lg py-1.5 pr-2 text-left text-sm transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                isSelected
                  ? "bg-primary-50 text-primary-700 font-medium"
                  : "text-secondary-700 hover:bg-secondary-100",
              ].join(" ")}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isSelected ? "text-primary-600" : "text-secondary-400"}`} />
              <span className="min-w-0 flex-1 truncate">{folder.name}</span>
              {(onEditFolder || onDeleteFolder) ? (
                <span className="shrink-0 text-xs text-secondary-400 group-hover:invisible">{folder.fileCount}</span>
              ) : (
                <span className="shrink-0 text-xs text-secondary-400">{folder.fileCount}</span>
              )}
            </button>
          </Tooltip>

          {/* Edit / Delete actions shown on hover */}
          {(onEditFolder || onDeleteFolder) && (
            <div className="absolute right-1 hidden items-center gap-0.5 group-hover:flex">
              {onEditFolder && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onEditFolder(folder); }}
                  className="rounded p-0.5 text-secondary-400 hover:bg-secondary-200 hover:text-secondary-700"
                  title="Sửa thư mục"
                >
                  <PencilIcon className="h-3.5 w-3.5" />
                </button>
              )}
              {onDeleteFolder && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder); }}
                  className="rounded p-0.5 text-secondary-400 hover:bg-red-100 hover:text-red-600"
                  title="Xóa thư mục"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {children.map((child) => (
          <FolderItem key={child.id} folder={child} depth={depth + 1} />
        ))}
      </>
    );
  }

  return (
    <nav className="flex flex-col gap-0.5 p-2">
      {/* All files */}
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={[
          "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
          selectedFolderId === null || selectedFolderId === undefined
            ? "bg-primary-50 text-primary-700 font-medium"
            : "text-secondary-700 hover:bg-secondary-100",
        ].join(" ")}
      >
        <FolderOpenIcon className="h-4 w-4 shrink-0 text-secondary-400" />
        <span className="flex-1">Tất cả</span>
      </button>

      {/* Divider + Add folder button */}
      <div className="my-1 flex items-center gap-1 border-t border-secondary-100 pt-1">
        <span className="flex-1 px-2 text-xs font-medium uppercase tracking-wide text-secondary-400">
          Thư mục
        </span>
        {onAddFolder && (
          <button
            type="button"
            onClick={onAddFolder}
            className="rounded p-1 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-700"
            title="Thêm thư mục"
          >
            <PlusIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Root folders */}
      {rootFolders.map((folder) => (
        <FolderItem key={folder.id} folder={folder} />
      ))}
    </nav>
  );
}
