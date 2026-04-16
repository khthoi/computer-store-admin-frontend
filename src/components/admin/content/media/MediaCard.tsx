"use client";

import {
  DocumentIcon,
  FilmIcon,
  MusicalNoteIcon,
  DocumentTextIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import type { MediaFile } from "@/src/types/content.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith("video/"))
    return <FilmIcon className="h-10 w-10 text-blue-400" />;
  if (mimeType.startsWith("audio/"))
    return <MusicalNoteIcon className="h-10 w-10 text-purple-400" />;
  if (mimeType === "application/pdf")
    return <DocumentTextIcon className="h-10 w-10 text-red-400" />;
  return <DocumentIcon className="h-10 w-10 text-secondary-400" />;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MediaCardProps {
  file: MediaFile;
  selected?: boolean;
  selectable?: boolean;
  onClick?: (file: MediaFile) => void;
  onSelect?: (file: MediaFile) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * MediaCard — grid thumbnail card for a single media file.
 *
 * In `selectable` mode a checkbox-style overlay appears on hover/select.
 * In normal mode, clicking opens the detail drawer.
 */
export function MediaCard({
  file,
  selected = false,
  selectable = false,
  onClick,
  onSelect,
}: MediaCardProps) {
  const isImage = file.fileType === "image";

  return (
    <div
      role={selectable ? "checkbox" : "button"}
      aria-checked={selectable ? selected : undefined}
      tabIndex={0}
      onClick={() => selectable ? onSelect?.(file) : onClick?.(file)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectable ? onSelect?.(file) : onClick?.(file);
        }
      }}
      className={[
        "group relative flex flex-col rounded-lg border overflow-hidden cursor-pointer transition-all duration-150",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
        selected
          ? "border-primary-500 ring-2 ring-primary-500/30 bg-primary-50"
          : "border-secondary-200 hover:border-secondary-300 bg-white hover:shadow-sm",
      ].join(" ")}
    >
      {/* Thumbnail */}
      <div className="relative aspect-square bg-secondary-100 flex items-center justify-center overflow-hidden">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={file.thumbnailUrl ?? file.url}
            alt={file.altText ?? file.filename}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <FileIcon mimeType={file.mimeType} />
        )}

        {/* Select overlay */}
        {selectable && (
          <div
            className={[
              "absolute inset-0 flex items-start justify-end p-1.5 transition-opacity duration-150",
              selected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
            ].join(" ")}
          >
            <CheckCircleIcon
              className={[
                "h-5 w-5 transition-colors",
                selected ? "text-primary-600" : "text-white drop-shadow",
              ].join(" ")}
            />
          </div>
        )}

        {/* Video/Duration badge */}
        {file.fileType === "video" && file.duration && (
          <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1 py-0.5 text-[10px] text-white font-mono tabular-nums">
            {Math.floor(file.duration / 60)}:{String(file.duration % 60).padStart(2, "0")}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-0.5 px-2 py-1.5">
        <p className="truncate text-xs font-medium text-secondary-700" title={file.filename}>
          {file.filename}
        </p>
        <p className="text-[11px] text-secondary-400">
          {formatBytes(file.size)}
          {file.width && file.height ? ` · ${file.width}×${file.height}` : ""}
        </p>
      </div>
    </div>
  );
}
