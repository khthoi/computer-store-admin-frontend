"use client";

import { InboxIcon } from "@heroicons/react/24/outline";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { MediaCard } from "./MediaCard";
import type { MediaFile } from "@/src/types/content.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MediaGridProps {
  files: MediaFile[];
  isLoading?: boolean;
  selectedIds?: string[];
  selectable?: boolean;
  onSelect?: (file: MediaFile) => void;
  onOpen?: (file: MediaFile) => void;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <Skeleton className="aspect-square rounded-lg" />
          <Skeleton className="h-3 w-3/4 rounded" />
          <Skeleton className="h-3 w-1/2 rounded" />
        </div>
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * MediaGrid — responsive grid of MediaCard tiles.
 *
 * Handles loading state with skeletons and an empty state.
 */
export function MediaGrid({
  files,
  isLoading = false,
  selectedIds = [],
  selectable = false,
  onSelect,
  onOpen,
}: MediaGridProps) {
  if (isLoading) return <GridSkeleton />;

  if (!files.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <InboxIcon className="h-12 w-12 text-secondary-300" />
        <p className="text-sm text-secondary-500">Chưa có file nào trong thư mục này</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {files.map((file) => (
        <MediaCard
          key={file.id}
          file={file}
          selected={selectedIds.includes(file.id)}
          selectable={selectable}
          onSelect={onSelect}
          onClick={onOpen}
        />
      ))}
    </div>
  );
}
