"use client";

import { FolderIcon, FolderOpenIcon } from "@heroicons/react/24/outline";
import type { MediaFolder } from "@/src/types/content.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FolderSidebarProps {
  folders: MediaFolder[];
  selectedFolderId: string | null | undefined;
  onSelect: (folderId: string | null) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * FolderSidebar — left-side folder tree for the media library.
 *
 * Shows "Tất cả" (null) at the top, then root-level folders.
 * Sub-folders are indented under their parent.
 */
export function FolderSidebar({ folders, selectedFolderId, onSelect }: FolderSidebarProps) {
  const rootFolders = folders.filter((f) => f.parentId === null);

  function FolderItem({ folder, depth = 0 }: { folder: MediaFolder; depth?: number }) {
    const children = folders.filter((f) => f.parentId === folder.id);
    const isSelected = selectedFolderId === folder.id;
    const Icon = isSelected ? FolderOpenIcon : FolderIcon;

    return (
      <>
        <button
          type="button"
          onClick={() => onSelect(folder.id)}
          style={{ paddingLeft: `${8 + depth * 12}px` }}
          className={[
            "flex w-full items-center gap-2 rounded-lg py-1.5 pr-2 text-left text-sm transition-colors",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
            isSelected
              ? "bg-primary-50 text-primary-700 font-medium"
              : "text-secondary-700 hover:bg-secondary-100",
          ].join(" ")}
        >
          <Icon className={`h-4 w-4 shrink-0 ${isSelected ? "text-primary-600" : "text-secondary-400"}`} />
          <span className="flex-1 truncate">{folder.name}</span>
          <span className="text-xs text-secondary-400">{folder.fileCount}</span>
        </button>
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

      {/* Divider */}
      <div className="my-1 border-t border-secondary-100" />

      {/* Root folders */}
      {rootFolders.map((folder) => (
        <FolderItem key={folder.id} folder={folder} />
      ))}
    </nav>
  );
}
